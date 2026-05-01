# API Layer and Backend Agent Improvement Plan

Date: 2026-05-01

Scope: current polling-based API layer and backend CV editing agent. This plan intentionally keeps the existing HTTP job API and does not add SSE or websocket transport.

## Current Implementation Snapshot

### Frontend API Layer

- `SiraStudio/src/api/agent.ts`
  - Creates an agent edit job with `POST /api/agent/edit`.
  - Polls `GET /api/agent/jobs/{job_id}` until `completed`, `failed`, or timeout.
  - Validates the completed CV with `isValidCVData` before applying it.
- `SiraStudio/src/api/agent-stream.ts`
  - Implements an `@assistant-ui/react` `ChatModelAdapter`.
  - Extracts the last user text message.
  - Calls `editCV`, applies the returned CV, and yields a final assistant text message.

### Backend API and Job Layer

- `sirastudio_ai/main/api.py`
  - Exposes `/api/agent/edit`, `/api/agent/jobs/{job_id}`, and `/api/agent/health`.
  - Returns a job id immediately from edit requests.
- `sirastudio_ai/main/jobs.py`
  - Stores jobs in SQLite under the user home directory.
  - Runs jobs in a process-local `ThreadPoolExecutor`.
  - Persists status, CV JSON, reply, run id, error, and revision mismatch flag.
- `sirastudio_ai/main/middleware.py`
  - Logs agent requests and job polling.
  - Computes CV diffs when a response contains a completed CV.

### Backend Agent

- `sirastudio_ai/main/agent/core.py`
  - Uses a LangGraph state graph with load, agent, tools, feedback, verification, and finalize nodes.
  - Enforces read-before-edit and post-edit verification.
  - Tracks tool errors and stops after bounded retries.
- `sirastudio_ai/main/agent/prompts.py`
  - Holds system prompt, workflow guard prompts, and recovery prompts.
- `sirastudio_ai/main/agent/tools/*`
  - Provides CV read/update tools for header, sections, and items.
  - `read_cv` returns an indexed snapshot to reduce section/item targeting errors.

## Goals

1. Make the API contract boring and explicit.
2. Prevent malformed agent output from corrupting the frontend CV state.
3. Make job execution resilient to dev reloads and production process restarts.
4. Improve agent edit quality, especially full CV import, section matching, and safe merges.
5. Add tests around the exact bugs already seen: job polling with `cv: null`, invalid CV payloads, and agent tool workflow loops.
6. Keep the user experience responsive using polling, without adding SSE or websocket.

## Non-Goals

- No SSE or websocket implementation.
- No redesign of the chat UI.
- No replacement of LangGraph.
- No broad frontend layout refactor.
- No migration to a distributed task queue until the current job API is stable.

## Phase 1 - Stabilize the API Contract

Priority: P0

### 1.1 Share Response Shape Names Across Layers

Problem:
Frontend and backend drifted: the frontend previously expected `/edit` to return `{ cv, reply }`, while backend returned `{ job_id }`.

Plan:
- Rename frontend types to match backend terms:
  - `AgentJobCreateResponse`
  - `AgentJobStatusResponse`
  - `AgentEditResult`
- Mirror backend field names exactly: `job_id`, `run_id`, `revision_mismatch`.
- Add a short comment above `editCV` that documents the polling flow.

Acceptance:
- A future reader can understand the full request lifecycle from `agent.ts` without opening backend files.
- Type names make it hard to confuse job creation with completed edit output.

### 1.2 Validate Job Status Responses

Problem:
`fetchJson<T>` trusts parsed JSON. Runtime validation only happens for completed `cv`.

Plan:
- Add small runtime validators in `agent.ts`:
  - `isJobCreateResponse`
  - `isJobStatusResponse`
- Reject unknown payloads with clear errors.
- Keep validation local and lightweight; avoid adding a new schema library unless the project already adopts one.

