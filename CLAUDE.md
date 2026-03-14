# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Browser-based tool for creating Warcry (Warhammer Age of Sigmar) fighter and ability cards with custom image uploads and editable values. No backend, no persistent storage — everything runs client-side.

## Stack

- **SvelteKit 2 + Vite** (Svelte 5 runes syntax)
- **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin, no config file needed)
- **dom-to-image-more** — PNG card export

## Commands

Node v22+ is required. The system default may be v16 (via Laravel Herd). Use `make` or prefix commands with the Herd Node path.

```bash
make dev       # dev server at http://localhost:5173
make build     # production build
make preview   # preview production build
```

Or directly with the correct Node:
```bash
PATH="$HOME/Library/Application Support/Herd/config/nvm/versions/node/v22.22.0/bin:$PATH" npm run dev
```

## Architecture

### Routes
- `/` — landing page, links to both card editors
- `/fighter` — fighter card editor
- `/ability` — ability card editor

### Key files
- `src/lib/types.ts` — all TypeScript interfaces (`FighterCardData`, `AbilityCardData`, `Weapon`, `Runemark`, etc.)
- `src/app.css` — global styles, Tailwind import, custom font declarations
- `static/fonts/` — `rodchenkoctt.woff2/.woff` (block font for card titles/stats)

### Card rendering approach
Cards are rendered as **CSS/HTML components** (not Canvas). Export uses `dom-to-image-more` at 2× scale for crisp PNGs. This means card visual components are regular Svelte components styled with CSS — no coordinate math.

### Card structure
**Fighter card** (portrait ~600×940px preview):
- Top ~55%: model image area with runemarks overlaid at left/right columns (up to 3 each side)
- Torn paper edge divider (SVG mask)
- Bottom ~45%: parchment area — fighter name, characteristics table, weapons table
- If `isMonster: true`: damage bracket table appended below weapons

**Ability card** (portrait, same ratio):
- Top ~28%: dark maroon header — runemarks row + activation badge (DOUBLE/TRIPLE/QUAD) + card label (ABILITY / HEROIC TRAIT / REACTION)
- Torn paper edge divider
- Bottom ~72%: parchment area — card name, optional italic flavor text, body text

### Fonts
- **Warcry block font** (`rodchenkoctt`) — card names, stats values, activation badge
- **EB Garamond** (Google Fonts) — body text on ability cards
- Font files go in `static/fonts/` (not yet added; declared in `app.css`)

### Background / textures
- Parchment texture: `static/background.jpg` applied to `.card` (full card coverage)
- Dark header / stat tables: `#5a0a14`
- Table value rows and parchment section are transparent so the texture shows through

### Runemark library
SVGs live in `src/lib/runemarks/svg/` (not yet populated). Library metadata in `src/lib/runemarks/index.ts`. Will be sourced from the public domain SVGs in the previous project (HENNIROCKS/warcry-card-creator on GitHub, master branch, `runemarks/` directory).

## Workflow preferences
- Explain plan before making changes. Wait for confirmation.
- At session start, consult `docs/index.html` for prior decisions.
- When asked to "document the session", append a new session panel to `docs/index.html`. Do NOT create separate session files.
- At session end, offer to update/append to `docs/index.html`.

## Documentation conventions (`docs/index.html`)

Single-file, multi-session format. All sessions live in one file with a sidebar nav.

**One session per day.** If multiple conversations happen on the same date, merge them into one panel.

**Session IDs** use `march-DD` format (e.g. `march-12`). Panel element: `id="session-march-DD"`. Section IDs inside: `march-DD-sectionname`.

**Adding a session:**
1. Add a `<button class="session-btn" data-session="march-DD">` entry at the top of the `#session-list` ul (newest first).
2. Add the panel `<div id="session-march-DD" class="session-panel">` before the previous session's panel.
3. Add the new ID at the front of `const sessions = [...]` in the script block.
4. Update the Topic Index (`session-index`) with links to notable new sections.

**Standard panel structure:**
- Hero: date badge (`badge-blue`) + optional status badge(s) (`badge-green`/`badge-amber`) + title + one-line summary
- **What Was Built** — `<h2><span class="icon" style="background:rgba(52,211,153,0.15)">✓</span> What Was Built</h2>` + `<ul>`
- **Key Decisions** — `<h2><span class="icon" style="background:rgba(167,139,250,0.15)">💡</span> Key Decisions</h2>` + `<div class="decision">` blocks (`.decision-q` / `.decision-a`)
- **Still Pending** — `<h2><span class="icon" style="background:rgba(251,191,36,0.15)">⏳</span> Still Pending</h2>` + `<div class="todo-list">` with `<div class="todo-item"><span class="badge badge-amber">todo</span> …</div>`
- **Files Changed** (optional) — `<h2><span class="icon" style="background:rgba(108,142,247,0.15)">📁</span> Files Changed</h2>` + `<table>` with File / Change columns

**Badges:** `badge-blue` = date, `badge-green` = done, `badge-amber` = pending/todo, `badge-purple` = reference.

**Index links** use `onclick="activateSession('march-DD')"` alongside the `href="#section-id"` to switch to the correct panel.
