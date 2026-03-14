"""
Agent — calls the local LLM with 3 path-based patch tools.
The model specifies WHERE to change and WHAT value — no full-JSON replacement.
"""

import json
import os
import re
from typing import Any, Optional
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage

from models import CVData, AISettings
from tools import ALL_TOOLS
from memory import get_memory, add_to_memory

load_dotenv()

DEBUG = os.getenv("DEBUG", "0").strip() in ("1", "true", "yes")


def _build_model(settings: Optional[AISettings], plan_mode: bool) -> Any:
    """Build a ChatOpenAI model based on settings.
    
    Args:
        settings: AISettings containing provider, model, apiKey, baseUrl
        plan_mode: If True, use higher temperature for conversational mode
    
    Returns:
        ChatOpenAI model instance (with or without tools bound based on plan_mode)
    """
    # Default to LM Studio settings if no settings provided
    if settings is None:
        settings = AISettings(
            provider="lmstudio",
            model="qwen/qwen3.5-9b",
            apiKey="lm-studio",
            baseUrl="http://127.0.0.1:1234/v1"
        )
    
    # Determine base URL and API key based on provider
    if settings.provider == "lmstudio":
        base_url = settings.baseUrl or "http://localhost:1234/v1"
        api_key = settings.apiKey or "lm-studio"
    elif settings.provider == "ollama":
        base_url = settings.baseUrl or "http://localhost:11434"
        api_key = settings.apiKey or "ollama"
    elif settings.provider == "openrouter":
        base_url = "https://openrouter.ai/api/v1"
        api_key = settings.apiKey or "not-needed"
    elif settings.provider == "google-genai":
        # Google GenAI uses a different approach - we'll use OpenAI compatible API
        base_url = settings.baseUrl or "https://generativelanguage.googleapis.com/v1beta"
        api_key = settings.apiKey or "not-needed"
    else:
        # Default to OpenAI or custom settings
        base_url = settings.baseUrl or "https://api.openai.com/v1"
        api_key = settings.apiKey or "not-needed"
    
    # Determine temperature based on mode
    temperature = 0.8 if plan_mode else 0.3
    
    # Create the model
    model = ChatOpenAI(
        model=settings.model,
        base_url=base_url,
        api_key=api_key,
        temperature=temperature,
        max_tokens=2048,
    )
    
    # Always bind tools so plan mode can also generate pending actions
    model = model.bind_tools(ALL_TOOLS)
    
    return model


def _dbg_response(label: str, response) -> None:
    if not DEBUG:
        return
    sep = "=" * 60
    print(f"\n{sep}\n[DEBUG] {label}\n{sep}")
    if response.content:
        print("[DEBUG] Text output:")
        print(response.content)
    if response.tool_calls:
        for i, call in enumerate(response.tool_calls):
            print(f"[DEBUG] Tool call {i + 1}: {call['name']}")
            print(f"[DEBUG]   args: {json.dumps(call.get('args', {}), indent=2)[:600]}")
    else:
        print("[DEBUG] No tool calls.")
    print(f"{sep}\n")


def _resolve_path(obj: Any, path: str) -> Any:
    """Walk a dot-path with array indices and return the value, or None on failure."""
    segments = [
        int(s) if s.isdigit() else s
        for s in path.replace("[", ".").replace("]", "").split(".")
        if s
    ]
    node = obj
    for seg in segments:
        try:
            node = node[seg]
        except (KeyError, IndexError, TypeError):
            return None
    return node


def _build_cv_index(cv: CVData) -> str:
    """Return a compact reference showing every real path → current value."""
    lines = []
    h = cv.header
    lines += [
        f"  header.name               = {h.name!r}",
        f"  header.location           = {h.location!r}",
        f"  header.phone              = {h.phone!r}",
        f"  header.email              = {h.email!r}",
    ]
    for si, sec in enumerate(cv.sections):
        lines.append(
            f"\n  sections[{si}].type  = {sec.type!r}   sections[{si}].title = {sec.title!r}"
        )
        for ii, item in enumerate(sec.items):
            pfx = f"  sections[{si}].items[{ii}]"
            if sec.type == "summary":
                body_preview = (item.body or "")[:80].replace("\n", " ")
                lines.append(f"{pfx}.body = {body_preview!r}...")
            elif sec.type == "skills":
                for gi, sg in enumerate(item.skillGroups or []):
                    lines.append(
                        f"{pfx}.skillGroups[{gi}]  id={sg.id!r}  label={sg.label!r}  value={sg.value!r}"
                    )
            elif sec.type == "projects":
                lines.append(f"{pfx}.id={item.id!r}  .title={item.title!r}")
                for bi, b in enumerate(item.bullets or []):
                    lines.append(f"{pfx}.bullets[{bi}] = {b[:60]!r}")
            else:
                lines.append(
                    f"{pfx}.id={item.id!r}  .title={item.title!r}  .subtitle={item.subtitle!r}  .date={item.date!r}  .role={item.role!r}"
                )
    return "\n".join(lines)


