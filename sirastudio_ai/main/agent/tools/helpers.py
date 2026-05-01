import uuid


VALID_SECTION_TYPES = {
    "summary", "work-experience", "education", "skills",
    "certifications", "projects", "awards", "volunteering",
    "custom", "spacer",
}

VALID_ICONS = {
    "github", "linkedin", "twitter", "globe", "mail", "phone",
    "portfolio", "youtube", "instagram", "facebook", "custom",
}

DEFAULT_LAYOUT = {
    "dateSlot": "right-inline",
    "iconStyle": "none",
    "separator": "none",
    "density": "compact",
    "columns": 1,
}


def _generate_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def _resolve_section_index(cv: dict, section_ref: int | str | None):
    sections = cv.get("sections", [])
    if isinstance(section_ref, int):
        return section_ref if 0 <= section_ref < len(sections) else None
    if isinstance(section_ref, str):
        if section_ref.isdecimal():
            idx = int(section_ref)
            if 0 <= idx < len(sections):
                return idx
        for idx, section in enumerate(sections):
            if section.get("id") == section_ref:
                return idx
    return None


def _resolve_item_index(section: dict, item_ref: int | str | None):
    items = section.get("items", [])
    if isinstance(item_ref, int):
        return item_ref if 0 <= item_ref < len(items) else None
    if isinstance(item_ref, str):
        if item_ref.isdecimal():
            idx = int(item_ref)
            if 0 <= idx < len(items):
                return idx
        for idx, item in enumerate(items):
            if item.get("id") == item_ref:
                return idx
    return None


def _normalize_text(value) -> str:
    return str(value or "").strip().lower()


def find_sections(cv: dict, query: str | None = None, type: str | None = None) -> list[dict]:
    query_text = _normalize_text(query)
    type_text = _normalize_text(type)
    matches = []
    for idx, section in enumerate(cv.get("sections", []) if isinstance(cv, dict) else []):
        if not isinstance(section, dict):
            continue
        title = _normalize_text(section.get("title"))
        section_type = _normalize_text(section.get("type"))
        if type_text and section_type != type_text:
            continue
        if query_text and query_text not in title and query_text not in section_type and query_text != _normalize_text(section.get("id")):
            continue
        matches.append({
            "section_idx": idx,
            "id": section.get("id"),
            "type": section.get("type"),
            "title": section.get("title"),
            "item_count": len(section.get("items", [])) if isinstance(section.get("items"), list) else 0,
        })
    return matches


def find_items(cv: dict, section_ref: int | str | None, query: str | None = None) -> list[dict]:
    section_idx = _resolve_section_index(cv, section_ref)
    if section_idx is None:
        return []
    section = cv.get("sections", [])[section_idx]
    query_text = _normalize_text(query)
    matches = []
    for item_idx, item in enumerate(section.get("items", [])):
        if not isinstance(item, dict):
            continue
        haystack = " ".join(
            _normalize_text(item.get(key))
            for key in ("id", "title", "subtitle", "role", "location", "date", "body")
        )
        if query_text and query_text not in haystack:
            continue
        matches.append({
            "section_idx": section_idx,
            "section_id": section.get("id"),
            "section_type": section.get("type"),
            "section_title": section.get("title"),
            "item_idx": item_idx,
            "id": item.get("id"),
            "title": item.get("title"),
            "subtitle": item.get("subtitle"),
            "role": item.get("role"),
            "date": item.get("date"),
        })
    return matches


def is_valid_cv_shape(cv: dict) -> bool:
    if not isinstance(cv, dict):
        return False
    if not isinstance(cv.get("header"), dict):
        return False
    if not isinstance(cv.get("sections"), list):
        return False
    if not isinstance(cv.get("template"), dict):
        return False
    for section in cv["sections"]:
        if not isinstance(section, dict):
            return False
        if not isinstance(section.get("id"), str):
            return False
        if not isinstance(section.get("type"), str):
            return False
        if not isinstance(section.get("title"), str):
            return False
        if not isinstance(section.get("items"), list):
            return False
        if not isinstance(section.get("layout"), dict):
            return False
    return True


def _check_section_item(cv: dict, section_idx: int | str, item_idx: int | str):
    sections = cv.get("sections", [])
    resolved_section_idx = _resolve_section_index(cv, section_idx)
    if resolved_section_idx is None:
        return None, f"No section matching {section_idx}."

    section = sections[resolved_section_idx]
    items = section.get("items", [])
    resolved_item_idx = _resolve_item_index(section, item_idx)
    if resolved_item_idx is None:
        return None, f"No item matching {item_idx} in section [{resolved_section_idx}]."
    return items[resolved_item_idx], None


_ITEM_CONTENT_KEYS = (
    "id",
    "title",
    "subtitle",
    "role",
    "location",
    "date",
    "body",
    "bullets",
    "skillGroups",
    "values",
)


def _indexed_item(item_idx: int, item: dict) -> dict:
    summary = {"item_idx": item_idx}
    for key in _ITEM_CONTENT_KEYS:
        if key in item:
            summary[key] = item[key]
    return summary


def _indexed_section(section_idx: int, section: dict) -> dict:
    return {
        "section_idx": section_idx,
        "id": section.get("id"),
        "type": section.get("type"),
        "title": section.get("title"),
        "items": [
            _indexed_item(item_idx, item)
            for item_idx, item in enumerate(section.get("items", []))
        ],
    }


def summarize_cv_for_agent(cv: dict) -> dict:
    """Return an indexed, editable-content snapshot for the LLM tool result."""
    sections = cv.get("sections", []) if isinstance(cv, dict) else []
    if not isinstance(sections, list):
        sections = []
    return {
        "revision": cv.get("revision") if isinstance(cv, dict) else None,
        "header": cv.get("header", {}) if isinstance(cv, dict) else {},
        "sections": [
            _indexed_section(section_idx, section)
            for section_idx, section in enumerate(sections)
        ],
    }
