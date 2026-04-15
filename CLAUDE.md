# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal fitness tracking web app — a single-page mobile-first HTML/CSS/JS app with no build step, no framework, and no dependencies beyond Google Fonts. Open `index.html` directly in a browser or serve it locally.

## Running locally

```bash
# Any static file server works, e.g.:
python3 -m http.server 8080
# then open http://localhost:8080
```

There is no build, no lint step, and no test suite.

## Architecture

Three files, no modules:

- **`index.html`** — All markup. Contains five "pages" (`#page-home`, `#page-train`, `#page-nutrition`, `#page-track`, `#page-plan`) toggled by the `.active` class. Nav is a fixed bottom bar.
- **`styles.css`** — All styles. Dark theme via CSS custom properties on `:root`. Fonts: Barlow Condensed (headings/numbers) and Barlow (body). No utility classes — styles are component-specific.
- **`app.js`** — All logic. No classes, just functions called at the bottom on page load. Persistence is `localStorage` only.

### Key JS globals

- `START = 282`, `GOAL = 222` — hardcoded weight targets used for progress calculations
- `entries` — weight log array, mirrors `localStorage['weight_log']`
- `WEEK_PLAN` — object keyed by day-of-week (0–6) defining daily checklist tasks

### localStorage keys

| Key | Contents |
|-----|----------|
| `weight_log` | JSON array of `{date, weight, ts}` objects |
| `checklist_<dateString>` | JSON array of completed checklist indices for today |
| `workout_check_<day>_<dateString>` | JSON array of completed movement IDs for day a/b/c |
| `ex_weight_<key>` | Saved weight (lbs) for a specific exercise input |

### Workout tracking

Workout movements use `data-check-id` attributes with a namespaced format: `<day>-<section>-<index>` (e.g. `a-wu-0`, `b-ex-3`, `c-mob-1`). `applyCheckedState(day, checked)` reads all DOM elements matching a day prefix and syncs their `.done` class and count badges.
