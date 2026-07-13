---
wave: 1
depends_on: []
files_modified: []
autonomous: true
---

# Plan 1: Cloudflare D1 Database & Environment Setup

## Objective
Initialize the Cloudflare Wrangler environment, create the D1 database, and configure the schema for leads, lead magnets, admins, and configs.

## Tasks

### 1. Initialize Wrangler configuration
<read_first>
- (None - Creating new)
</read_first>
<action>
Create a `wrangler.toml` file in the root directory. Add the basic configuration for a Cloudflare Pages project that uses a D1 database.
Add the following content:
```toml
name = "nhms-lead-engine"
pages_build_output_dir = "."
compatibility_date = "2024-03-20"

[[d1_databases]]
binding = "DB"
database_name = "nhms-leads-db"
database_id = "pending-id" # Will be updated after creating the DB
```
</action>
<acceptance_criteria>
- `wrangler.toml` exists in the root directory.
- `cat wrangler.toml` contains `binding = "DB"`.
</acceptance_criteria>

### 2. Create Schema File
<read_first>
- (None - Creating new)
</read_first>
<action>
Create a `schema.sql` file in the root directory. Define the 4 tables required for the project:
```sql
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    magnet_type TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lead_magnets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    header TEXT NOT NULL,
    info TEXT,
    bullet_points TEXT,
    profile_photo TEXT,
    title TEXT,
    button_text TEXT,
    mail_content TEXT
);

CREATE TABLE IF NOT EXISTS admin (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
```
</action>
<acceptance_criteria>
- `schema.sql` exists in the root directory.
- `cat schema.sql` contains `CREATE TABLE IF NOT EXISTS lead_magnets`.
</acceptance_criteria>

### 3. Initialize Cloudflare Pages Functions Structure
<read_first>
- (None - Creating new)
</read_first>
<action>
Create a `functions` directory in the root. This is required by Cloudflare Pages to host the backend API routes.
Inside `functions`, create a `api` directory to organize the API routes we will build in Phase 2.
</action>
<acceptance_criteria>
- `functions/api` directory exists.
</acceptance_criteria>

## Verification
- Run `ls -la` to ensure `wrangler.toml`, `schema.sql`, and `functions/api` exist.
- Inspect `schema.sql` to verify all 4 tables are defined with the correct columns.

## Must Haves
- The schema MUST include all fields required by the PRD for lead magnets (slug, header, info, etc.).
- The `wrangler.toml` MUST bind the D1 database to `DB`.
