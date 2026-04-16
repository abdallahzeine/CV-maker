# CV Maker — User Guide

## Table of Contents

1. [App Overview](#1-app-overview)
2. [The Three Templates](#2-the-three-templates)
3. [The Header](#3-the-header)
4. [Social Links](#4-social-links)
5. [Sections](#5-sections)
6. [Add Section Wizard](#6-add-section-wizard)
7. [Section Layout Options](#7-section-layout-options)
8. [Section Types & Their Fields](#8-section-types--their-fields)
9. [Editing Items](#9-editing-items)
10. [Reordering with Drag-and-Drop](#10-reordering-with-drag-and-drop)
11. [Layout Settings Panel](#11-layout-settings-panel)
12. [Print & Export](#12-print--export)
13. [Reset](#13-reset)
14. [Full User Flow Summary](#14-full-user-flow-summary)

---

## 1. App Overview

The CV Maker is a single-page web app for building professional resumes. Everything happens on one screen:

```
+------------------------------------------------------------------+
|  [Toolbar]                                                        |
|  [+ Add Section]  [B] [I] [U]            [Reset]  [Print]         |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                         HEADER                              |  |
|  |           Name  |  Location  |  Phone  |  Email             |  |
|  |           [Social Link Icons]                               |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |  SECTION 1 (e.g. Education)                                |  |
|  |  [Title]  [Gear] [Up] [Down] [Drag] [X]                    |  |
|  |  +----------------------------------------------------+   |  |
|  |  | Item 1: Title / Subtitle / Date                       |   |
|  |  | Bullets or body text                                  |   |
|  |  +----------------------------------------------------+   |  |
|  |  [+ Add Education]                                      |   |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |  SECTION 2 ...                                              |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|                              ...                                  |
|                                                                   |
+------------------------------------------------------------------+
```

**Toolbar** — floating action bar anchored near the bottom center, always visible while editing.
**CVDocument** — the live-preview CV document in the main editor area.

---

## 2. The Three Templates

The app currently renders the CV with the single-column template. The sidebar-left and sidebar-right templates exist as stubs in the codebase, but they are not switchable from the UI and currently render the same shell as single-column.

### Template: Single Column

```
+--------------------------------------------------------+
|  NAME                                                    |
|  Location  |  Phone  |  Email                           |
|  [GitHub] [LinkedIn] [Portfolio]                        |
+--------------------------------------------------------+
|                                                          |
|  PROFESSIONAL SUMMARY                                    |
|  __________________________________________________     |
|  Body text describing who you are...                    |
|                                                          |
|  EDUCATION                                               |
|  __________________________________________________     |
|  University Name           Degree        Jan 2020       |
|  - Bullet point                                    |
|  - Bullet point                                    |
|                                                          |
|  SKILLS                                                 |
|  __________________________________________________     |
|  Languages: Python, JavaScript                          |
|  Frameworks: React, FastAPI                             |
|                                                          |
+--------------------------------------------------------+
```

### Template: Sidebar Left

```
+--------+------------------------------------------------+
|        |  NAME                                          |
|  SIDE  |  Location  |  Phone  |  Email                 |
|  BAR   |  [GitHub] [LinkedIn] [Portfolio]              |
|        +------------------------------------------------+
|        |                                                 |
|  Skills|  PROFESSIONAL SUMMARY                          |
|  Certifications |  _________________________________ |
|  Langs |  Body text...                                  |
|        |                                                 |
|        |  EDUCATION                                     |
|        |  _________________________________________     |
|        |  University      Degree         Jan 2020       |
|        |                                                 |
+--------+------------------------------------------------+
```

### Template: Sidebar Right

```
+------------------------------------------------+--------+
|  NAME                                          |        |
|  Location  |  Phone  |  Email                 |  SIDE  |
|  [GitHub] [LinkedIn] [Portfolio]              |  BAR   |
+------------------------------------------------+        |
|                                                 | Skills |
|  PROFESSIONAL SUMMARY                          | Certifications |
|  _________________________________________     | Langs |
|  Body text...                                  |        |
|                                                 |        |
|  EDUCATION                                     |        |
|  _________________________________________     |        |
|  University      Degree         Jan 2020       |        |
|                                                 |        |
+------------------------------------------------+--------+
```

> **Note:** The sidebar templates (sidebar-left, sidebar-right) are currently implemented as stubs. They render the same shell as single-column and are not exposed as a user setting.

---

## 3. The Header

The header appears at the top of every CV and contains the user's personal information.

### Header Fields

```
+---------------------------------------------------------------+
|                                                                |
|                     [ ABDALLAH ZEINE ELABIDINE ]              |
|                     [ Jeddah, Saudi Arabia ]                  |
|                     [ +1 234 567 890 ]  [ abd@example.com ]   |
|                                                                |
|                [ GitHub ]  [ LinkedIn ]  [ Portfolio ]        |
|                                                                |
+---------------------------------------------------------------+
```

| Field      | Placeholder          | Editable   |
|------------|---------------------|------------|
| Name       | `Your Name`          | Inline text, large bold |
| Location   | `City, Country`      | Inline text with location pin icon |
| Phone      | `+1 234 567 890`     | Inline text with phone icon |
| Email      | `email@example.com`  | Inline text with email icon |

**How to edit:** Click any field to place the cursor inside it and type. Changes save automatically.

---

## 4. Social Links

Social links appear as icon buttons in the header, below the contact info.

### Link Manager — Compact Header Layout

The header uses a compact horizontal row of link icons. Each icon is a circular button (32px) with the icon's built-in color or any custom color you choose.

> **Note:** The component also contains grid and list render paths, but the current UI only uses the compact header layout.

### Adding a New Link

1. Click the **+** button in the link manager
2. An **Link Editor** modal opens:

```
+------------------------------------------------------+
|                    Add Link                          |
+------------------------------------------------------+
|                                                       |
|  URL *                                                |
|  [https://github.com/yourname               ]        |
|                                                       |
|  Label                                                |
|  [GitHub                               ]              |
|  (auto-filled from URL if left empty)                |
|                                                       |
|  Icon                                                 |
|  [GitHub] [LinkedIn] [Twitter] [Website] [Email]     |
|  [Phone] [Portfolio] [YouTube] [Instagram]           |
|  [Facebook] [Custom]                                 |
|                                                       |
|  Custom Icon URL                                      |
|  [https://example.com/icon.png          ]            |
|                                                       |
|  Color                                                |
|  [#######] [#9333EA]  [Professional]                  |
|                                                       |
|  Preview                                              |
|  [GitHub]  ← how it will appear                       |
|                                                       |
|              [Cancel]  [Save Link]                    |
+------------------------------------------------------+
```

**URL field** — Supports `https://`, `mailto:`, and `tel:` protocols. Auto-normalizes web URLs by adding `https://` when needed.

**Auto-detection** — When you paste a URL:
- `github.com/...` → selects GitHub icon
- `linkedin.com/in/...` → selects LinkedIn icon
- `youtube.com/...` or `youtu.be/...` → selects YouTube icon
- `instagram.com/...` → selects Instagram icon
- `facebook.com/...` or `fb.com/...` → selects Facebook icon
- `twitter.com/...` or `x.com/...` → selects Twitter/X icon
- `mailto:...` → selects Email icon
- `tel:...` → selects Phone icon

**Label** — If left empty, automatically filled from the domain name on blur.

**Icon Selector** — 11 predefined icons organized by category:
- **Professional:** GitHub, LinkedIn, Portfolio
- **Social:** Twitter/X, YouTube, Instagram, Facebook
- **Contact:** Email, Phone
- **Other:** Website, Custom

**Color** — Native color picker with hex input. The icon's built-in color is used by default, and any custom color overrides it. The **Professional** button clears the custom color and restores the default icon color. Includes a warning that light colors may not print well.

**Favicon** — Automatically fetched from Google's favicon service, with a direct `favicon.ico` fallback.

### Editing a Link

Click any existing link card to reopen the editor pre-populated with that link's data.

### Deleting a Link

Click the red **X** on any link card. A browser confirmation dialog appears: *"Are you sure you want to delete this link?"*

### Reordering Links

Drag the grip handle on any link card to reorder. The order updates immediately.

---

## 5. Sections

A CV is made up of **sections**. Each section has:
- A **title** (editable inline, e.g. "EDUCATION", "PROJECTS")
- A **layout configuration** (date position, alignment, bullet style, spacing, title rule)
- One or more **items** (the actual content entries)

### Section Anatomy

```
+-------------------------------------------------------------+
|  EDUCATION  [gear icon] [up] [down] [drag handle] [X]       |
|  _____________________________________________________      |
|  +-----------------------------------------------------+   |
|  | [up] [down] [drag] [X]                              |   |
|  |                                                     |   |
|  |  University of Waterloo        Bachelor's  Sep 2020 |   |
|  |  Bachelor of Computer Science                        |   |
|  |                                                     |   |
|  +-----------------------------------------------------+   |
|  [+ Add education]                                        |
+-------------------------------------------------------------+

  [gear]   → Opens layout settings panel for this section
  [up]     → Moves section up one position
  [down]   → Moves section down one position
  [drag]   → Drag handle for free-form reordering
  [X]      → Deletes the entire section (with confirmation)
  [+ Add]  → Adds a new item to this section
```

### Section Controls

- **Edit title** — Click the title text directly
- **Delete section** — Red X button; the last remaining section cannot be deleted
- **Reorder sections** — Up/Down arrow buttons or drag handle
- **Layout settings** — Gear icon opens the side panel

---

## 6. Add Section Wizard

Click **"+ Add Section"** in the toolbar to open the 3-step wizard.

### Step 1 — Choose Section Category

```
+---------------------------------------------------------------+
|                        Add Section                            |
+---------------------------------------------------------------+
|                                                               |
|  Choose a category for your section                           |
|                                                               |
|  +------------------+  +------------------+                   |
|  ||| Titled Entry |||  ||| Summary      |||                   |
|  ||                |||  ||                |||                 |
|  || [expandable]   |||  || [body text]   |||                 |
|  +------------------+  +------------------+                   |
|                                                               |
|  +------------------+  +------------------+                   |
|  ||| Projects      |||  ||| Custom       |||                   |
|  ||                |||  ||                |||                 |
|  || [bullets]      |||  || [you define]  |||                 |
|  +------------------+  +------------------+                   |
|                                                               |
|                                            [Cancel]           |
+---------------------------------------------------------------+
```

#### Category: Titled Entry (expandable)

Expands to show 4 section type options:

```
+---------------------------------------------------------------+
|  Titled Entry                                                 |
|  Entries with a heading, subtitle, and date                  |
+---------------------------------------------------------------+
|  [Education]  [Certifications]  [Awards]  [Volunteering]     |
|                                                               |
|  Example:                                                      |
|  University of Waterloo    Bachelor's Degree    Sep 2020     |
|  Bachelor of Computer Science                             |
+---------------------------------------------------------------+
```

#### Category: Summary

Single section type. Shows this preview:

```
+---------------------------------------------------------------+
|  Summary                                                      |
|  A paragraph about your professional background               |
+---------------------------------------------------------------+
|  Example:                                                      |
|  Experienced software engineer with 5+ years...              |
+---------------------------------------------------------------+
```

#### Category: Projects

Single section type. Shows this preview:

```
+---------------------------------------------------------------+
|  Projects                                                     |
|  Showcase your personal or professional projects              |
+---------------------------------------------------------------+
|  Example:                                                      |
|  Project Title                                    Jan 2023    |
|  - Built a full-stack web application using...               |
|  - Technologies: React, Node.js, PostgreSQL                  |
+---------------------------------------------------------------+
```

#### Category: Custom Section

Skips directly to Step 3 (field definition).

### Step 2 — Choose Layout Preset

```
+---------------------------------------------------------------+
|                        Add Section                            |
+---------------------------------------------------------------+
|  1. Category    2. Layout     3. Custom Fields                |
+---------------------------------------------------------------+
|                                                               |
|  Choose a preset for your section                             |
|                                                               |
|  +-----------------------------+----------------------------+ |
|  |  Classic          [ ]      |  Professional    [✓]      | |
|  |                             |                             | |
|  |  University...   Degree    |  University...   Degree    | |
|  |  BS in CS         2020      |  BS in CS         2020     | |
|  |                             |                             | |
|  |  - Bullet                   |  - Bullet                   | |
|  +-----------------------------+----------------------------+ |
|                                                               |
|  +-------------------------------------------------------+   |
|  | Date Position          [Right] [Below] [Margin] [Hide]|   |
|  |                                                         |   |
|  | Spacing               [Compact] [Normal] [Relaxed]    |   |
|  |                                                         |   |
|  | Bullet Style           [None] [Dot] [Dash] [Chevron] |   |
|  |                                                         |   |
|  | Alignment              [Left] [Center] [Justify]     |   |
|  |                                                         |   |
|  | Rule Under Title       [  OFF  ]                      |   |
|  +-------------------------------------------------------+   |
|                                                               |
|                    [Back]           [Create Section]          |
+---------------------------------------------------------------+
```

#### Classic Preset
All sections: left alignment, no bullets/icons, compact spacing, 1 column.
- Sections with dates: date appears inline right of the title
- Summary/Skills: no date field

#### Professional Preset (marked with green checkmark ✓)
Recommended layout preset. It uses the app's professional defaults for each section type. The visible difference is tighter spacing for Projects.

#### Layout Option Cards

Each option row shows clickable cards:

```
Date Position:
  [Right Inline]  [Below Title]  [Left Margin]  [Hidden]

  Right Inline:
  Title                    Degree      Date

  Below Title:
  Title
  Degree                              Date

  Left Margin:
    | Title                    Degree      Date
    |

  Hidden:
  Title                    Degree
```

```
Spacing (Density):
  [Compact]  [Normal]  [Relaxed]

  Compact:   Title · Subtitle · Date (tight)
  Normal:    Title
             Subtitle
             Date
  Relaxed:   Title
             Subtitle
             Date
             (extra line height)
```

```
Bullet Style:
  [None]  [Dot •]  [Dash –]  [Chevron ›]

  None:    Title
           Subtitle

  Dot:     • Title
           • Subtitle

  Dash:    – Title
           – Subtitle

  Chevron: › Title
           › Subtitle
```

```
Alignment:
  [Left]    [Center]    [Justify]

  Left:    Title
           Body text aligned to left edge

  Center:  Title
           Body text centered

  Justify: Title
           Body text fills the line
           evenly on both sides
```

### Step 3 — Custom Section Fields (Custom Type Only)

```
+---------------------------------------------------------------+
|                        Add Section                            |
+---------------------------------------------------------------+
|  1. Category    2. Layout     3. Custom Fields                |
+---------------------------------------------------------------+
|                                                               |
|  Define the fields for your custom section                    |
|                                                               |
|  Use custom title                                              |
|  [ ]                                                           |
|  (turn this on to enter a custom title; otherwise the default  |
|   "CUSTOM SECTION" title is used)                             |
|                                                               |
|  Fields                                                      |
|  +-----------------------------------------------------+     |
|  | Field 1                            [X]              |     |
|  | Label: [Job Title                     ]              |     |
|  | Type:  (o) Short text  ( ) Long text              |     |
|  |         ( ) Date       ( ) Bullet list             |     |
|  +-----------------------------------------------------+     |
|  +-----------------------------------------------------+     |
|  | Field 2                            [X]              |     |
|  | Label: [Company                     ]              |     |
|  | Type:  (o) Short text  ( ) Long text              |     |
|  |         ( ) Date       ( ) Bullet list             |     |
|  +-----------------------------------------------------+     |
|                                                               |
|  [+ Add Field]                                               |
|  (minimum 1 field required)                                  |
|                                                               |
|  Preview:                                                    |
|  +-----------------------------------------------------+     |
|  | Job Title: Software Engineer                        |     |
|  | Company: Google                                     |     |
|  +-----------------------------------------------------+     |
|                                                               |
|                    [Back]           [Create Section]          |
+---------------------------------------------------------------+
```

Field types:
- **Short text** — Single-line input
- **Long text** — Multi-line textarea
- **Date** — Date input field
- **Bullet list** — Multiple bullet items, add/remove bullets

---

## 7. Section Layout Options

After creating a section, you can change its layout at any time by clicking the **gear icon** on the section. This opens the **SidePanel** on the right.

### SidePanel

```
+----------------------------------------+------------------------+
| [drag handle]                          |                        |
|                                        |  Layout Settings       |
|                                        |  __________________    |
|                                        |                        |
|                                        |  Date Position         |
|                                        |  [Right] [Below]       |
|                                        |  [Margin] [Hide]       |
|                                        |                        |
|                                        |  Spacing               |
|                                        |  [Compact] [Normal]    |
|                                        |  [Relaxed]             |
|                                        |                        |
|                                        |  Bullet Style          |
|                                        |  [None] [Dot] [Dash]   |
|                                        |  [Chevron]             |
|                                        |                        |
|                                        |  Alignment             |
|                                        |  [Left] [Center]       |
|                                        |  [Justify]             |
|                                        |                        |
|                                        |  Rule Under Title      |
|                                        |  [  OFF  ]             |
|                                        |                        |
+----------------------------------------+------------------------+

The panel is resizable by dragging the left edge.
Minimum: 320px  |  Maximum: 40% of viewport
```

### All Layout Options at a Glance

| Option       | Values                              | Available For                              |
|--------------|-------------------------------------|-------------------------------------------|
| Date Position| `right-inline`, `below-title`,     `left-margin`, `hidden` | Education, Certifications, Awards, Volunteering, Projects, Custom |
| Alignment    | `left`, `center`, `justify`         | All section types                         |
| Bullet Style | `none`, `bullet` (•), `dash` (–), `chevron` (›) | Projects, certifications, awards, custom |
| Spacing      | `compact`, `normal`, `relaxed`      | All section types                          |
| Rule Under Title | `on` / `off` (toggle)          | All section types                          |

---

## 8. Section Types & Their Fields

### Summary

Single-item section. Editable multiline paragraph.

```
PROFESSIONAL SUMMARY
___________________________________________

[ contenteditable body text area ]

+-------------------------------------------------------+
| Experienced software engineer with 5+ years of       |
| experience building scalable web applications.       |
| Specialized in React, Node.js, and cloud              |
| architecture. Passionate about clean code and        |
| user-centered design.                                |
+-------------------------------------------------------+
```

Fields: `body` (multiline, supports bold/italic/underline formatting)

---

### Education

```
EDUCATION
___________________________________________

[up] [down] [drag] [X]  University of Waterloo
 +-------------------------------------------------------+
 | [up] [down] [drag] [X]                               |
 |                                                       |
 |  University of Waterloo          Bachelor's  Sep 2020|
 |  Bachelor of Computer Science                         |
 |  - Dean's Honor List                                 |
 |  - Relevant coursework: Algorithms, OS, Networks     |
 |                                                       |
 +-------------------------------------------------------+
|                    [+ Add education]                  |
```

Fields per item: `title` (university), `subtitle` (degree), `date`

---

### Skills

Single-item section. Contains multiple skill groups.

```
SKILLS
___________________________________________

+-------------------------------------------------------+
| Languages & Frameworks                               |
| Python, JavaScript, TypeScript, React, Node.js        |
|                                                       |
| Databases                                             |
| PostgreSQL, MongoDB, Redis                            |
|                                                       |
| Tools & Platforms                                     |
| Git, Docker, AWS, Firebase                            |
|                                                       |
| Cloud & DevOps                                        |
| CI/CD, Kubernetes, Terraform                          |
+-------------------------------------------------------+
|                    [+ Add skill category]             |
```

Fields: `skillGroups[]` — each group has a `label` and `value`. Skill groups are drag-and-drop reorderable.

---

### Certifications

```
CERTIFICATIONS
___________________________________________

[up] [down] [drag] [X]  IBM AI Engineering Certificate
 +-------------------------------------------------------+
 | [up] [down] [drag] [X]                               |
 |                                                       |
 |  IBM AI Engineering Certificate     Jan 2024         |
 |  IBM                                                  |
 |                                                       |
 +-------------------------------------------------------+
|                    [+ Add certification]              |
```

Fields per item: `title`, `subtitle`, `date`

---

### Projects

```
PROJECTS
___________________________________________

[up] [down] [drag] [X]  AI Resume Builder
 +-------------------------------------------------------+
 | [up] [down] [drag] [X]                               |
 |                                                       |
 |  AI Resume Builder                     Jan 2024       |
 |  - Built a full-stack web application for            |
 |    creating and managing professional resumes         |
 |  - Features: drag-and-drop, AI suggestions,          |
 |    multiple templates, export to PDF                  |
 |  - Technologies: React, FastAPI, PostgreSQL          |
 |                                                       |
 |  [+ Add bullet]                                       |
 +-------------------------------------------------------+
|                    [+ Add project]                      |
```

Fields per item: `title`, `bullets[]`

---

### Awards

```
AWARDS & SCHOLARSHIPS
___________________________________________

[up] [down] [drag] [X]  Dean's Honor List
 +-------------------------------------------------------+
 | [up] [down] [drag] [X]                               |
 |                                                       |
 |  Dean's Honor List                    May 2022       |
 |  University of Waterloo                                 |
 |                                                       |
 +-------------------------------------------------------+
|                    [+ Add award]                       |
```

Fields per item: `title`, `subtitle`, `date`

---

### Volunteering

```
VOLUNTEERING & LEADERSHIP
___________________________________________

[up] [down] [drag] [X]  IEEE CS Chapter - AAU Club
 +-------------------------------------------------------+
 | [up] [down] [drag] [X]                               |
 |                                                       |
 |  IEEE CS Chapter - AAU Club      03/2025 - Present   |
 |  Event Coordinator                                    |
 |                                                       |
 +-------------------------------------------------------+
|                    [+ Add entry]                      |
```

Fields per item: `title` (organization), `role`, `date`

---

### Custom Section

User-defined fields rendered as label/value pairs.

```
CUSTOM SECTION
___________________________________________

[up] [down] [drag] [X]
 +-------------------------------------------------------+
 | [up] [down] [drag] [X]                               |
 |                                                       |
 |  Job Title:    Software Engineer                     |
 |  Company:      Google                                 |
 |  Duration:     Jan 2020 - Present                     |
 |  Responsibilities:                                   |
 |    • Led team of 5 engineers                         |
 |    • Architected microservices platform              |
 |                                                       |
 +-------------------------------------------------------+
|                    [+ Add item]                       |
```

Fields: defined by user in Step 3 of the wizard. Each field has a `label` and `kind` (`text`, `multiline`, `date`, `bullets`).

---

## 9. Editing Items

### Item Controls

Every item is wrapped in an **ItemFrame** with controls:

```
[up] [down] [drag] [X]  ← Item-level controls

  [up]       → Move item up within section
  [down]     → Move item down within section
  [drag]     → Drag handle for free-form reordering
  [X]        → Delete this item
```

### Editing Text Within Items

All text fields are `contentEditable`. Click to edit:
- **Single-line fields** (title, subtitle, date): plain text, no formatting
- **Multiline fields** (summary body, bullets, custom long text): supports rich text

### Rich Text Formatting (Toolbar)

Select text in any multiline field, then use the toolbar:

```
[B]  Bold
[I]  Italic
[U]  Underline
```

These apply `document.execCommand` formatting to the selected HTML content inside the `contentEditable` element.

### Adding Bullets in Projects

Each project item has a bullet list. Below the bullets:

```
[+ Add bullet]
```

Click to add a new bullet. Each bullet has its own delete button.

### Adding Skill Groups

The skills section has labeled skill groups. Below the groups:

```
[+ Add skill category]
```

Each group has:
- A label field (e.g. "Languages")
- A value field (e.g. "Python, JavaScript")
- Up/Down reorder buttons
- Delete button

---

## 10. Reordering with Drag-and-Drop

The app uses `@dnd-kit` for drag-and-drop at three levels:

### Level 1 — Sections

All sections in the CV can be reordered by dragging.

```
[drag handle]  SECTION TITLE
[drag handle]  SECTION TITLE
[drag handle]  SECTION TITLE
     ↓
  [dragging SECTION 2]
     ↓
[drag handle]  SECTION TITLE  ← placeholder while dragging
[drag handle]  SECTION TITLE
```

Dragging is triggered by the **6-dot grip handle** on the left of each section header.

### Level 2 — Items Within a Section

Items within a section can be reordered independently.

```
  Item 1
  Item 2
  Item 3  ← dragging this
  Item 4
```

Each item has its own drag handle (grip icon on the left edge of the item frame).

### Level 3 — Bullets Within a Project Item

Bullets within a project item are individually draggable.

```
  • Bullet 1
  • Bullet 2  ← dragging
  • Bullet 3
```

### Level 4 — Skill Groups

Skill groups in the Skills section are draggable.

```
  [drag]  Languages & Frameworks: Python, JS...
  [drag]  Databases: PostgreSQL, MongoDB...
  [drag]  Tools: Git, Docker...
```

### Level 5 — Social Links

Link cards in the Link Manager are draggable to reorder.

All drag operations:
- Require an **8px pointer movement** to activate (prevents accidental drags)
- Support **keyboard navigation** (Tab to focus, Space to pick up, Arrow keys to move, Space to drop)

---

## 11. Layout Settings Panel

Opened by clicking the **gear icon** on any section. Slides in from the right.

```
+----------------------------------------+----------------------------+
|                                        |  EDUCATION                 |
|                                        |  ______________________    |
|                                        |                            |
|                                        |  Date Position             |
|                                        |  [Right] [Below]           |
|                                        |  [Margin] [Hide]           |
|                                        |                            |
|                                        |  Spacing                   |
|                                        |  [Compact] [Normal]        |
|                                        |  [Relaxed]                 |
|                                        |                            |
|                                        |  Bullet Style              |
|                                        |  [None] [Dot] [Dash]       |
|                                        |  [Chevron]                 |
|                                        |                            |
|                                        |  Alignment                 |
|                                        |  [Left] [Center]           |
|                                        |  [Justify]                 |
|                                        |                            |
|                                        |  Rule Under Title          |
|                                        |  [  OFF  ]                 |
|                                        |                            |
+----------------------------------------+----------------------------+
```

The panel is **resizable** — drag the left edge to widen or narrow it.

- **Minimum width:** 320px
- **Maximum width:** 40% of the viewport
- **Width is persisted** to localStorage

Close the panel by pressing **Escape**.

---

## 12. Print & Export

The app uses the browser's native **Print** function via `window.print()`.

### How to Print

Click the **Print** button in the toolbar. The browser's print dialog opens.

### Print Styling

The app applies extensive print-specific CSS:

```
+----------------------------------------------------------+
|  PRINT OUTPUT (print preview)                             |
|                                                          |
|  Name                                                     |
|  Location | Phone | Email                                |
|  [social icons with labels]                              |
|                                                          |
|  PROFESSIONAL SUMMARY                                    |
|  __________________________                              |
|  Body text...                                            |
|                                                          |
|  EDUCATION                                               |
|  __________________________                              |
|  University          Degree            Date              |
|  - Bullet                                               |
|                                                          |
|  SKILLS                                                 |
|  __________________________                              |
|  Languages: Python, JavaScript                          |
|  Frameworks: React, Node.js                             |
|                                                          |
|  ...                                                     |
|                                                          |
+----------------------------------------------------------+
```

**What is hidden in print:**
- Toolbar (Add Section, Reset, Print, Bold, Italic, Underline buttons)
- Section controls (up/down/delete buttons, drag handles, gear icons)
- Add item buttons
- Social link cards (replaced with plain inline icons + labels)

**What is preserved:**
- Full color on all elements (`print-color-adjust: exact`)
- Social links rendered as text
- Title underlines (rules)
- Page breaks avoided inside items (`avoid-break` class)
- Print-friendly page padding (`1.5cm` top/bottom, `2cm` left/right)

---

## 13. Reset

The **Reset** button in the toolbar clears all CV data and restores the default sample CV.

Clicking Reset shows a browser confirmation dialog:

```
+-----------------------------------------+
|   [Browser Dialog]                       |
|                                         |
|   Reset CV to original data? All changes will be lost. |
|                                         |
|              [Cancel]  [OK]             |
+-----------------------------------------+
```

If confirmed:
1. All CV data in localStorage is deleted
2. State resets to `initialCVData` (the sample CV with Abdallah Zeine Elabidine)
3. Page re-renders with the default CV

> **Note:** Reset clears the saved CV data, including the header, sections, template, and layout settings. There is no undo.

---

## 14. Full User Flow Summary

### Flow A: Create a CV from Scratch

```
1. Open the app
   → Default sample CV is loaded from localStorage
   → If no data in localStorage, initialCVData is used

2. Edit the header
   → Click Name field → type your name
   → Click Location → type city and country
   → Click Phone → type your phone number
   → Click Email → type your email address

3. Manage social links
   → Click [+] to add a link
   → Paste URL (auto-detects icon, fills label)
   → Choose icon, color (optional)
   → Click Save Link
   → Drag to reorder links
   → Click a link to edit it
   → Click [X] to delete a link

4. Edit existing sections
   → Click section title to rename it
   → Click item text to edit it
   → Add bullets with [+ Add bullet]
   → Reorder items with arrows, drag handles, or drag-and-drop
   → Delete items with [X]

5. Add a new section
   → Click [+ Add Section] in toolbar
   → Step 1: Choose category → Titled Entry / Summary / Projects / Custom
   → Step 2: Choose preset (Classic or Professional) → configure options
   → Step 3 (custom only): Define fields → Create Section

6. Adjust section layout
   → Click gear icon on section
   → Change date position, spacing, bullets, alignment, title rule
   → Close panel with Escape or click outside

7. Reorder sections
   → Use up/down arrows on section header
   → Or drag the grip handle

8. Delete a section
   → Click red [X] on section header
   → Confirm in dialog

9. Print / Export
   → Click [Print] in toolbar
   → Select printer or "Save as PDF" in browser print dialog
```

### Flow B: Edit an Existing Section

```
1. Locate the section in the CV document

2. Edit the section title
   → Click directly on the title text
   → Type new title
   → Click outside to confirm

3. Edit items within the section
   → Click any text field to edit inline
   → Add new item: click [+ Add ...] at the bottom of the section
   → Delete item: click [X] on the item frame
   → Reorder items: up/down arrows or drag handle

4. Change layout
   → Click gear icon on section header
   → SidePanel opens on the right
   → Change any option (date position, spacing, bullets, alignment, rule)
   → Changes apply immediately (live preview)
   → Close panel with Escape

5. Delete section
   → Click red [X] on section header
   → Confirm: "Delete this section?"
   → Section is permanently removed
```

### Flow C: Add a New Section (Full Wizard Walkthrough)

```
1. Click [+ Add Section] in toolbar

2. STEP 1 — Category Selection
   → Choose one of 4 category cards:

   a) Titled Entry
      → Expands to show 4 type buttons:
        Education / Certifications / Awards / Volunteering
      → Click one to select

   b) Summary
      → Click card to select

   c) Projects
      → Click card to select

   d) Custom Section
      → Skips to Step 3

3. STEP 2 — Layout Configuration
   → Choose preset:
     Classic (no icons, compact, left-aligned)
     Professional (green checkmark, recommended)

   → If needed, configure individual options:
     Date Position (for sections with dates)
     Spacing (compact / normal / relaxed)
   Bullet Style (for projects/certifications/awards/custom)
     Alignment (left / center / justify)
     Rule Under Title (toggle)

   → Preview updates live as you select options

4. STEP 3 — Custom Fields (custom type only)
   → Enter custom section title (optional)
   → Add fields:
     Click [+ Add Field]
     Enter label (e.g. "Company Name")
     Select type (Short text / Long text / Date / Bullet list)
     Repeat for all needed fields
     Remove fields with [X] (must have at least 1)
   → Preview shows how custom section will look

5. Click [Create Section]
   → Section added to bottom of CV
   → Modal closes
   → You can now add items to the section
```

### Flow D: Manage Social Links (Full Walkthrough)

```
1. Adding a link
   → Find social links in the header (below email)
   → Click the [+] button
   → Link Editor modal opens
   → Paste URL into URL field
   → Watch: icon auto-detects, label auto-fills
   → Adjust label if needed
   → Select a different icon if needed
   → Choose a custom color (optional)
   → Preview shows how link will appear
   → Click [Save Link]

2. Editing a link
   → Click directly on any link card (icon button)
   → Link Editor reopens with all fields populated
   → Make changes
   → Click [Save Link]

3. Deleting a link
   → Hover over link card
   → Click red [X]
   → Confirm: "Are you sure you want to delete this link?"

4. Reordering links
   → Drag link cards left/right (compact layout)
   → Or drag up/down (grid/list layout)

5. Link layout
   → The header currently uses the compact layout only
```

### Flow E: Print / Export CV

```
1. Click [Print] in toolbar

2. Browser print dialog opens

3. Choose destination:
   → Select physical printer
   → Or choose "Save as PDF" (varies by browser)

4. Print settings:
   → Paper size is set in the browser print dialog
   → The app applies print padding of 1.5cm top/bottom and 2cm left/right

5. Click Print / Save

6. PDF/printout contains:
   → Name, location, phone, email
   → Social links with icons and labels
   → All sections with proper layout
   → No editor UI (buttons, handles, panels are hidden)
```

### Flow F: Use Rich Text Formatting

```
1. Locate a multiline text field (summary body, project bullets, custom long text)

2. Select text within the field
   → Click and drag to highlight

3. Use toolbar formatting buttons:
   → [B] — Makes selected text bold
   → [I] — Makes selected text italic
   → [U] — Underlines selected text

4. Deselect text to see the formatting applied

5. To remove formatting:
   → Select the formatted text
   → Click the same formatting button again to toggle it off
```

---

## Quick Reference: All Options

### Header Options

| Field         | How to Edit | Notes |
|---------------|------------|-------|
| Name          | Click inline | Large bold text |
| Location      | Click inline | Shows location pin icon |
| Phone         | Click inline | Shows phone icon |
| Email         | Click inline | Shows email icon |
| Social Links  | Link Manager modal | Add/edit/delete/reorder |

### Social Link Options

| Option        | Values / Choices |
|---------------|-----------------|
| URL           | `https://`, `mailto:`, `tel:` |
| Label         | Auto-generated or manual |
| Icon          | 11 predefined icons + custom icon URL |
| Color         | Color picker + hex |
| Layout        | Compact header row only |

### Section Layout Options

| Option        | Values | Applies To |
|---------------|--------|-----------|
| Date Position | `right-inline`, `below-title`, `left-margin`, `hidden` | Education, Certifications, Awards, Volunteering, Projects, Custom |
| Alignment     | `left`, `center`, `justify` | All |
| Bullet Style  | `none`, `bullet`, `dash`, `chevron` | Projects, Certifications, Awards, Custom |
| Density       | `compact`, `normal`, `relaxed` | All |
| Title Rule    | `on`, `off` | All |

### Section Types

| Type          | Single Item? | Has Date? | Has Bullets? | Has Subtitle? |
|---------------|-------------|---------|-------------|--------------|
| Summary       | Yes         | No      | No (body)   | No           |
| Education     | No          | Yes     | No          | Yes          |
| Skills        | Yes         | No      | No (groups) | No           |
| Certifications| No          | Yes     | No          | Yes          |
| Projects      | No          | No      | Yes         | No           |
| Awards        | No          | Yes     | No          | Yes          |
| Volunteering  | No          | Yes     | No          | No (role)    |
| Custom        | No          | Optional| Optional    | Optional     |

### Templates

| Template ID      | Description |
|-----------------|-------------|
| `single-column`  | Standard single-page resume layout |
| `sidebar-left`   | Sidebar on the left (stub, renders as single-column) |
| `sidebar-right`  | Sidebar on the right (stub, renders as single-column) |
