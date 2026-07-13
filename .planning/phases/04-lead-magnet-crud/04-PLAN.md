---
wave: 1
depends_on: []
files_modified: []
autonomous: true
---

# Plan 1: Lead Magnet API & Admin UI

## Objective
Create the Cloudflare Functions API for CRUD operations on lead magnets and update `admin.html` to allow admins to manage them.

## Tasks

### 1. Create Lead Magnets API
<read_first>
- `schema.sql`
- `functions/api/config.js` (for authentication example)
</read_first>
<action>
Create `functions/api/magnets.js`.
Export `onRequestGet` to fetch all magnets (SELECT * FROM lead_magnets).
Export `onRequestPost` to create a new magnet. It must check for `admin_session=true` in cookies.
It should accept JSON body with: `slug`, `header`, `info`, `bullet_points`, `profile_photo`, `title`, `button_text`, `mail_content`.
Insert these into the `lead_magnets` table. Return the inserted ID.

Create `functions/api/magnets/[id].js`. (Note: use `[[id]].js` or `[id].js` based on Pages Functions routing. The correct file name is `[id].js`).
Export `onRequestDelete` to delete a magnet by ID. It must check for `admin_session=true`.
Delete from `lead_magnets` where id = context.params.id.
</action>
<acceptance_criteria>
- `functions/api/magnets.js` exists with GET and POST handlers.
- POST handler verifies admin cookie.
- `functions/api/magnets/[id].js` exists with DELETE handler that verifies admin cookie.
</acceptance_criteria>

### 2. Update Admin HTML UI for Magnets
<read_first>
- `admin.html`
</read_first>
<action>
Update `admin.html` in the "Manage Lead Magnets" section.
Remove the hardcoded `.config-card` elements for 10K Roadmap and Morning Routine.
Replace it with two main sections:
1. `<div id="magnetsList"></div>` - Where existing magnets will be rendered.
2. A new `<div class="config-card">` with an "Add New Lead Magnet" form.
The form should contain inputs/textareas for:
- Slug (URL path, e.g. `10k-roadmap`)
- Header Text
- Information Text (Textarea)
- Bullet Points (Textarea, newline separated)
- Profile Photo URL
- Name & Title
- Button Text
- Mail Content (Textarea, explain `*text*` = blue format)

Add JavaScript inside the DOMContentLoaded block to:
- `loadMagnets()`: fetch `/api/magnets` and render them into `#magnetsList` as cards with a Delete button.
- Delete button click: `fetch('/api/magnets/' + id, { method: 'DELETE' })` then reload list.
- Form submit: `fetch('/api/magnets', { method: 'POST' })` with the form data, then reset form and reload list.
</action>
<acceptance_criteria>
- `admin.html` contains the dynamic `#magnetsList` container.
- Contains the comprehensive "Add Lead Magnet" form with all required fields.
- JS handles fetching, rendering, deleting, and creating magnets.
</acceptance_criteria>

## Verification
- Load `/admin.html` in the browser.
- Add a test lead magnet with a custom slug and verify it appears in the list.
- Delete the lead magnet and verify it disappears.

## Must Haves
- The API POST and DELETE methods MUST be protected by the `admin_session` cookie.
- The mail content field MUST be a `<textarea>` to preserve whitespace formatting.
