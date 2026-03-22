# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Browser-based tool for creating Warcry (Warhammer Age of Sigmar) fighter and text cards with custom image uploads and editable values. No backend, no persistent storage — everything runs client-side.

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
- `/text` — text card editor

### Key files

- `src/lib/types.ts` — all TypeScript interfaces (`FighterCardData`, `TextCardData`, `Weapon`, `Runemark`, etc.)
- `src/app.css` — global styles, Tailwind import, custom font declarations
- `static/fonts/` — self-hosted font files and license texts

### Card rendering approach

Cards are rendered as **CSS/HTML components** (not Canvas). Export uses `dom-to-image-more` at 2× scale for crisp PNGs. This means card visual components are regular Svelte components styled with CSS — no coordinate math.

### Card structure

**Fighter card** (portrait ~600×940px preview):

- Top ~55%: model image area with runemarks overlaid at left/right columns (up to 3 each side)
- Torn paper edge divider (SVG mask)
- Bottom ~45%: parchment area — fighter name, characteristics table, weapons table
- If `isMonster: true`: damage bracket table appended below weapons

**Text card** (portrait, same ratio):

- Top ~28%: dark maroon header — runemarks row + activation badge (DOUBLE/TRIPLE/QUAD) + card label (preset slugs: ability, reaction, heroic-trait, battle-trait, lesser-artefact, greater-artefact, divine-blessing — or custom text)
- Torn paper edge divider
- Bottom ~72%: parchment area — card name, then (each independently toggled): flavor text (italic), points cost increases table (2-col, Regular/Elite rows), prerequisite text (framed box), body text
- Show/hide flags on `TextCardData`: `showRunemarks`, `showActivation`, `showFlavorText`, `showPrerequisite`, `showPointsTable` — collapsing both the card element and its form field

### Fonts

- **Germania One** (`static/fonts/GermaniaOne-Regular.ttf`, family `'Germania One'`, weight 400, SIL OFL) — card names, stats values, activation badge, all block-style text
- **Alegreya** (`static/fonts/Alegreya-Regular.ttf` + `Alegreya-Italic.ttf`, family `'Alegreya'`, SIL OFL) — damage table, text card body/flavor text

### Background / textures

- Parchment texture: `static/background.jpg` applied to `.card` (full card coverage)
- Dark header / stat tables: `#5a0a14`
- Table value rows and parchment section are transparent so the texture shows through

### Runemark library

SVGs live in `src/lib/runemarks/svg/` (203 files). Library metadata in `src/lib/runemarks/index.ts`.

## Code style

- **Import groups**: sorted alphabetically by the name the variable represents (not by variable name prefix). Each logical group has one header comment; no orphan imports between groups.
- **Object key quoting**: only quote keys that require it — keys containing spaces or hyphens. Single-word plain-identifier keys are unquoted.
- **On-touch cleanup**: when editing any file, also fix incremental-accumulation artifacts in that file — unsorted imports, duplicate or `(additional)`-suffixed section headers, unnecessary quotes. Do not audit unrelated files speculatively.

## Workflow preferences

- Explain plan before making changes. Wait for confirmation.
- At session start, consult `docs/index.html` for prior decisions.
- When asked to "document the session", append a new session panel to `docs/index.html`. Do NOT create separate session files.
- At session end, offer to update/append to `docs/index.html`.
- **Never** run `git commit` or `git push` (any variant). User manages all git operations.
- When redundant files are identified (stale build output, `.DS_Store`, empty placeholders, orphaned assets), delete them without asking.

## Documentation conventions (`docs/index.html`)

Single-file, multi-session format. All sessions live in one file with a sidebar nav.

**One session per day.** If multiple conversations happen on the same date, merge them into one panel.

**Session IDs** use `march-DD` format (e.g. `march-12`). Panel element: `id="session-march-DD"`. Section IDs inside: `march-DD-sectionname`.

**Adding a session:**

1. Add a `<button class="session-btn" data-session="march-DD">` entry at the top of the `#session-list` ul (newest first).
2. Add the panel `<div id="session-march-DD" class="session-panel">` before the previous session's panel.
3. Add the new ID at the front of `const sessions = [...]` in the script block.
4. Update the Topic Index (`session-index`) with links to notable new sections.

**Every `<section>` inside a panel must have both** `id="march-DD-sectionname"` and `data-nav="Label"` attributes — `data-nav` populates the sidebar nav.

**Standard panel structure:**

- Hero: date badge (`badge-blue`) + exactly 3 `badge-green` badges (short noun phrases, never "Done") + title + one-line summary
- **What Was Built** — `<h2><span class="icon" style="background:rgba(52,211,153,0.15)">✓</span> What Was Built</h2>` + `<ul>`
- **Key Decisions** — `<h2><span class="icon" style="background:rgba(196,144,108,0.15)">💡</span> Key Decisions</h2>` + `<div class="decision">` blocks (`.decision-q` / `.decision-a`)
- **Still Pending** — `<h2><span class="icon" style="background:rgba(251,191,36,0.15)">⏳</span> Still Pending</h2>` + `<table>` with Status / Item columns; badge (`badge-amber`) in first `<td>`, item text in second. Do NOT use `.todo-list` / `.todo-item` divs.
- **Files Changed** (optional) — `<h2><span class="icon" style="background:rgba(212,112,112,0.12)">📁</span> Files Changed</h2>` + `<table>` with File / Change columns

**Badges:** `badge-blue` = date, `badge-green` = done, `badge-amber` = pending/todo, `badge-purple` = reference.

**Index links** use `onclick="activateSession('march-DD')"` alongside the `href="#section-id"` to switch to the correct panel.

**After every edit to `docs/index.html`:** read back the changed area and verify HTML structure — all new content sits inside a `<section>`, no orphaned tags, no mismatched `</section>` closers.
