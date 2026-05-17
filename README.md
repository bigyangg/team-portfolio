# Government Team Capability Website

Single-page React + Vite website for presenting team member capabilities to government stakeholders.

Current data is curated from files in `docs/TEAM`.

## What Changed

- Removed the old form/admin collection flow from the active app path.
- Added a clean presentation layout:
  - Overview metrics
  - Schema section (field definitions + data flow)
  - Capability tags
  - Search/filter/sortable team profile cards
- Added a **hidden data-entry section in the bottom nav bar** (`Add Data`) so you can append members whose CV is not ready yet.
- Added schema normalization + local persistence:
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
