import json
import os
from typing import Optional
from models import AISettings

SETTINGS_FILE = "user_settings.json"


def _load_db() -> dict:
    """Load the settings database from file."""
    if not os.path.exists(SETTINGS_FILE):
        return {}
    try:
        with open(SETTINGS_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}


def _save_db(db: dict) -> None:
    """Save the settings database to file."""
    with open(SETTINGS_FILE, "w") as f:
        json.dump(db, f, indent=2)


def get_settings(session_id: str) -> Optional[AISettings]:
    """Get settings for a session."""
    db = _load_db()
    if session_id in db:
        return AISettings(**db[session_id])
    return None


def save_settings(session_id: str, settings: AISettings) -> None:
    """Save settings for a session."""
    db = _load_db()
    db[session_id] = settings.model_dump()
    _save_db(db)


def delete_settings(session_id: str) -> None:
    """Delete settings for a session."""
    db = _load_db()
    if session_id in db:
        del db[session_id]
        _save_db(db)