_TOOL_GUIDE = """\
You have 5 tools. Choose the right one for each change:

┌─────────────────────────────────────────────────────────────────┐
│ set_field(path, value)                                          │
│   Set any string field to a new value.                          │
│   path examples:                                                │
│     "header.name"                                               │
│     "sections[1].items[0].subtitle"                             │
│     "sections[2].items[0].skillGroups[1].label"                 │
│     "sections[2].items[0].skillGroups[1].value"                 │
│     "sections[4].items[0].bullets[0]"                           │
├─────────────────────────────────────────────────────────────────┤
│ delete_at(path)                                                 │
│   Remove an element from an array (path must end with [index]). │
│   path examples:                                                │
│     "sections[2].items[0].skillGroups[3]"  ← remove skill row  │
│     "sections[4].items[2]"                 ← remove a project   │
│     "sections[4].items[0].bullets[1]"      ← remove a bullet    │
├─────────────────────────────────────────────────────────────────┤
│ append_item(collection_path, item_json)                         │
│   Push a new object to the END of any array.                    │
│   collection_path examples:                                     │
│     "sections[4].items"          → add a project                │
│     "sections[2].items[0].skillGroups"  → add a skill row       │
│     "sections[4].items[0].bullets"      → add a bullet          │
│   item_json: the object to append (string or object).           │
│     New skill rows need: {"id":"new-sg-X","label":"...","value":"..."} │
├─────────────────────────────────────────────────────────────────┤
│ add_section(section_type, title)                                │
│   Add a NEW section to the CV.                                  │
│   section_type: one of summary, education, skills,             │
│                 certifications, projects, awards, volunteering   │
│   title: the display title (e.g., "WORK EXPERIENCE")            │
│   Example: add_section(section_type="education",               │
│                        title="WORK EXPERIENCE")                  │
├─────────────────────────────────────────────────────────────────┤
│ delete_section(section_index)                                   │
│   Delete an entire section by its index (0-based).              │
│   section_index: the array index in sections[].                 │
│   Example: delete_section(section_index=3)                      │
└─────────────────────────────────────────────────────────────────┘

Rules:
- Always call tools — NEVER describe changes in text only.
- Call multiple tools in one response when needed (e.g. delete old + add new).
- Use EXACT paths from the CV Index below. Do NOT guess indices.
- For new items, make up a unique id like "new-proj-3" or "new-sg-5".
- For adding/removing sections, use add_section/delete_section tools.

RESTORING DELETED CONTENT (very important):
- When the user asks to restore/undo/add back a deleted section or item, check the
  conversation history for "Deleted item data" notes — the full original JSON is there.
- For a deleted SECTION: the restore sequence is:
    1. Call add_section(...) — this creates the section with one blank template item.
    2. WAIT for the tool result to see the new section's index (it will be appended at
       the end, so index = current section count).
    3. Call delete_at(path="sections[N].items[0]") to remove the blank template item.
    4. Call append_item(...) for EVERY original item from the deleted section data.
  Do all of steps 2-4 in the NEXT round after seeing the add_section result.
  Never leave a blank template item — always delete it before appending originals.
- For a deleted ITEM or BULLET: call append_item(...) with the original data from
  the deleted item note. Restore the full item, not a blank placeholder.
- If no deleted data is in history, say so — do not create blank placeholders.
"""


