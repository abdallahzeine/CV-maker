# AGENTS.md

## Commands

**Frontend** (`cv-maker/`):
```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build (typecheck is embedded in build)
npm run lint      # eslint .
```

**Backend** (`cv-maker-server/`):
```bash
python server.py  # FastAPI on port 3001 (uvicorn with reload)
```

There are no tests in either package. No `npm test` or pytest config exists.

## Architecture

Two independent packages with no shared build tooling or dependency management:
- `cv-maker/` — React 19 + Vite 8 + Tailwind v4 + React Compiler (experimental)
- `cv-maker-server/` — Python FastAPI, no `requirements.txt` or `pyproject.toml`

Backend Python dependencies (must be installed in your environment): `fastapi`, `uvicorn`, `pydantic`, `langchain-openai`, `langchain-core`, `python-dotenv`

### Data model contract (critical)

TypeScript types in `cv-maker/src/types/cv.types.ts` and Pydantic models in `cv-maker-server/models.py` **must stay in sync**. Currently they are ** intentionally diverged**: the frontend model includes `CVHeader.socialLinks`, `CVSection.layout`, `CVSection.schema`, and `CVData.template` — none of which exist in the backend. The backend only models the subset the AI agent patches. When changing either file, update the other if the change affects fields the agent reads or mutates.

### Backend is stateless

The full CV JSON is sent on every `/agent` request. The server only persists:
- Chat history — in-memory dict in `memory.py` (lost on restart)
- AI settings — `user_settings.json` file (do **not** commit this file)

### Frontend state

`App.tsx` owns all state, persisted to localStorage via `utils/settings.ts`. Agent responses return patch actions that `App.tsx` applies to local state.

## Key patterns

- **Patch tool system**: The AI agent uses 5 tools (`set_field`, `delete_at`, `append_item`, `add_section`, `delete_section`) with dot-notation paths (e.g., `sections[1].items[0].subtitle`). Defined in `tools.py`. Frontend applies these patches — never sends full CV back from the agent.
- **Plan vs Edit mode**: Plan mode (default) is conversational; Edit mode has the LLM call patch tools directly. Controlled by `planMode` flag in the request.
- **Tailwind v4**: Uses `@tailwindcss/vite` plugin, not a `tailwind.config.js` file. Do not create Tailwind v3-style config files.
- **React Compiler**: Enabled via `@rolldown/plugin-babel` with `reactCompilerPreset()` in `vite.config.ts`. Not standard React plugin config.
- **Drag-and-drop**: Uses `@dnd-kit` (core + sortable + utilities). Components use `useSortable` and `DndContext`.

## Gotchas

- `user_settings.json` is runtime state — do not commit changes to it.
- `.env` is gitignored but required for API keys if not using LM Studio defaults. The backend defaults to LM Studio at `http://127.0.0.1:1234/v1` when no settings are provided.
- CORS is `allow_origins=["*"]` — intentional for local dev, not production-ready.
- The frontend `build` script (`tsc -b && vite build`) embeds typechecking. If lint passes but `build` fails, it may be a TS error, not an ESLint issue.