# CV Maker — Change Plan (Updated)

## Overview

This document lists every logical problem, UX issue, and missing best-practice found in the current implementation, informed by 2026 ATS research and analysis of leading CV builder platforms. Changes are grouped and prioritized for a coding agent.

---

## A. Critical Missing Section: Work Experience

**Problem:** The app has no dedicated "Work Experience" section type. This is the most critical section on any resume — ATS research confirms it is the primary section recruiters and parsers evaluate. The current workaround using Custom Section loses all structured semantics.

**Changes:**

1. Add a new section type `work-experience`.
2. Fields per item:
   - `title` — Job title (e.g. "Software Engineer")
   - `company` — Company name
   - `location` — City, Country (optional)
   - `dateStart` + `dateEnd` / "Present" toggle
   - `bullets[]` — Achievement/responsibility bullets
3. Add "Work Experience" as a top-level card in the Add Section wizard (Step 1) — do not bury it inside "Titled Entry". It should be the first card shown.
4. Render: job title + company on row 1, location + date range on row 2, bullets below. Respect datePosition, bulletStyle, density settings.
5. Make it the default first section in `initialCVData`, above Education.

---

## B. ATS-Safe Section Heading Labels

**Problem:** ATS systems are trained to recognize specific standard headings. A user renaming "Education" to "Academic Background" or "Work Experience" to "Where I've Worked" silently breaks ATS parsing with no warning. There is currently no guidance on this.

**Changes:**

1. When a user edits a section title inline, check the typed value against a list of ATS-recognized safe headings: "Work Experience", "Professional Experience", "Education", "Skills", "Technical Skills", "Certifications", "Projects", "Awards", "Volunteer Experience", "Professional Summary", "Languages".
2. If the title diverges from the recognized list, show a subtle inline warning: "⚠ Custom titles may not be recognized by ATS systems."
3. Do not block editing — just warn. Users can dismiss it.

---

## C. ATS: Bullet Style Restriction

**Problem:** The app offers Chevron `›` as a bullet style. ATS research confirms that custom symbols, arrows, and checkmarks frequently parse as garbage characters or `[NULL]`. Only `•` (dot) and `-` (dash) are universally ATS-safe.

**Changes:**

1. Add a visible warning on the Chevron option in the bullet style picker: "⚠ May not parse correctly in ATS systems."
2. Set the default bullet style for all section types to `•` (dot) — not chevron.
3. Remove chevron from the "Professional" preset entirely.

---

## D. ATS: Sidebar Templates Are a Parsing Risk

**Problem:** Multi-column/sidebar layouts are a major ATS hazard. 2026 ATS research consistently shows columns and sidebars cause parsers to scramble content order or drop fields. The sidebar-left and sidebar-right templates are currently stubs rendering identically to single-column with no indication of this.

**Changes:**

1. Option A (recommended): Remove sidebar templates entirely. Ship single-column only.
2. Option B: Implement them but gate behind a prominent warning: "Sidebar layouts are not ATS-compatible. Use only for print or portfolio purposes." Show a warning badge in the template picker.
3. Do not leave them as silent stubs — that is confusing and misleading.

---

## E. Export: No Direct PDF Download

**Problem:** The app relies on `window.print()` → browser "Save as PDF". This produces inconsistent output across Chrome, Firefox, and Safari (different margins, page breaks, font rendering). Users expect a reliable "Download PDF" button. PDF also must be text-based, not image-based — image PDFs cannot be parsed by any ATS.

**Recommendation:**

- `html2pdf.js` (html2canvas + jsPDF): client-side, no backend needed. Acceptable for single-column CVs. Known limitation: complex layouts may not render perfectly.
- Puppeteer (server-side): highest fidelity, requires a backend.
- For a client-only app: use `html2pdf.js` as a first implementation, document the limitation, and allow a future swap for Puppeteer.

**Changes:**

