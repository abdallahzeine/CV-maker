from .header import read_cv, update_header
from .sections import manage_sections, reorder_sections
from .items import add_item, remove_item, update_item, set_item_bullets, set_item_skill_groups
from .resolve import resolve_sections, resolve_items, replace_cv_content

ALL_TOOLS = [
    # Inspection (1)
    read_cv,
    # Header (1)
    update_header,
    # Sections (2)
    manage_sections, reorder_sections,
    # Resolvers / full replacement (3)
    resolve_sections, resolve_items, replace_cv_content,
    # Items (5)
    add_item, remove_item, update_item, set_item_bullets, set_item_skill_groups,
]
