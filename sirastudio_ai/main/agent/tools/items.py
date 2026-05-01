from typing import Annotated

from langchain.tools import tool
from langgraph.prebuilt import InjectedState

from .helpers import _check_section_item, _generate_id, _resolve_section_index


@tool
def add_item(
    cv: Annotated[dict, InjectedState("cv")],
    section_idx: int | str,
    item_json: dict,
) -> str:
    """Add a new item to a section. item_json should include an 'id' field; one will be generated if missing.
    Populate fields based on the section type at cv['sections'][section_idx]['type'].
    For work-experience: title, subtitle, location, date, bullets.
    For education: title, subtitle, date.
    For projects: title, bullets, date.
    For skills: skillGroups (list of {label, value}).
    For summary: body.
    For custom: values (dict).
    """
    sections = cv.get("sections", [])
    resolved_section_idx = _resolve_section_index(cv, section_idx)
    if resolved_section_idx is None:
        return f"Cannot add item: no section matching {section_idx}."
    if "id" not in item_json:
        item_json["id"] = _generate_id("item")
    sections[resolved_section_idx].setdefault("items", []).append(item_json)
    sec_title = sections[resolved_section_idx]["title"]
    return f"Added item to section [{resolved_section_idx}] '{sec_title}'."


@tool
def remove_item(
    cv: Annotated[dict, InjectedState("cv")],
    section_idx: int | str,
    item_idx: int | str,
) -> str:
    """Remove an item from a section by section index and item index (0-based)."""
    sections = cv.get("sections", [])
    resolved_section_idx = _resolve_section_index(cv, section_idx)
    if resolved_section_idx is None:
        return f"Cannot remove item: no section matching {section_idx}."
    items = sections[resolved_section_idx].get("items", [])
    if not items:
        return f"Cannot remove item: no item matching {item_idx} in section [{resolved_section_idx}]."
    item, err = _check_section_item(cv, resolved_section_idx, item_idx)
    if err:
        return f"Cannot remove item: {err}"
    removed = items.pop(items.index(item))
    label = removed.get("title") or removed.get("id", "?")
    return f"Removed item '{label}' from section [{resolved_section_idx}]."


@tool
def update_item(
    cv: Annotated[dict, InjectedState("cv")],
    section_idx: int | str,
    item_idx: int | str,
    title: str = None,
    subtitle: str = None,
    date: str = None,
    location: str = None,
    role: str = None,
    body: str = None,
    custom_fields: dict = None,
) -> str:
    """Update any fields on an existing item. Only provide the fields you want to change.
    Use custom_fields for key-value pairs in custom-section items.
    """
    item, err = _check_section_item(cv, section_idx, item_idx)
    if err:
        return err

    updated = []
    if title is not None:
        item["title"] = title
        updated.append("title")
    if subtitle is not None:
        item["subtitle"] = subtitle
        updated.append("subtitle")
    if date is not None:
        item["date"] = date
        updated.append("date")
    if location is not None:
        item["location"] = location
        updated.append("location")
    if role is not None:
        item["role"] = role
        updated.append("role")
    if body is not None:
        item["body"] = body
        updated.append("body")
    if custom_fields is not None:
        item.setdefault("values", {}).update(custom_fields)
        updated.append("custom_fields")

    return f"Updated item [{item_idx}] in section [{section_idx}]: {', '.join(updated)}" if updated else "No item fields changed."


@tool
def set_item_bullets(
    cv: Annotated[dict, InjectedState("cv")],
    section_idx: int | str,
    item_idx: int | str,
    bullets: list[str],
) -> str:
    """Replace all bullets on an item with a new list.
    Each bullet should be a concise, achievement-oriented sentence
    starting with a strong action verb (Built, Led, Designed, Improved, Reduced...).
    """
    item, err = _check_section_item(cv, section_idx, item_idx)
    if err:
        return err
    item["bullets"] = bullets
    return f"Set {len(bullets)} bullet(s) on item [{item_idx}] in section [{section_idx}]."


@tool
def set_item_skill_groups(
    cv: Annotated[dict, InjectedState("cv")],
    section_idx: int | str,
    item_idx: int | str,
    groups: list[dict],
) -> str:
    """Replace all skill groups on an item.
    Each group must have 'label' (category name) and 'value' (comma-separated skills string).
    IDs are auto-generated if missing.
    """
    item, err = _check_section_item(cv, section_idx, item_idx)
    if err:
        return err
    for g in groups:
        if "id" not in g:
            g["id"] = _generate_id("sg")
    item["skillGroups"] = groups
    return f"Set {len(groups)} skill group(s) on item [{item_idx}] in section [{section_idx}]."
