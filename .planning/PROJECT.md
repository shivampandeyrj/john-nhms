# NHMS Lead Engine Modernization

This project transforms the existing static NHMS Lead Engine into a dynamic, database-driven platform. We are replacing the manual Google Sheets backend with Cloudflare D1, implementing a secure Admin Dashboard for managing custom lead magnets, and upgrading email automation to use branded HTML/CSS templates via Google Apps Script.

## Requirements

### Validated
- ✓ Google Apps Script Webhook — existing endpoint for form submissions
- ✓ Frontend Lead Capture Forms — existing HTML forms with international phone validation
- ✓ Exit Intent Popup — existing lead capture mechanism

### Active
- [ ] **Cloudflare D1 Integration**: Setup D1 database to store leads, lead magnets configurations, and admin credentials.
- [ ] **Admin Dashboard**: Secure `/admin` route with ID/Password authentication.
- [ ] **Lead Magnet CRUD**: Interface in admin dashboard to create, view, and delete lead magnets.
- [ ] **Dynamic Lead Magnet Pages**: Generate custom URLs (slugs) for new lead magnets. Use Cloudflare Workers/Pages Functions to serve a dynamic template injected with D1 data (header, info, bullet points, profile photo, name/title, custom button text).
- [ ] **Calendar Embed Management**: Admin input for embedding Google Calendar URLs into the `/call` page.
- [ ] **Dynamic HTML Emails**: Admin interface to write email content with basic markdown formatting (e.g., `*text*` becomes blue text, preserving spaces).
- [ ] **Apps Script Email Delivery**: Cloudflare triggers Apps Script to send the branded HTML/CSS email when a lead is captured.

### Out of Scope
- Complete redesign of the website aesthetics — We are keeping the existing graphics and CSS, simply making the content dynamic.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Database: Cloudflare D1 over Google Sheets** | Google Sheets is slow, lacks relations, and is not a true database. Cloudflare D1 (SQLite) is fast, scalable, and perfect for relational data (leads + dynamic pages). | — Pending |
| **Backend: Cloudflare Workers main, Apps Script for Email** | Cloudflare Workers will handle the database operations (CRUD, Auth) and dynamic routing for low latency. Apps Script is retained *solely* because it is an excellent free tier for sending emails via GmailApp. | — Pending |
| **Dynamic Routing: Cloudflare Pages Functions** | Instead of duplicating HTML files for every lead magnet, a Cloudflare Function will catch the URL slug, fetch the magnet config from D1, and render a single HTML template dynamically. | — Pending |

---
*Last updated: 2026-07-13 after initialization*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
