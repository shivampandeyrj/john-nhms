# Phase 6: HTML Email Pipeline - Context

**Gathered:** 2026-07-13
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase updates the Google Apps Script (`Code.gs`) to process form submissions, fetch the corresponding lead magnet from the Cloudflare API, format the custom `mail_content` into HTML (with markdown-like `*text*` blue styling), send the email using `GmailApp`, and store the lead in the `leads` table in D1.
</domain>

<decisions>
## Implementation Decisions

### Technical Stack
- Google Apps Script (`Code.gs`) for `doPost`.
- Cloudflare Pages Functions (`/api/leads` and `/api/magnets/[slug]`) for data retrieval and storage.

### Data Flow
1. User submits form on frontend (handled by `js/main.js`).
2. `js/main.js` sends POST to the Apps Script URL with `name`, `email`, `phone`, and `magnetType`.
3. `Code.gs` receives the POST.
4. `Code.gs` fetches the magnet details from `https://{domain}/api/magnets/{magnetType}`.
5. `Code.gs` parses the `mail_content`, replacing `*text*` with `<span style="color: #008080;">text</span>`, and converts line breaks to `<br>`.
6. `Code.gs` sends the formatted HTML email via `GmailApp`.
7. `Code.gs` sends a POST to `https://{domain}/api/leads` to save the lead in D1.
8. `Code.gs` returns success to the frontend.

### the agent's Discretion
- Since we don't know the final domain yet, we should use a placeholder or config variable in Apps Script for the API base URL.
- I will create the `/api/leads` endpoint in Cloudflare to accept the lead data.
</decisions>

<canonical_refs>
## Canonical References
- `.planning/REQUIREMENTS.md`
- `schema.sql` (to reference `leads` table).
</canonical_refs>

<specifics>
## Specific Ideas
- The email must look visually identical to the website's theme (fonts, colors, spacing). We can embed a basic HTML template in Apps Script.
</specifics>

<deferred>
## Deferred Ideas
- N/A - Final phase.
</deferred>

---

*Phase: 06-html-email-pipeline*
*Context gathered: 2026-07-13 via manual context collection*
