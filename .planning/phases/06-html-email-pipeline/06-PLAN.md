---
wave: 1
depends_on: []
files_modified: []
autonomous: true
---

# Plan 1: Cloudflare Leads API & Apps Script HTML Email

## Objective
Create the Cloudflare endpoint to save leads to D1, and completely refactor the Google Apps Script (`Code.gs`) to send branded HTML emails and store leads in D1.

## Tasks

### 1. Create Leads API Endpoint
<read_first>
- `schema.sql`
</read_first>
<action>
Create `functions/api/leads.js`.
Export `onRequestPost`.
1. Parse JSON body: `name`, `email`, `phone`, `magnet_type`.
2. Insert into `leads` table in D1.
3. Return `{ success: true }`.
</action>
<acceptance_criteria>
- `functions/api/leads.js` exists and successfully inserts into `env.DB`.
</acceptance_criteria>

### 2. Refactor Code.gs for HTML Email
<read_first>
- `apps-script/Code.gs`
</read_first>
<action>
Update `apps-script/Code.gs`.
1. Set a global constant `API_BASE_URL` to a placeholder (e.g. `'YOUR_CLOUDFLARE_PAGES_URL'`).
2. In `doPost(e)`:
   - Extract `name`, `email`, `phone`, `magnetType` from `e.parameter` or `JSON.parse(e.postData.contents)`. Note: The frontend sends URL-encoded form data or JSON. `js/main.js` sends a FormData object. So use `e.parameter`.
   - Make a `UrlFetchApp.fetch(API_BASE_URL + '/api/magnets')` to get all magnets, then find the one where `slug == magnetType`. (Since we didn't create a GET by slug route, fetching all and filtering is fine for MVP, or we can assume `API_BASE_URL + '/api/magnets/' + magnetType` if we implement a specific route). Let's fetch `/api/magnets` and filter by slug.
   - Parse `mail_content`: replace `\*(.*?)\*` with `<span style="color: #0d9488; font-weight: 600;">$1</span>`. Replace `\n` with `<br>`.
   - Wrap the parsed content in a full HTML template that includes the NHMS logo and styling to match the website.
   - Use `GmailApp.sendEmail(email, subject, plainTextBody, { htmlBody: htmlEmailContent, name: "John Atkins" })`. The subject should be something like "Your resource is here: " + `magnetTitle`.
   - Make a `UrlFetchApp.fetch(API_BASE_URL + '/api/leads', { method: 'post', contentType: 'application/json', payload: JSON.stringify(...) })` to save the lead to D1.
   - Return `ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);`.
</action>
<acceptance_criteria>
- `apps-script/Code.gs` contains logic to fetch magnet info, parse `*text*`, generate HTML, and save the lead to D1.
</acceptance_criteria>

## Verification
- Inspect `Code.gs` to ensure all parsing logic and Cloudflare fetches are correctly implemented using `UrlFetchApp`.

## Must Haves
- The `*text*` formatting MUST be translated into teal (`#0d9488`) spans.
- The `Code.gs` MUST push the lead data back to the Cloudflare D1 database.