1. Add a "Download PDF" button in the toolbar (separate from "Print").
2. Generate using `html2pdf.js` targeting the CV document element.
3. Ensure the output is text-based (not a canvas screenshot) — use `html2pdf` in text-extraction mode, not image mode, for ATS safety.
4. File name should default to `"{Name}-Resume.pdf"`.

---

## F. Export: Add DOCX Download

**Problem:** Approximately 12% of US job postings and many government/academic roles explicitly require Word (.docx) format. Every major competitor (Rezi, Resume.io, Enhancv, SweetCV, Huntr) offers DOCX export. Not offering it is a notable gap.

**Changes:**

1. Add "Download DOCX" to the export menu.
2. Use the `docx` npm package to generate a clean Word document from the CV data model.
3. The DOCX must be single-column, use ATS-safe fonts (Calibri or Arial), and avoid tables for layout — DOCX visual fidelity will be simpler than the HTML template, and that is correct.
4. File name should default to `"{Name}-Resume.docx"`.

---

## G. Date Handling: Structured Dates Required

**Problem:** Dates are plain `contentEditable` text with no structure. This causes inconsistent formatting across items and ATS parsing failures. ATS research confirms that non-standard date formats and missing months cause systems to miscalculate years of experience or fail to parse employment history entirely.

**Changes:**

1. Replace the `date` text field with a structured date component:
   - `dateStart`: month + year selector (dropdown or masked input `MM/YYYY`).
   - `dateEnd`: month + year selector + "Present" toggle checkbox.
   - For single-date items (Awards, Certifications): a single month + year picker.
2. Store as structured objects: `{ month: number | null, year: number }`.
3. Add a global **Date Format** setting in Document Settings (see section M):
   - `MM/YYYY` → "09/2020" — ATS-safest per research
   - `MMM YYYY` → "Sep 2020"
   - `MMMM YYYY` → "September 2020"
   - `YYYY` → "2020" (year only, for older dates)
4. All dates across the entire CV render using the chosen format consistently.

---

## H. Missing Section Types

### H1. Work Experience
See section A — top priority.

### H2. Languages (Spoken/Written)
Common globally, especially outside the US. No dedicated type currently exists.

1. Add `languages` section type — single-item section similar to Skills.
2. Fields: `languageItems[]` — each has `language` (string) and `proficiency` (enum: Native, Fluent, Advanced, Intermediate, Basic).
3. Render: `Arabic (Native) · English (Fluent) · French (Intermediate)` as an inline list, or as a Skills-style group.

### H3. Publications / Research
Valuable for academic CVs and research roles.

1. Add `publications` section type.
2. Fields per item: `title`, `journal` or `conference`, `date`, `url` (optional), `authors` (optional).
3. Low priority unless the target audience includes students/academics.

### H4. Interests / Hobbies
Common on early-career CVs. Currently requires Custom Section.

1. Add `interests` section type — single-item, single text field, rendered as inline comma-separated text.
2. Lowest priority — trivial to implement.

---

## I. Education Section — Missing Fields

**Problem:** Education items only have `title`, `subtitle`, `date`. Real CVs also list GPA, location, and relevant coursework (especially for recent graduates).

**Changes:**

1. Add optional fields to Education items:
   - `location` — institution city/country.
   - `gpa` — e.g. "3.8/4.0" or "First Class Honours".
   - `coursework` — rendered as an italic line below the degree (e.g. "Relevant coursework: Algorithms, Machine Learning, Databases").
2. Change `date` to `dateStart` + `dateEnd` (structured, using system from section G).
3. Rename field labels for clarity: `title` → "Institution", `subtitle` → "Degree / Program".

---

## J. Projects Section — Missing Fields

**Problem:** Project items only have `title` and `bullets[]`. Missing tech stack and date fields.

**Changes:**

