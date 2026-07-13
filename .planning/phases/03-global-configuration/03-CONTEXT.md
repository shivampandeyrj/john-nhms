# Phase 3: Global Configuration - Context

**Gathered:** 2026-07-13
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase implements the ability for the Admin to update global configuration settings (specifically the LeadConnector / Calendar Booking iframe URL) and for the frontend `call.html` page to dynamically load this URL from the Cloudflare D1 database.
</domain>

<decisions>
## Implementation Decisions

### Technical Stack
- Cloudflare Pages Functions (`functions/api/config.js`) for CRUD operations on the `config` table.
- Vanilla JS on the frontend to fetch and update the UI.

### Booking URL Dynamic Loading
- The `call.html` page currently hardcodes `<iframe src="https://api.leadconnectorhq.com/widget/bookings/strategy-call-john-atkins" class="booking-iframe" frameborder="0"></iframe>`.
- We will update `call.html` to load the URL dynamically via an API fetch to `/api/config?key=booking_url`.

### the agent's Discretion
- For the admin dashboard UI, we will add a section to save the `booking_url` configuration to D1.
</decisions>

<canonical_refs>
## Canonical References
- `.planning/REQUIREMENTS.md`
</canonical_refs>

<specifics>
## Specific Ideas
- Ensure the `booking-iframe` defaults to empty or a loader until the API returns the URL.
</specifics>

<deferred>
## Deferred Ideas
- Dynamic Lead Magnet page generation (Phase 4 & 5).
</deferred>

---

*Phase: 03-global-configuration*
*Context gathered: 2026-07-13 via manual context collection*
