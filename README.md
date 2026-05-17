# Government Team Capability Website

Single-page React + Vite website for presenting team member capabilities to government stakeholders.

## What Changed

- Removed the old form/admin collection flow from the active app path.
- Added a clean presentation layout:
  - Overview metrics
  - Schema section (field definitions + data flow)
  - Capability tags
  - Search/filter/sortable team profile cards
- Added a **hidden data-entry section in the bottom nav bar** (`Add Data`) for adding members.
- Added a dedicated **CV Manager**:
  - Upload CV PDFs and store public links
  - Toggle per-member visibility (show/hide on public portfolio)
  - Open current CV directly from the dashboard
- Data loading is now DB-first:
  - Uses Supabase when configured (`v_member_portfolio`, `members`, or `team_members`).
  - Falls back to local seed + browser storage only when Supabase is not configured.
- Portfolio form now supports larger, richer fields for long professional bios and multi-line profile data.
- Added schema normalization + local persistence fallback:
  - `src/data/memberSchema.js`
  - Storage key: `gov-team-members-v1`
- Applied Nepal government brand system:
  - `brand.md`
  - `src/styles/globals.css` (with backup `globals.css.bak`)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run locally:
   ```bash
   npm run dev
   ```

## Build & Lint

- `npm run lint`
- `npm run build`

## Supabase upgrade patch

If your existing database throws `column m.cv_url does not exist` or `relation public.team_members does not exist`, run:

- `supabase/nghtt_schema.sql` (base schema)
- `supabase/nghtt_schema_cv_patch.sql` (safe CV/visibility patch)
- `supabase/nghtt_manage_lock.sql` (PIN-based Start/Stop Manage/Edit controls)

After running `nghtt_manage_lock.sql`, set your own PIN in Supabase SQL editor by running the insert snippet included at the bottom of that file.
