# Phase 1: Cloudflare D1 Setup - Context

**Gathered:** 2026-07-13
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase is strictly about setting up the Cloudflare D1 (SQLite) database, the local Wrangler development environment, and creating the necessary schemas for the rest of the project.
</domain>

<decisions>
## Implementation Decisions

### Technical Stack
- We will use Cloudflare D1 for the database.
- We will use Cloudflare Workers (or Pages Functions) to interact with D1.

### Schema Requirements
- `leads`: id, name, email, phone, magnet_type, timestamp.
- `lead_magnets`: id, slug, header, info, bullet_points, profile_photo, title, button_text, mail_content.
- `admin`: username, password_hash.
- `config`: key, value (for global settings like calendar URL).

### the agent's Discretion
- Best practices for setting up the Wrangler `wrangler.toml` file.
- SQLite exact data types.
</decisions>

<canonical_refs>
## Canonical References
No external specs — requirements fully captured in decisions above.
</canonical_refs>

<specifics>
## Specific Ideas
- Ensure the setup handles local development (`wrangler dev`) seamlessly.
</specifics>

<deferred>
## Deferred Ideas
- Connecting the frontend or admin dashboard to these tables (happens in Phase 2+).
</deferred>

---

*Phase: 01-cloudflare-d1-setup*
*Context gathered: 2026-07-13 via manual context collection*
