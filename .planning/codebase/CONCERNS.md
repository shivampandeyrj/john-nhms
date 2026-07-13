# Concerns & Technical Debt

## Security
- `admin.html` is currently a static mockup without authentication.
- Need to implement Admin ID/Password as per user request.

## Scalability & Maintenance
- Duplicate lead magnet HTML pages. Adding new lead magnets requires duplicating files. User wants a dynamic form to add them via admin dashboard with custom slugs.
- Google Sheets backend should be migrated to Cloudflare D1 for better performance and robustness as requested.

## Networking
- `main.js` uses `mode: 'no-cors'` for the fetch request, which prevents the frontend from reading the actual response from Apps Script.
