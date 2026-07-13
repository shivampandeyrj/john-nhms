# Phase 4: Lead Magnet CRUD - Context

**Gathered:** 2026-07-13
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase implements the Admin UI for managing custom Lead Magnets and the associated REST API endpoints on Cloudflare Pages Functions to interface with the `lead_magnets` table in D1.
</domain>

<decisions>
## Implementation Decisions

### Technical Stack
- Cloudflare Pages Functions (`functions/api/magnets.js` and `functions/api/magnets/[id].js`).
- Vanilla JavaScript in `admin.html` to render the UI dynamically.

### Schema Fields mapping
- The DB schema for `lead_magnets` is: `id`, `slug`, `header`, `info`, `bullet_points`, `profile_photo`, `title`, `button_text`, `mail_content`.
- The Admin UI must have a form with inputs for each of these fields.

### Mail Content Formatting
- The user specifically requested a custom markdown-like format where `*text*` turns into blue text, and whitespace formatting is preserved.
- This rendering logic will be handled later in Phase 6, but for Phase 4 we just need a `<textarea>` to store the raw custom text.

### the agent's Discretion
- Basic DOM manipulation to render a table or list of existing lead magnets in the Admin Dashboard.
- A modal or a toggleable form to "Add New" or "Edit". For simplicity, a static form at the bottom or top of the page that resets on submit is fine.
</decisions>

<canonical_refs>
## Canonical References
- `schema.sql`
- `.planning/REQUIREMENTS.md`
</canonical_refs>

<specifics>
## Specific Ideas
- In `admin.html`, replace the hardcoded "10K Roadmap" and "Morning Routine" toggles with a dynamic list fetched from the database.
- Each item should have a "Delete" button.
</specifics>

<deferred>
## Deferred Ideas
- Dynamic rendering of the slug page (Phase 5).
</deferred>

---

*Phase: 04-lead-magnet-crud*
*Context gathered: 2026-07-13 via manual context collection*
