# Requirements

## Epic: Admin Dashboard & Auth
- [ ] Implement `/admin` protected route.
- [ ] Create simple ID/Password authentication backed by Cloudflare D1.
- [ ] Admin logout functionality.

## Epic: Cloudflare D1 Database Setup
- [ ] Initialize Cloudflare D1 SQLite Database.
- [ ] Create schema for `leads` (id, name, email, phone, magnet_type, timestamp).
- [ ] Create schema for `lead_magnets` (id, slug, header, info, bullet_points, profile_photo, title, button_text, mail_content).
- [ ] Create schema for `config` (key, value) for global settings like Google Calendar URL.

## Epic: Lead Magnet Management (CRUD)
- [ ] Dashboard view listing all existing lead magnets.
- [ ] Form to add a new lead magnet with custom slug URL mapping.
- [ ] Ability to edit and delete lead magnets.
- [ ] Markdown/Text editor capability for mail content (`*text*` = blue).

## Epic: Dynamic Lead Magnet Delivery
- [ ] Setup Cloudflare Pages / Workers to intercept `/{slug}` routes.
- [ ] If `slug` matches a lead magnet in D1, render the generic lead magnet HTML template dynamically populated with D1 data.
- [ ] Form submission captures lead and pushes to D1.

## Epic: Email Automation
- [ ] Update frontend to trigger Cloudflare Worker on form submit.
- [ ] Cloudflare Worker triggers existing Google Apps Script webhook passing lead info AND formatted HTML mail content.
- [ ] Apps Script sends HTML-formatted email via GmailApp.

## Epic: Global Settings
- [ ] Admin UI to update Google Calendar Embed URL.
- [ ] `/call` page dynamically loads the calendar embed URL from D1.
