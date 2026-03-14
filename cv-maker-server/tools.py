"""
Path-based patch tools — the model specifies WHERE to change and WHAT to set.
Much more token-efficient than sending back the full CV JSON.

Path syntax (dot-notation + array indices):
  header.name
  sections[1].title
  sections[2].items[0].subtitle
  sections[2].items[0].skillGroups[1].value
  sections[2].items[0].skillGroups[3]   ← whole element (for delete_at)
  sections[4].items                     ← whole array (for append_item)
"""
import json
from typing import Any
from langchain_core.tools import tool


@tool
def set_field(path: str, value: str) -> str:
    """Set a single string field anywhere in the CV using a dot-path.

    path examples:
      "header.name"
      "header.email"
      "sections[1].title"
      "sections[0].items[0].body"
      "sections[1].items[0].subtitle"
      "sections[1].items[0].date"
      "sections[2].items[0].skillGroups[0].label"
      "sections[2].items[0].skillGroups[0].value"
      "sections[4].items[0].title"
      "sections[4].items[0].bullets[2]"

    value: the new string value to place at that path.
    """
    print(f"[tool] set_field: {path!r} = {value!r}")
    return json.dumps({"action": "setField", "path": path, "value": value})


@tool
def delete_at(path: str) -> str:
    """Remove an element from an array anywhere in the CV using a dot-path.

    path must end with an array index, e.g.:
      "sections[2].items[0].skillGroups[3]"   ← removes that skill row
      "sections[4].items[2]"                   ← removes that project
      "sections[5].items[1]"                   ← removes a certification
      "sections[4].items[0].bullets[1]"        ← removes a bullet point

    Use this to delete any item, skill group row, bullet, or section.
    """
    print(f"[tool] delete_at: {path!r}")
    return json.dumps({"action": "deleteAt", "path": path})


@tool
def append_item(collection_path: str, item_json: Any) -> str:
    """Append a new object to any array in the CV.

    collection_path: path to the array you want to push into, e.g.:
      "sections[4].items"                          ← add a new project
      "sections[1].items"                          ← add an education entry
      "sections[5].items"                          ← add a certification
      "sections[2].items[0].skillGroups"           ← add a skill category row
      "sections[4].items[0].bullets"               ← add a bullet to a project

    item_json: the new object to append — pass as a JSON string OR as an object.
      For a section item:    {"id": "new-proj-2", "title": "...", "bullets": [...], ...}
      For a skill group row: {"id": "new-sg-1", "label": "...", "value": "..."}
      For a bullet string:   just the string itself (e.g. "Built with React.")

    Rules:
    - All new section items MUST have a unique "id" field (e.g. "new-proj-2").
    - Skill group rows must have "id", "label", "value".
    - Unused item fields set to null (never omit them).
    """
    # Normalize: accept both a JSON string and a pre-parsed dict/list
    if isinstance(item_json, str):
        try:
            item = json.loads(item_json)
        except json.JSONDecodeError as e:
            print(f"[tool] append_item: invalid JSON — {e}")
            return json.dumps({"action": "error", "message": f"item_json is not valid JSON: {e}"})
    else:
        item = item_json  # model passed a dict directly — use as-is

    preview = str(item)[:80]
    print(f"[tool] append_item: path={collection_path!r}, item={preview}...")
    return json.dumps({"action": "appendItem", "path": collection_path, "item": item})


@tool
def add_section(section_type: str, title: str) -> str:
    """Add a new section to the CV.
    
    section_type: type of section to add - one of:
      summary, education, skills, certifications, projects, awards, volunteering
    
    title: the display title for the section (e.g., "WORK EXPERIENCE", "EDUCATION")
    
    Note: Only one summary and skills section can exist at a time. If one already exists,
    it will be replaced with the new section.
    """
    valid_types = ["summary", "education", "skills", "certifications", "projects", "awards", "volunteering"]
    if section_type not in valid_types:
        return json.dumps({"action": "error", "message": f"Invalid section type: {section_type}. Must be one of: {', '.join(valid_types)}"})
    
    # Generate a unique ID for the new section
    import time
    section_id = f"{section_type}-{int(time.time() * 1000)}"
    
    # Create default items based on section type
    items = []
    if section_type in ["education", "certifications", "projects", "awards", "volunteering"]:
        items.append({"id": f"{section_type}-1", "title": "", "subtitle": "", "date": ""})
    elif section_type == "summary":
        items.append({"id": f"{section_type}-1", "body": ""})
    elif section_type == "skills":
        items.append({"id": f"{section_type}-1", "skillGroups": []})
    
    new_section = {
        "id": section_id,
        "type": section_type,
        "title": title,
        "items": items
    }
    
    print(f"[tool] add_section: type={section_type!r}, title={title!r}")
    return json.dumps({"action": "addSection", "section": new_section})


@tool
def delete_section(section_index: int) -> str:
    """Delete an entire section from the CV by its index.
    
    section_index: the array index of the section to delete (0-based).
    Use the sections array to determine the correct index.
    
    Note: Cannot delete the last remaining section.
    """
    print(f"[tool] delete_section: index={section_index}")
    result = {"action": "deleteSection", "index": section_index}
    print(f"[tool] delete_section returning: {result}")
    return json.dumps(result)


ALL_TOOLS = [set_field, delete_at, append_item, add_section, delete_section]