Acceptance:
- Missing `job_id`, missing `status`, or non-object JSON produces a controlled frontend error.
- No invalid response can become assistant text or CV state.

### 1.3 Add Abort Support to Polling

Problem:
The polling loop cannot be cancelled if the user cancels the assistant run, closes the panel, or starts another request.

Plan:
- Thread `AbortSignal` from `ChatModelRunOptions` into `editCV`.
- Pass `signal` to `fetch`.
- Make `delay` abortable.
- Treat aborts as cancellation, not user-facing agent failure.

Acceptance:
- Cancelling assistant-ui run stops polling quickly.
- No dangling poll loop continues after cancellation.

### 1.4 Return Consistent Backend Status Codes

Problem:
`job_status` returns status `"failed"` for unknown jobs with HTTP 200.

Plan:
- Consider returning HTTP 404 for unknown job ids.
- If keeping 200 for UI simplicity, add `error_code: "JOB_NOT_FOUND"` to the response schema.
- Document the chosen behavior in `EXTERNAL_API.md`.

Acceptance:
- Frontend can distinguish missing jobs from agent execution failures.

## Phase 2 - Make Jobs Durable and Predictable

Priority: P0

### 2.1 Handle Dev Reload and Executor Shutdown

Problem:
Observed error: `cannot schedule new futures after shutdown`.

Likely cause:
Django dev autoreload or process lifecycle invalidates the module-level executor while requests still arrive.

Plan:
- Wrap `_EXECUTOR.submit(...)` in a controlled failure path.
- If submit fails, mark the job as failed with a clear error and return the job id normally.
- Add `ensure_executor()` that recreates the executor if it was shut down.
- Log a specific event: `AGENT_JOB_SUBMIT_FAILED`.

Acceptance:
- `/api/agent/edit` never crashes because the executor is shut down.
- Job status clearly reports scheduler failure.
- Retrying from the UI works without restarting the whole app.

### 2.2 Add Job Timestamps to API Response

Problem:
The frontend only knows status, not age or progress.

Plan:
- Include `created_at` and `updated_at` in `JobStatusResponse`.
- Keep them as ISO strings from SQLite.
- Use them later for UI timeout hints and stale job cleanup.

Acceptance:
- Polling response can explain how long a job has been running.

### 2.3 Add Stale Job Cleanup

Problem:
SQLite job table grows forever and old queued/running jobs can survive crashes.

Plan:
- On `_init_db`, mark jobs stuck in `queued` or `running` older than a threshold as failed.
- Add env var:
  - `CV_MAKER_JOB_STALE_MINUTES`, default 30.
- Optionally delete completed/failed jobs older than a longer retention window.

Acceptance:
- After a server restart, stale jobs do not sit in `running` forever.

### 2.4 Persist Original Request Metadata

Problem:
Jobs store full input CV and message, but status responses do not expose enough debugging context.

Plan:
- Store and expose safe metadata:
  - `thread_id`
  - `message_preview`
  - `created_at`
  - `updated_at`
  - `attempt_count` when retries are introduced.
- Do not expose full prompt or full CV from status unless completed.

Acceptance:
- Logs and UI can correlate a job without leaking the full CV on intermediate status.

## Phase 3 - Improve Backend API Schemas

Priority: P1

### 3.1 Strengthen `EditRequest`

Problem:
`cv: dict` accepts malformed CVs and pushes validation burden downstream.

Plan:
- Add backend CV shape validation before job creation.
- Validate at minimum:
  - `header` is object
  - `sections` is list
  - `template` is object
  - each section has `id`, `type`, `title`, `items`, `layout`
- Return 422 with a clear validation message.

Acceptance:
- Backend rejects malformed CVs before storing or scheduling jobs.

### 3.2 Normalize Revision Handling

Problem:
The agent checks `cv.revision`, but frontend CV data may not contain revision because revision lives in the store document, not CV data.

