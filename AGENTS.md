# Repository Instructions

## Project Layout
- `SiraStudio/` is the React 19 + TypeScript + Vite 8 frontend; run npm commands there, not at repo root.
- `sirastudio_ai/` is the Django 6 + django-ninja backend for the AI CV editing agent.
- Vite proxies `/api` to `http://127.0.0.1:8000`; run the Django server there for AI features.
- Trust executable config/scripts over README prose; the README omits the `SiraStudio/` working directory.

## Commands
- Frontend setup/dev: `cd SiraStudio`, `npm install`, `npm run dev`.
- Frontend verification: `npm run lint` and `npm run build` (`tsc -b && vite build`).
- Frontend tests: `npm run test:functions` only targets `tests/functions/**/*.test.ts`; no tracked tests currently exist there.
- E2E scripts exist (`npm run test:e2e*`), but no Playwright config or tests are present in the repo.
- Backend setup/dev: `cd sirastudio_ai`, create/activate `venv`, `pip install -r requirements.txt`, `python manage.py runserver 127.0.0.1:8000`.
- Backend smoke check: `python manage.py check` from `sirastudio_ai/`.

## Frontend Notes
- Entry is `SiraStudio/src/main.tsx`; it creates the CV store, optionally installs `window.cvMaker`, then renders `App`.
- `window.cvMaker` is installed only when `VITE_ENABLE_EXTERNAL_API` is truthy.
- CV state is a `CVDocument` wrapper (`schemaVersion`, `revision`, `data`, `meta`); most UI edits `doc.data` via store patches.
- Use store `dispatch` patches for CV mutations; patch paths use forms like `header.name`, `sections[0].items[-1]`, where `[-1]` appends for inserts.
- Browser persistence keys are `cv-maker-cv-data`, `cv-maker-snapshots`, and `cv-maker-assistant-thread-id`.
- React Compiler is enabled in `vite.config.ts` via `@rolldown/plugin-babel` and `reactCompilerPreset`; do not add memoization by habit.
- Tailwind 4 is wired through `@tailwindcss/vite` and `src/index.css`; no separate Tailwind config was found.

## API And Agent Notes
- Frontend AI flow is `SiraStudio/src/api/agent-stream.ts` -> `SiraStudio/src/api/agent.ts`.
- `POST /api/agent/edit` returns `{ job_id }`, not an edited CV; frontend polls `GET /api/agent/jobs/{job_id}` until `completed` or `failed`.
- Completed agent CV payloads must pass `isValidCVData` before replacing frontend state.
- Backend routes are mounted in `sirastudio_ai/sirastudio_ai/urls.py` under `/api/agent`.
- Job records live in `Path.home()/.cv-maker/agent-jobs.sqlite`, separate from Django `db.sqlite3`.
- LangGraph checkpoints live in `Path.home()/.cv-maker/agent-memory.sqlite`; `CV_MAKER_STORE=sqlite` enables `agent-store.sqlite`.
- Backend env knobs found in code: `CV_MAKER_JOB_WORKERS` and `CV_MAKER_STORE`.
- The LLM client targets local LM Studio-compatible `http://127.0.0.1:1234/v1` with model `qwen3.5-4b`; agent requests need that server.
- `manage.py` loads `sirastudio_ai/.env`; do not read, edit, or commit that file unless explicitly requested.

## Boundaries
- ESLint forbids React/React DOM imports in store core modules listed in `SiraStudio/eslint.config.js`.
- `src/print/**` must not import editor modules or dnd-kit.
- `src/editor/**` must not use `dangerouslySetInnerHTML`.
- Keep ignored local artifacts out of commits: `sirastudio_ai/.env`, `sirastudio_ai/venv/`, `sirastudio_ai/agent.log`, `SiraStudio/node_modules/`, `SiraStudio/dist/`, `.kilo/`.
- Root `.gitignore` ignores new markdown by default; add explicit exceptions for docs that must be tracked.
