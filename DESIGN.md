# DESIGN.md

## Color Strategy

**Restrained** — tinted mint-paper neutrals carry 90% of the surface. One emerald accent ≤10%. The Himalaya photograph carries the brand identity; chrome stays quiet.

### Tokens (current, in OKLCH-ready form)

| Role | Hex | OKLCH | Use |
|---|---|---|---|
| Aurora base | `#EEF8F4` | `oklch(0.96 0.01 165)` | Page background, tinted mint-paper |
| Foreground | `#052E2C` | `oklch(0.24 0.025 180)` | Body text, headlines |
| Muted foreground | `#4A6A65` | `oklch(0.49 0.02 175)` | Secondary copy |
| Primary (emerald) | `#059669` | `oklch(0.62 0.14 158)` | Single brand accent |
| Accent (deep teal) | `#0D9488` | `oklch(0.60 0.10 184)` | Brand tagline, secondary marks |
| Surface rule | `rgba(5,46,44,0.08)` | — | Borders, dividers |

**Never use** `#fff` or `#000`. All neutrals tint toward forest-teal.

## Typography

Single typeface: **Manrope** (humanist sans, weights 400–800). Numeric/code: **IBM Plex Mono** for tabular numerals only.

| Step | Size | Weight | Use |
|---|---|---|---|
| Eyebrow | 12px / 0.18em tracking | 700 mono | Section labels |
| Body | 14–17px / 1.6 line-height | 400 | Copy |
| Sub-headline | 19–28px | 700 | Card titles |
| Section H2 | 30–46px | 700 | Section openers |
| Hero H1 | 36–80px | 800 | Home only |

Hierarchy ratio: ≥1.4 between adjacent steps.

## Spacing

8px base scale. Vertical section rhythm: 80–128px between sections.

## Motion

- Easing: `--ease-out-quart` `cubic-bezier(0.25, 1, 0.5, 1)` (entrance + UI feedback)
- Duration: 150ms (feedback), 240ms (state change), 400ms (entrance only)
- Never animate `width`, `height`, `top`, `left`. Only `transform` + `opacity`.
- Respect `prefers-reduced-motion`.

## Components

- **Buttons**: 42px tall, 14px label, pill radius. Primary = solid emerald; ghost = transparent + border.
- **Cards**: 18px radius, mint-tinted white glass (`rgba(255,255,255,0.50)`). Only when elevation communicates hierarchy.
- **Navbar**: opaque mint paper at 95%, fixed, with NGHTT mark + tagline + section nav.
- **Eyebrow**: tracked mono caps as section labels.

## Banned Patterns (project-specific)

- No gradient text (`bg-clip-text`) — use weight + color contrast
- No identical 3-up or 4-up icon-title-body card rows
- No "big number / small label" hero-metric strips
- No em dashes in copy (use commas, colons, periods)
- No side-stripe colored borders (use full borders or numerals)
- Cards only when elevation communicates hierarchy, never decoratively
