---
wave: 1
depends_on: []
files_modified: []
autonomous: true
---

# Plan 1: Dynamic Page Generation with HTMLRewriter

## Objective
Create a wildcard Pages Function to intercept URL slugs, query D1 for lead magnet data, and serve a dynamically populated HTML template using Cloudflare's `HTMLRewriter`.

## Tasks

### 1. Create the Master HTML Template
<read_first>
- `10k-roadmap.html` (The baseline design)
</read_first>
<action>
Create a new file `_magnet_template.html` in the root directory.
Copy the entire content of `10k-roadmap.html` into `_magnet_template.html`.
Modify the HTML elements in `_magnet_template.html` to add IDs so `HTMLRewriter` can target them easily:
- Add `id="dyn-header"` to the header (e.g., the `.badge` or pre-title element).
- Add `id="dyn-title"` to the main `<h1>` title.
- Add `id="dyn-info"` to the subtitle `<p>`.
- Add `id="dyn-bullets"` to the `<ul>` list container.
- Add `id="dyn-photo"` to the profile `<img>` (if it exists, or the container).
- Add `id="dyn-name-title"` to the name/title block below the photo.
- Add `id="dyn-btn"` to the submit button.
- Add `<input type="hidden" id="dyn-slug" name="magnet_slug" value="">` inside the lead form.
</action>
<acceptance_criteria>
- `_magnet_template.html` exists.
- Contains the required `id="dyn-..."` attributes.
</acceptance_criteria>

### 2. Create the Wildcard Function
<read_first>
- `_magnet_template.html`
</read_first>
<action>
Create `functions/[[slug]].js`.
Export `onRequestGet`.
In the function:
1. Extract the slug from `context.params.slug`. (If it's an array, join it with `/`. If not present, return `next()`).
2. If the slug matches known static assets or pages (e.g., `css`, `js`, `assets`, `admin`, `api`, `call`), return `next()`.
3. Query D1 `env.DB` for `SELECT * FROM lead_magnets WHERE slug = ?`.
4. If no result, return `next()` (maybe it's a static file we didn't explicitly ignore).
5. If found, fetch the master template: `const templateRes = await env.ASSETS.fetch(new Request(new URL('/_magnet_template.html', request.url)));`
6. Use `HTMLRewriter` on `templateRes` to replace the inner HTML of the targeted IDs with the data from the database.
   - `#dyn-header`: `element.setInnerContent(data.header)`
   - `#dyn-title`: `element.setInnerContent(data.title)`
   - `#dyn-info`: `element.setInnerContent(data.info)`
   - `#dyn-bullets`: Generate `<li><i class="..."></i><span>${bullet}</span></li>` for each bullet (split by `\n`).
   - `#dyn-btn`: `element.setInnerContent(data.button_text)`
   - `#dyn-slug`: `element.setAttribute('value', data.slug)`
   - If `data.profile_photo` exists, update `#dyn-photo` src.
7. Return the modified Response.
</action>
<acceptance_criteria>
- `functions/[[slug]].js` exists.
- It queries the DB based on the path.
- It uses `HTMLRewriter` to inject the DB values into `_magnet_template.html`.
- Returns `next()` for non-matching or static routes.
</acceptance_criteria>

## Verification
- Test visiting `/10k-roadmap` (after ensuring it's in the DB) to see if it renders properly.
- Test visiting `/some-fake-url` to ensure it falls through to a 404 or index correctly.

## Must Haves
- The `magnet_slug` hidden input MUST be injected so the form submission endpoint knows which magnet was requested (for Phase 6).
- The `HTMLRewriter` MUST properly escape HTML to prevent XSS (Cloudflare's `setInnerContent` does this automatically).