Plan:
- Decide where revision belongs in the API:
  - Option A: include `revision` as top-level request field.
  - Option B: embed revision into CV payload before sending.
- Prefer Option A:
  - `EditRequest.revision: int | None`
  - Store job `input_revision`
  - Return `revision_mismatch` only when comparing the same explicit value.

Acceptance:
- Revision mismatch is meaningful and not silently disabled.

### 3.3 Add OpenAPI Examples

Problem:
The API is easy to misuse because `/edit` is async but named like a direct edit endpoint.

Plan:
- Add request and response examples to Ninja schema metadata or `EXTERNAL_API.md`.
- Show:
  - create job
  - poll queued/running
  - poll completed
  - poll failed

Acceptance:
- Contract drift is less likely when frontend/backend are changed separately.

## Phase 4 - Improve Agent Workflow Quality

Priority: P1

### 4.1 Add an Explicit Intent Classification Step

Problem:
The same prompt handles small edits, full CV import, rewrites, deletion, and layout edits.

Plan:
- Add a lightweight deterministic node before the agent or inside `_load_state` that classifies request shape:
  - `small_edit`
  - `full_cv_import`
  - `rewrite_existing`
  - `delete_or_destructive`
  - `layout_request`
  - `unclear`
- Feed this as workflow state prompt.
- Do not use another LLM call unless needed; use simple text heuristics first.

Acceptance:
- Full resume paste gets different instructions than "improve summary".
- Destructive requests can trigger a safer confirmation response.

### 4.2 Add Full CV Import Tools

Problem:
Large pasted CV content may cause the agent to remove and rebuild sections through generic tools, which is fragile.

Plan:
- Add a dedicated `replace_cv_content` or `upsert_cv_from_structured_payload` tool after careful schema design.
- Keep tool responsibility narrow:
  - update header
  - replace sections with valid section objects
  - preserve template unless user asks otherwise
- Add validation before applying replacement.

Acceptance:
- Full CV paste can be applied in one validated operation.
- Existing template/layout can be preserved by default.

### 4.3 Add Section and Item Resolver Helpers

Problem:
The LLM still decides section/item ids from text.

Plan:
- Add backend helper functions exposed through tools:
  - `find_sections(type?: str, title?: str)`
  - `find_items(section_ref, query)`
- Return concise candidates with ids and indices.
- Update prompt to prefer resolver tools when target is ambiguous.

Acceptance:
- Fewer invalid id/index retries.
- Better behavior when users refer to section titles casually.

### 4.4 Add Tool Result Metadata

Problem:
Tool responses are plain strings, making error detection dependent on text matching.

Plan:
- Return structured JSON from tools:
  - `ok: bool`
  - `action: str`
  - `message: str`
  - `changed_paths: list[str]`
  - `error_code?: str`
- Update `_is_tool_error` to parse JSON first and fallback to text.

Acceptance:
- Tool feedback is reliable and easier to log.
- Agent recovery can branch by `error_code`.

### 4.5 Better Final Reply Extraction

Problem:
`_extract_reply` only looks at the last AI message. Guard/finalize nodes can influence output.

Plan:
- Track explicit final reply in metadata or final node.
- Ignore internal guard messages.
- If the graph ends after tool verification with no natural language reply, generate a deterministic fallback summary from changed paths.

Acceptance:
- User always gets a useful reply.
- Internal workflow text never leaks.

## Phase 5 - Observability and Debuggability

Priority: P1

### 5.1 Structured Agent Logs

Problem:
Logs are readable but hard to query.

Plan:
- Keep the current line logs, but make key fields consistent:
  - `event`
  - `thread_id`
  - `job_id`
  - `run_id`
  - `status`
  - `duration_ms`
  - `tool_names`
  - `error_code`
- Avoid logging full CVs.

Acceptance:
- A single job can be traced across create, start, tool calls, done, and poll.

