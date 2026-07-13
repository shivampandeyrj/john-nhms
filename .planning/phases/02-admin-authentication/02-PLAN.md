---
wave: 1
depends_on: []
files_modified: []
autonomous: true
---

# Plan 1: Admin Login Interface & API

## Objective
Implement the `/admin/login` UI and the Cloudflare Pages Function to authenticate admins against the D1 database.

## Tasks

### 1. Create Login Page UI
<read_first>
- `css/styles.css`
</read_first>
<action>
Create `admin-login.html` (which will be routed to `/admin/login`).
The UI should match the premium, clean design of the main site (using `var(--color-teal)` etc).
It should contain a simple form with:
- Username input
- Password input
- Login button
- Error message container (hidden by default)
Include a script tag at the bottom to handle the form submission via `fetch` to `/api/auth/login`.
</action>
<acceptance_criteria>
- `admin-login.html` exists.
- The file contains a form with inputs for username and password.
- The script prevents default submission and fetches `/api/auth/login`.
</acceptance_criteria>

### 2. Create Auth API Route
<read_first>
- `schema.sql` (to reference the admin table)
</read_first>
<action>
Create `functions/api/auth/login.js`.
Export a `onRequestPost` function.
It should:
1. Parse the JSON body for `username` and `password`.
2. Query the D1 database (bound as `env.DB`) for `SELECT password_hash FROM admin WHERE username = ?`.
3. For this simple MVP, compare the submitted password against the hash (or plain string if we keep it simple for now, but a simple hash is preferred). If we assume the DB holds a raw password for the initial seed, we can just do a direct match for now, or use `crypto.subtle.digest('SHA-256')`. Let's just do a plain string match for the MVP since we haven't seeded the DB yet.
4. If successful, return a Response with `Set-Cookie: admin_session=true; HttpOnly; Path=/; Max-Age=86400` and a JSON success message.
5. If failure, return a 401 Unauthorized status.
</action>
<acceptance_criteria>
- `functions/api/auth/login.js` exists.
- Contains `export async function onRequestPost({ request, env })`.
- Queries `env.DB`.
- Returns `Set-Cookie` header on success.
</acceptance_criteria>

### 3. Protect Admin Dashboard
<read_first>
- `admin.html`
</read_first>
<action>
Update `admin.html` to include a small script at the very top (before rendering) that checks for the session. Wait, since it's a static HTML file, we can't read `HttpOnly` cookies via JavaScript.
Instead, we must protect the route via Cloudflare Functions middleware.
Create `functions/admin/_middleware.js`.
Export an `onRequest` function.
It should read the `Cookie` header.
If `admin_session=true` is present, it calls `next()`.
If not, it returns a `Response.redirect('/admin-login.html', 302)`.
</action>
<acceptance_criteria>
- `functions/admin/_middleware.js` exists.
- Checks for `admin_session=true` cookie.
- Redirects to `/admin-login.html` if missing.
</acceptance_criteria>

## Verification
- Check that the `functions/api/auth/login.js` and `functions/admin/_middleware.js` exist.
- Verify `admin-login.html` has the correct form fields.

## Must Haves
- Admin dashboard must be inaccessible without the cookie.
- API must validate against D1 `env.DB`.
