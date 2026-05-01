from typing import Annotated

from langchain.tools import tool
from langgraph.prebuilt import InjectedState

from .helpers import VALID_SECTION_TYPES, DEFAULT_LAYOUT, _generate_id


@tool
def manage_sections(
    cv: Annotated[dict, InjectedState("cv")],
    action: str,
    index: int = None,
    type: str = None,
    title: str = None,
) -> str:
    """Manage CV sections. action must be "add", "remove", or "rename".
    - action="add": appends a new section. Requires `type` and `title`.
    - action="remove": deletes section by index. Requires `index`.
    - action="rename": changes the section title. Requires `index` and `title`.
    """
    sections = cv.setdefault("sections", [])

    if action == "add":
        if type is None or title is None:
            return "action='add' requires both `type` and `title`."
        if type not in VALID_SECTION_TYPES:
            return f"Invalid section type '{type}'. Must be one of: {', '.join(sorted(VALID_SECTION_TYPES))}"
        new_section = {
            "id": _generate_id("sec"),
            "type": type,
            "title": title,
            "items": [],
            "layout": dict(DEFAULT_LAYOUT),
        }
        sections.append(new_section)
        idx = len(sections) - 1
        return f"Added section at index {idx}: type={type}, title='{title}' (no items — add them next)."

    if action == "remove":
        if index is None:
            return "action='remove' requires `index`."
        if not sections or index < 0 or index >= len(sections):
            return f"Cannot remove section at index {index}: no section at that position."
        removed = sections.pop(index)
        return f"Removed section: '{removed['title']}' (type={removed['type']})."

    if action == "rename":
        if index is None or title is None:
            return "action='rename' requires both `index` and `title`."
        if not sections or index < 0 or index >= len(sections):
            return f"Cannot rename section at index {index}: no section at that position."
        old = sections[index]["title"]
        sections[index]["title"] = title
        return f"Renamed section at index {index}: '{old}' -> '{title}'."

    return f"Invalid action '{action}'. Must be one of: add, remove, rename."


@tool
def reorder_sections(
    cv: Annotated[dict, InjectedState("cv")],
    order: list[int],
) -> str:
    """Reorder sections. `order` is a list of current indices in the desired order.
    Example: order=[2,0,1] moves section 2 to first, 0 to second, 1 to third.
    """
    sections = cv.get("sections", [])
    if not sections:
        return "No sections to reorder."

    n = len(sections)
    if len(order) != n or set(order) != set(range(n)):
        return f"Invalid order {order}. Must be a permutation of indices 0..{n-1}."

    cv["sections"] = [sections[i] for i in order]
    return f"Reordered {n} sections to new index order: {order}."