### 5.2 Store Agent Run Diagnostics

Problem:
When a job fails, only the error string is stored.

Plan:
- Add `diagnostics_json` column to `agent_jobs`.
- Store:
  - tool names
  - tool error count
  - workflow failed reason
  - model name
  - duration
- Return diagnostics only in development or admin mode.

Acceptance:
- Failures can be diagnosed without reproducing immediately.

### 5.3 Add Health Details

Problem:
`/health` only returns `ok`.

Plan:
- Add optional details:
  - database reachable
  - executor accepting jobs
  - model base URL configured
  - store mode
- Keep sensitive values hidden.

Acceptance:
- UI or developer can distinguish API-up from agent-ready.

## Phase 6 - Testing Plan

Priority: P0/P1

### 6.1 Backend Unit Tests

Add tests for:
- `_compute_cv_diff(None, None)` does not crash.
- job status with `cv=None` returns 200.
- unknown job id behavior.
- stale job cleanup.
- executor submit failure.
- CV schema validation.
- agent route guards:
  - edit before read routes to block
  - read routes to tools
  - edit routes to verification
  - repeated tool errors finalize safely

### 6.2 Frontend Unit Tests

Add tests for:
- `editCV` creates a job and polls until completed.
- `editCV` rejects failed jobs with useful error.
- `editCV` rejects completed jobs with invalid CV.
- polling timeout.
- abort cancellation.
- assistant adapter always yields text.

### 6.3 Integration Smoke Tests

Add a lightweight integration test that:
1. Starts backend test server.
2. Posts a small CV edit request.
3. Polls until terminal status.
4. Verifies completed response shape.

For local developer speed, allow the LLM call to be mocked.

Acceptance:
- The exact contract between frontend and backend is exercised.
- No test depends on SSE or websocket.

## Phase 7 - Frontend UX Improvements Within Polling

Priority: P2

### 7.1 Better Progress Messages

Problem:
Polling has no intermediate user feedback besides assistant-ui running state.

Plan:
- Map job statuses to simple local UI states:
  - queued: "Queued..."
  - running: "Editing..."
  - completed: final reply
  - failed: error message
- Keep this local to the adapter or assistant panel.

Acceptance:
- User sees that the request is alive during long agent calls.

### 7.2 Retry Failed Jobs Cleanly

Problem:
A failed job currently becomes an assistant error, but retry behavior is generic.

Plan:
- Include job id in the thrown error message during development.
- Allow assistant-ui reload to submit a new job with the same latest user message.
- Avoid reusing failed job ids.

Acceptance:
- A transient backend failure can be retried from the chat.

### 7.3 Guard Against Duplicate Submits

Problem:
Double-submit can create multiple agent jobs against the same CV revision.

Plan:
- Disable send while `thread.isRunning`.
- In adapter, reject empty messages.
- Optionally include `client_request_id` for idempotency.

Acceptance:
- User cannot accidentally create duplicate jobs through rapid clicks.

## Suggested Implementation Order

1. Phase 1.2 and 1.3: response validation and abortable polling.
2. Phase 2.1: executor lifecycle hardening.
3. Phase 3.1 and 3.2: backend request validation and explicit revision.
4. Phase 6.1 and 6.2: tests around the bugs already found.
5. Phase 4.1 and 4.2: intent classification and full CV import tool.
6. Phase 5.1 and 5.2: structured logs and diagnostics.
7. Phase 7: UX polish on top of the stable polling contract.

## Definition of Done

- Frontend and backend response types match documented API examples.
- No job polling response can crash middleware.
- No invalid agent result can replace the frontend CV.
- Agent jobs survive normal dev reload/retry scenarios gracefully.
- Backend has tests for job lifecycle and agent graph routing.
- Frontend has tests for create-and-poll behavior.
- Full CV paste works through a validated path and preserves template/layout unless requested.
- Logs can trace one edit from browser request to agent completion.
