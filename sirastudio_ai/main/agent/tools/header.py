import json
from typing import Annotated

from langchain.tools import tool
from langgraph.prebuilt import InjectedState

from .helpers import VALID_ICONS, _generate_id, summarize_cv_for_agent


@tool
def read_cv(cv: Annotated[dict, InjectedState("cv")]) -> str:
    """Read the current CV. Call this by itself before editing and after edits to verify.

    Returns an indexed snapshot with section_idx, item_idx, exact ids, and editable fields.
    """
    return json.dumps(summarize_cv_for_agent(cv), ensure_ascii=False)


@tool
def update_header(
    cv: Annotated[dict, InjectedState("cv")],
    name: str = None,
    headline: str = None,
    location: str = None,
    phone: str = None,
    email: str = None,
    social_links: list[dict] = None,
) -> str:
    """Update any header fields. Only provide the fields you want to change.
    social_links replaces the entire list; each link needs: url, label, iconType.
    """
    header = cv.setdefault("header", {})
    updated = []

    if name is not None:
        header["name"] = name
        updated.append("name")
    if headline is not None:
        header["headline"] = headline
        updated.append("headline")
    if location is not None:
        header["location"] = location
        updated.append("location")
    if phone is not None:
        header["phone"] = phone
        updated.append("phone")
    if email is not None:
        header["email"] = email
        updated.append("email")

    if social_links is not None:
        validated = []
        for i, link in enumerate(social_links):
            icon = link.get("iconType", "custom")
            if icon not in VALID_ICONS:
                return f"Invalid icon '{icon}' at social_links[{i}]. Must be one of: {', '.join(sorted(VALID_ICONS))}"
            validated.append({
                "id": link.get("id") or _generate_id("link"),
                "url": link.get("url", ""),
                "label": link.get("label", ""),
                "iconType": icon,
                "displayOrder": i,
            })
        header["socialLinks"] = validated
        updated.append("social_links")

    return f"Updated header fields: {', '.join(updated)}" if updated else "No header fields changed."