1. Add `technologies` field — rendered as a styled line distinct from achievement bullets (e.g. italic or `Tech: React, Node.js, PostgreSQL`). Separating tech stack from bullets is cleaner and more scannable.
2. Add `url` field (optional) — displayed as a hyperlink in the editor preview, rendered as plain text in print/PDF for ATS safety.
3. Add `dateStart` / `dateEnd` (optional, structured) — the schema currently has no date field for projects despite the layout offering date position options.

---

## K. Header — Missing & Incorrect Patterns

### K1. Professional Headline / Target Role

Modern resume best practice recommends a brief headline below the name (e.g. "Full-Stack Software Engineer | 4 Years Experience"). It is the first text a recruiter reads after the name.

**Change:**

1. Add optional `headline` field in the header, positioned between Name and contact info.
2. Render in smaller font, slightly lighter weight, below the name.

### K2. Social Links in Print Must Be Plain Text URLs

**Problem:** Social links render as icon buttons. In print/PDF, they appear as icon + label. ATS research confirms that icon-based contact info is frequently misread or skipped by parsers. The industry standard for printed CVs is plain text URLs in the contact line.

**Change:**

1. In print/PDF output, render social links as plain text shortened URLs in the contact line: `linkedin.com/in/username | github.com/username`.
2. Strip the `https://` protocol — this is the standard format on printed CVs.
3. Keep icon buttons in the live editor UI — only the print rendering changes.

---

## L. Section Wizard UX Problems

### L1. "Titled Entry" Is Implementation Jargon

**Problem:** "Titled Entry" is a developer-facing term. Users think in terms of "Work Experience", "Education", "Certifications". The grouping also forces an extra click before a type can be selected.

**Change:**

1. Remove the "Titled Entry" expandable group.
2. Show all section types as individual cards in Step 1: Work Experience, Education, Certifications, Awards, Volunteering, Projects, Summary, Skills, Languages, Custom.
3. Group visually: "Common" row (Work Experience, Education, Skills, Summary) and "Additional" row (Projects, Certifications, Awards, Volunteering, Languages, Custom). No extra clicks.

### L2. Wizard Step 2 (Layout Preset) Adds Unnecessary Friction

**Problem:** Asking users to choose layout presets before they've written any content is premature. All options in Step 2 are configurable post-creation via the gear icon.

**Change:**

1. Auto-apply the "Professional" preset for all non-Custom section types and skip Step 2.
2. Users who want layout control use the gear icon after creation.
3. Wizard reduces to: 1 step for standard types, 2 steps for Custom (field definition still needed).

---

## M. Document Settings Panel (New Feature)

**Problem:** The app has no global document settings — everything is per-section or hardcoded. No font control, no paper size, no margin control, no global date format.

**Change: Add a "Document Settings" button in the toolbar** opening a panel containing:

1. **Font Family** — ATS-safe fonts only: Calibri (default), Arial, Georgia, Times New Roman, Garamond, Lato, Open Sans. Applied globally.
2. **Font Size** — base body size: 10pt, 10.5pt, 11pt (default), 11.5pt, 12pt.
3. **Margins** — Narrow (0.5in), Standard (1in, default), Wide (1.25in). Research recommends 0.5–1 inch for ATS.
4. **Paper Size** — A4 (default) / Letter.
5. **Date Format** — global date format (see section G).
6. **Accent Color** — color picker for section title underlines, name text. Default: black.

---

## N. Data Persistence & Portability

### N1. No JSON Export / Import

**Problem:** All data lives in localStorage, which can be wiped at any time. No cross-device transfer is possible.

**Changes:**

1. Add "Export Data (.json)" — downloads full CV state as a JSON file.
2. Add "Import Data (.json)" — loads a JSON file and replaces state (with confirmation dialog).

### N2. No Undo / Redo

**Problem:** Destructive actions are permanent. Only protection is a browser `confirm()` dialog.

**Change:**

1. Implement an undo stack (last 20 actions). Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo).
2. After destructive actions, show a toast notification: "Section deleted. [Undo]" with a 5-second window.

---

## O. Content Quality & Guidance

