# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack CV (resume) maker with an AI-powered editing backend. Two main applications:
- **`cv-maker/`** — React + TypeScript frontend (Vite, Tailwind CSS)
- **`cv-maker-server/`** — Python FastAPI backend with LLM agent integration

There is also a standalone frontend at `C:\Users\abdallah\Desktop\CV-maker-frontend` (no AI features).

## Commands

### Frontend (`cv-maker/`)
```bash
npm run dev       # Start dev server (Vite)
npm run build     # Type-check + build to dist/
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Backend (`cv-maker-server/`)
```bash
python server.py  # Start FastAPI on port 3001
```

## Architecture

### Data Model (shared contract)

TypeScript types in [`cv-maker/src/types/cv.types.ts`](cv-maker/src/types/cv.types.ts) are mirrored exactly by Python Pydantic models in [`cv-maker-server/models.py`](cv-maker-server/models.py). Any type change must be reflected in both files.

```
CVData
  header: CVHeader (name, location, phone, email)
  sections: CVSection[]
    CVSection (id, type, title, items: CVItem[])
      CVItem (id, title, subtitle, date, role, bullets, skillGroups, body)
        SkillGroup (id, label, value)
```

### Frontend State Flow

[`App.tsx`](cv-maker/src/App.tsx) owns all CV state and persists it to localStorage via [`utils/settings.ts`](cv-maker/src/utils/settings.ts). The AI agent response returns a list of patch actions; `App.tsx` applies them to the local state (the backend is stateless with respect to CV data — the full CV is sent on every request).

### Backend Agent Architecture

**POST `/agent`** is the core endpoint. The flow:

1. [`server.py`](cv-maker-server/server.py) receives `AgentRequest` (sessionId, instruction, full CV, planMode, settings)
2. [`agent.py`](cv-maker-server/agent.py) builds a compact CV index (path → value reference) and runs a ReAct loop
3. The LLM calls structured tools instead of rewriting the full CV
4. Tool calls are collected and returned as a list of patch actions for the frontend to apply

**Two modes:**
- **Plan mode** (default): conversational planning, no CV mutations
- **Edit mode**: LLM calls patch tools directly

### Patch Tool System

[`tools.py`](cv-maker-server/tools.py) defines five tools using dot-notation paths:

| Tool | Purpose |
|---|---|
| `set_field(path, value)` | Set any string field |
| `delete_at(path)` | Remove an array element |
| `append_item(collection_path, item_json)` | Add to an array |
| `add_section(section_type, title)` | Append a new section |
| `delete_section(section_index)` | Remove a section |

Path examples: `header.name`, `sections[1].items[0].subtitle`, `sections[2].items[0].skillGroups[1].value`

### Session Management

- Chat history is kept in an in-memory dict keyed by `sessionId` ([`memory.py`](cv-maker-server/memory.py))
- Per-session LLM provider settings are stored in [`user_settings.json`](cv-maker-server/user_settings.json) via [`settings_store.py`](cv-maker-server/settings_store.py)
- **DELETE `/session/{session_id}`** clears both

### Multi-Provider LLM Support

The backend supports OpenAI, LM Studio, Ollama, OpenRouter, and Google GenAI. Provider/model/apiKey/baseUrl are sent per-request via `AISettings` and stored per session. See `agent.py` for provider switching logic.

### Frontend Component Map

- [`Chat.tsx`](cv-maker/src/components/Chat.tsx) — chat/toolbar panel (sends instructions to `/agent`)
- [`Template.tsx`](cv-maker/src/components/Template.tsx) — renders the CV for display and print
- [`SectionModal.tsx`](cv-maker/src/components/SectionModal.tsx) — add/edit section dialog
- [`links/`](cv-maker/src/components/links/) — social links management with favicon fetching

Drag-and-drop reordering uses `@dnd-kit` (core, sortable, utilities).
