# Execution Roadmap

## Milestone 1: Cloudflare Infrastructure & Auth

### Phase 1: Cloudflare D1 Setup
- [ ] Create D1 schemas (`leads`, `lead_magnets`, `admin`, `config`)
- [ ] Setup Cloudflare Pages/Workers environment (Wrangler configuration)
- [ ] Create basic API endpoints for DB connection testing

### Phase 2: Admin Authentication
- [ ] Build `/admin/login` page UI
- [ ] Implement login API route in Cloudflare Workers validating against D1
- [ ] Implement JWT/Cookie based session management for protected admin routes

## Milestone 2: Lead Magnet CMS

### Phase 3: Global Configuration
- [ ] Admin Dashboard UI for updating Global Configs (Google Calendar URL)
- [ ] API routes to GET/PUT config
- [ ] Update `/call` page to dynamically fetch and embed the Calendar URL

### Phase 4: Lead Magnet CRUD
- [ ] Admin Dashboard UI for listing, adding, and deleting Lead Magnets
- [ ] Dynamic form including custom URL slug, header, bullets, profile, button text, and custom mail format
- [ ] API routes to GET/POST/DELETE lead magnets in D1

### Phase 5: Dynamic Page Generation
- [ ] Create single generic Lead Magnet HTML template (`magnet-template.html`)
- [ ] Setup Cloudflare Worker route `/:slug` to fetch magnet data from D1
- [ ] Render template with data if slug exists (404 otherwise)
- [ ] Connect form submission on dynamic page to Worker API to save lead to D1

## Milestone 3: Apps Script & Email Automation

### Phase 6: HTML Email Pipeline
- [ ] Refactor `apps-script/Code.gs` to accept HTML body instead of just plain text
- [ ] Refactor Cloudflare Worker to parse custom mail format (`*text*` to `<span style="color:blue">text</span>`)
- [ ] Connect Cloudflare Worker to trigger Apps Script Webhook on new lead submission
- [ ] Send branded HTML email and verify receipt
