# Phase 5: Dynamic Page Generation - Context

**Gathered:** 2026-07-13
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase implements Cloudflare Pages wildcard routing (`functions/[[slug]].js`) to intercept requests to any path (e.g. `domain.com/10k-roadmap`). It will query the D1 database for the matching slug. If found, it injects the database content into a single HTML template and serves it.
</domain>

<decisions>
## Implementation Decisions

### Technical Stack
- Cloudflare Pages Functions wildcard route (`[[slug]].js`).
- `HTMLRewriter` built into Cloudflare Workers to dynamically inject database fields into the HTML structure before sending it to the client.

### Dynamic Rendering
- When a user visits `/{slug}`, the function queries `lead_magnets WHERE slug = ?`.
- If no match (or if it's an existing static file like `/call`), the function returns `next()` to let Pages handle the static file serving.
- If a match is found, the function fetches a master template (e.g., `_magnet_template.html`), uses `HTMLRewriter` to replace specific IDs or elements with the data from the DB, and returns the Response.

### Master Template
- The user indicated "the design will be same just current leadmagnet design and theme".
- We will rename/copy the `10k-roadmap.html` into `_magnet_template.html` to serve as the blueprint.
- We will add specific IDs to elements in the template (e.g., `#dynamicHeader`, `#dynamicTitle`, `#dynamicInfo`) so `HTMLRewriter` can target them easily.

### the agent's Discretion
- Using `HTMLRewriter` is the most performant and elegant way to achieve this on Cloudflare Pages without a full JS framework.
</decisions>

<canonical_refs>
## Canonical References
- `.planning/REQUIREMENTS.md`
- `schema.sql` (to reference `slug`, `header`, `info`, `bullet_points`, `profile_photo`, `title`, `button_text`).
</canonical_refs>

<specifics>
## Specific Ideas
- The form action on the dynamic page must pass the `magnet_type` (the slug or title) so that Phase 6 (Apps Script Email) knows which lead magnet was requested. We can inject the slug into a hidden input field in the form.
</specifics>

<deferred>
## Deferred Ideas
- HTML formatting of the email (Phase 6).
</deferred>

---

*Phase: 05-dynamic-page-generation*
*Context gathered: 2026-07-13 via manual context collection*