async def run_agent(
    session_id: str, instruction: str, cv: CVData, plan_mode: bool = True,
    settings: Optional[AISettings] = None
) -> dict:
    print(f"\n[agent] Session {session_id}: {instruction!r}")
    print(f"[agent] Using settings: provider={settings.provider if settings else 'default'}, model={settings.model if settings else 'default'}")

    # Build model based on settings
    model = _build_model(settings, plan_mode)

    history = get_memory(session_id)
    cv_index = _build_cv_index(cv)
    cv_dict: Any = cv.model_dump()

    if plan_mode:
        # Conversational plan mode - discuss changes before applying
        system_prompt = f"""You are a helpful CV writing assistant. The user wants to discuss changes to their CV before applying them.

Be conversational, friendly, and helpful. Discuss the user's request, offer suggestions, and explain what changes you would make. Ask clarifying questions if needed. Do not make any changes yet - just discuss the plan.

Current CV:
{cv_index}"""
    else:
        # Edit mode - apply changes with tools
        system_prompt = f"""You are an expert CV editor. Edit the user's CV by calling the patch tools below.

{_TOOL_GUIDE}

CV Index (exact current paths and values):
{cv_index}"""

    messages = [
        SystemMessage(content=system_prompt),
        *history,
        HumanMessage(content=instruction),
    ]

    # ── ReAct agentic loop ───────────────────────────────────────────────────
    MAX_ITER = 5
    actions: list[dict] = []
    deleted_log: list[str] = []
    response_text = ""
    first_response = True

    for iteration in range(MAX_ITER):
        response = await model.ainvoke(messages)
        print(f"[agent] Iteration {iteration + 1}: {len(response.tool_calls)} tool call(s)")
        _dbg_response(f"Iteration {iteration + 1}", response)

        # Extract readable text from first response only (that's what the user sees)
        if first_response:
            first_response = False
            raw_text = response.content or ""
            think_match = re.search(r"<think>(.*?)</think>", raw_text, re.DOTALL)
            if think_match:
                response_text = raw_text[think_match.end():].strip()
            else:
                response_text = raw_text.strip()

            # Plan mode: save conversational reply to memory now, before tools run
            if plan_mode:
                add_to_memory(session_id, instruction, response_text[:200])

        # No tool calls — nudge in edit mode, or stop
        if not response.tool_calls:
            if not plan_mode:
                # Nudge once: model described actions in text but didn't call tools
                nudge = (
                    "You described the next steps but did NOT call any tools. "
                    "You MUST call the tools now — use delete_at, append_item, "
                    "set_field, add_section, or delete_section. Do not describe, just call."
                )
                messages = messages + [
                    AIMessage(content=response.content or ""),
                    HumanMessage(content=nudge),
                ]
                response = await model.ainvoke(messages)
                print(f"[agent] Nudge on iter {iteration + 1}: {len(response.tool_calls)} tool call(s)")
                if not response.tool_calls:
                    print("[agent] Model still produced no tool calls — stopping loop")
                    if iteration == 0:
                        add_to_memory(session_id, instruction, "no tool call")
                        return {"actions": [], "content": response_text}
                    else:
                        break  # partial success — return what we have so far
                # Fall through to execute the tool calls from the nudged response
            else:
                # Plan mode or model is genuinely done — stop loop
                break

        # ── Execute all tool calls in this round ─────────────────────────────
        tool_messages: list[ToolMessage] = []

        for call in response.tool_calls:
            matching = next((t for t in ALL_TOOLS if t.name == call["name"]), None)
            if not matching:
                print(f"[agent] Unknown tool: {call['name']}")
                # Still need a ToolMessage or the next model call will error
                tool_messages.append(ToolMessage(
                    content=json.dumps({"action": "error", "message": f"Unknown tool: {call['name']}"}),
                    tool_call_id=call["id"],
                ))
                continue

            # Pre-capture deleted content for memory
            if call["name"] == "delete_at":
                path = call["args"].get("path", "")
                deleted_value = _resolve_path(cv_dict, path)
                if deleted_value is not None:
                    full_json = json.dumps(deleted_value, ensure_ascii=False)
                    deleted_log.append(f"  path={path!r} → {full_json}")
                    print(f"[agent] delete_at will remove: {full_json[:120]}")

            if call["name"] == "delete_section":
                section_index = call["args"].get("section_index", -1)
                sections = cv_dict.get("sections", [])
                if 0 <= section_index < len(sections):
                    deleted_section = sections[section_index]
                    full_json = json.dumps(deleted_section, ensure_ascii=False)
                    deleted_log.append(f"  sections[{section_index}] (full section) → {full_json}")
                    print(f"[agent] delete_section will remove section [{section_index}]: {full_json[:120]}")

            result_str = await matching.ainvoke(call["args"])
            tool_messages.append(ToolMessage(
                content=result_str,
                tool_call_id=call["id"],
            ))

            try:
                result = json.loads(result_str)
                if result.get("action") == "error":
                    print(f"[agent] Tool error: {result['message']}")
                else:
                    actions.append(result)
            except Exception as e:
                print(f"[agent] Unparseable tool result: {e}")

        # Feed model response + tool results back so the model can react
        messages = messages + [response] + tool_messages

    # ── Build memory summary ─────────────────────────────────────────────────
    action_parts = (
        ", ".join(
            a.get("action", "?") for a in actions if a.get("action") != "thinking"
        )
        or "no actions"
    )
    deleted_note = (
        "\nDeleted item data (use to restore if asked):\n" + "\n".join(deleted_log)
        if deleted_log
        else ""
    )
    add_to_memory(session_id, instruction, f"Applied: {action_parts}{deleted_note}")
    print(f"[agent] Returning {len(actions)} action(s): {action_parts}")
    print(f"[agent] Full actions payload: {actions}")
    return {"actions": actions, "content": response_text}