### O1. Empty Fields Have No Placeholder Guidance

**Problem:** New sections show blank `contentEditable` divs with no hint of what to write. This causes writer's block and results in poor-quality, vague content.

**Change:**

1. Add ghost placeholder text (light gray, disappears on focus) per field:
   - Job title: `e.g. Software Engineer`
   - Company: `e.g. Google`
   - Achievement bullet: `e.g. Led migration of legacy API, reducing response time by 40%`
   - Summary: `e.g. Results-driven engineer with 3+ years building scalable web applications...`
   - Skills value: `e.g. Python, JavaScript, TypeScript`
2. Placeholders should model best-practice patterns: action verbs, quantified results.

### O2. Page Length Awareness

**Problem:** Users have no feedback on how long their CV is. Research recommends 1 page for 0–5 years experience, 1–2 pages for 5–15 years.

**Change:**

1. Add a visual dashed line in the editor showing where page 1 ends (based on A4/Letter dimensions minus current margins).
2. Show a page count indicator in the toolbar: "1 page" / "2 pages" / "3+ pages".
3. Color the indicator yellow/orange if the CV exceeds 2 pages, with a tooltip: "Most roles expect 1–2 pages."

---

## P. Technical Debt

### P1. `document.execCommand` Is Deprecated

**Problem:** The rich text toolbar uses `document.execCommand` for bold/italic/underline. This API is deprecated and may be removed from browsers.

**Change:** Replace with the Selection + Range API wrapping selections in `<strong>`, `<em>`, `<u>` tags, or integrate a lightweight rich-text library (Tiptap Starter Kit).

### P2. Browser `confirm()` Dialogs

**Change:** Replace all `window.confirm()` and `window.alert()` calls with custom in-app modal components matching the app's design system.

### P3. Add Keyboard Shortcut Hints

**Change:** Add tooltips to toolbar buttons: "Bold (Ctrl+B)", "Italic (Ctrl+I)", "Underline (Ctrl+U)", "Print (Ctrl+P)", "Undo (Ctrl+Z)".

---

## Q. Default Section Order in `initialCVData`

Update the default sample CV to follow the ATS-recommended section order. Research confirms section order directly affects ATS parsing accuracy and relevance scoring.

**For experienced professionals:**
1. Header (name, headline, contact info, links)
2. Professional Summary
3. Work Experience ← must come before Education for experienced candidates
4. Skills / Technical Skills
5. Education
6. Projects
7. Certifications
8. Awards
9. Volunteering
10. Languages

**For students / recent graduates:**
1. Header
2. Objective / Summary
3. Education
4. Skills
5. Projects
6. Certifications
7. Activities / Volunteering

**Change:** Add a first-load prompt: "Are you an experienced professional or a student/recent graduate?" to pre-set the appropriate default section order. Users can reorder manually after.

---

## Implementation Priority

| Priority | Changes | Rationale |
|----------|---------|-----------|
| **P0 — Must Have** | A (Work Experience), G (Structured dates), E (PDF download), F (DOCX export), K1 (Headline) | Work Experience is the single biggest missing feature. Dates, PDF, DOCX are baseline expectations of any CV builder in 2026. |
| **P1 — High** | B (ATS heading warnings), C (ATS bullet warning), D (Sidebar ATS warning), I (Education fields), J (Project fields), L1 (Wizard labels fix), M (Document Settings), O1 (Placeholders) | Directly affect ATS output quality and first-use experience. |
| **P2 — Medium** | H2 (Languages section), K2 (Print URLs), L2 (Skip wizard Step 2), N1 (JSON export/import), N2 (Undo/redo), O2 (Page length indicator), P1 (execCommand fix), P2 (Custom modals) | Important for completeness and data safety. App is functional without them. |
| **P3 — Low** | H3 (Publications), H4 (Interests), P3 (Keyboard hints), Q (Default order prompt) | Nice to have. Implement after P0–P2 are stable. |
