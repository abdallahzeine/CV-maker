# Per-session chat history stored in memory
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage

_sessions: dict[str, list[BaseMessage]] = {}


def get_memory(session_id: str) -> list[BaseMessage]:
    if session_id not in _sessions:
        _sessions[session_id] = []
    return _sessions[session_id]


def add_to_memory(session_id: str, human: str, ai: str) -> None:
    history = get_memory(session_id)
    history.append(HumanMessage(content=human))
    history.append(AIMessage(content=ai))


def clear_memory(session_id: str) -> None:
    _sessions.pop(session_id, None)
    print(f"[memory] Cleared session {session_id}")
