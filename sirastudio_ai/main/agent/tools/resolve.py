import json
from typing import Annotated

from langchain.tools import tool
from langgraph.prebuilt import InjectedState

from .helpers import find_items, find_sections, is_valid_cv_shape


@tool
def resolve_sections(
    cv: Annotated[dict, InjectedState("cv")],
    query: str = None,
    type: str = None,
) -> str:
    """Find CV sections by title/id/type before editing ambiguous targets."""
    return json.dumps(find_sections(cv, query=query, type=type), ensure_ascii=False)


@tool
def resolve_items(
    cv: Annotated[dict, InjectedState("cv")],
    section_ref: int | str,
    query: str = None,
) -> str:
    """Find items in a section by id/title/subtitle/role/date/body before editing ambiguous targets."""
    return json.dumps(find_items(cv, section_ref=section_ref, query=query), ensure_ascii=False)


@tool
def replace_cv_content(
    cv: Annotated[dict, InjectedState("cv")],
    header: dict = None,
    sections: list[dict] = None,
    template: dict = None,
) -> str:
    """Replace major CV content after read_cv. Preserves template unless a template is provided."""
    next_cv = dict(cv or {})
    changed_paths = []

    if header is not None:
        next_cv["header"] = header
        changed_paths.append("header")
    if sections is not None:
        next_cv["sections"] = sections
        changed_paths.append("sections")
    if template is not None:
        next_cv["template"] = template
        changed_paths.append("template")

    if not is_valid_cv_shape(next_cv):
        return "Invalid replacement CV shape. Expected header object, sections list, and template object."

    cv.clear()
    cv.update(next_cv)
    return json.dumps({"changed_paths": changed_paths}, ensure_ascii=False)
