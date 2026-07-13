---
wave: 1
depends_on: []
files_modified: []
autonomous: true
---

# Plan 1: Global Configuration & Dynamic Booking URL

## Objective
Create the Admin UI and API for managing global configurations (like the booking widget URL) and update `call.html` to use the dynamic URL from D1.

## Tasks

### 1. Create Config API Endpoint
<read_first>
- `schema.sql`
</read_first>
<action>
Create `functions/api/config.js`.
Export `onRequestGet` and `onRequestPost`.

In `onRequestGet`:
1. Get the `key` query parameter from the URL.
2. Query the `config` table in `env.DB` for this key: `SELECT value FROM config WHERE key = ?`.
3. Return the value as JSON. If not found, return 404.

In `onRequestPost`:
1. Check the `Cookie` header for `admin_session=true` (Basic authorization). If missing, return 401.
2. Parse the JSON body to extract `key` and `value`.
3. UPSERT the configuration into the D1 database: 
   `INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`.
4. Return success JSON.
</action>
<acceptance_criteria>
- `functions/api/config.js` exists.
- `onRequestGet` fetches config by key.
- `onRequestPost` checks admin cookie and upserts the config.
</acceptance_criteria>

### 2. Update Admin Dashboard UI
<read_first>
- `admin.html`
</read_first>
<action>
Update `admin.html`.
1. Modify the "Global Links" section.
2. Ensure the input field for the Calendar Embed URL has an id `bookingUrlInput`.
3. Ensure the button has an id `saveBookingUrlBtn`.
4. Add a `<script>` section at the bottom of the page:
   - On load, `fetch('/api/config?key=booking_url')`. If successful, populate `bookingUrlInput` with the value.
   - On `saveBookingUrlBtn` click, `fetch('/api/config', { method: 'POST', body: JSON.stringify({ key: 'booking_url', value: bookingUrlInput.value }) })`. Show a success alert upon successful save.
</action>
<acceptance_criteria>
- `admin.html` contains the logic to fetch and display the `booking_url`.
- `admin.html` contains the logic to POST the updated `booking_url`.
</acceptance_criteria>

### 3. Update Call Page to be Dynamic
<read_first>
- `call.html`
</read_first>
<action>
Update `call.html`.
1. Remove the hardcoded `src` attribute from the iframe: `<iframe id="bookingIframe" class="booking-iframe" frameborder="0"></iframe>`.
2. Add a `<script>` tag at the bottom of the body.
3. In the script, `fetch('/api/config?key=booking_url')`.
4. If successful, set `document.getElementById('bookingIframe').src = data.value`.
5. If it fails or returns 404, fallback to the original hardcoded URL `https://api.leadconnectorhq.com/widget/bookings/strategy-call-john-atkins`.
</action>
<acceptance_criteria>
- `call.html` iframe `src` is empty initially.
- The script dynamically sets the `src` attribute using the fetched configuration or a fallback.
</acceptance_criteria>

## Verification
- Test that `/api/config?key=booking_url` returns the saved URL.
- Test that `call.html` properly loads the iframe source via the network.

## Must Haves
- `onRequestPost` MUST verify the `admin_session` cookie to prevent unauthorized config changes.
- The `call.html` page MUST have a fallback URL in case the DB is empty.
