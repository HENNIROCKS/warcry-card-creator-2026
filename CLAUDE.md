# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Browser-based tool for creating Warcry (Warhammer Age of Sigmar) fighter cards, text/ability cards, deployment cards, and card backs with custom image uploads and editable values. No backend, no persistent storage — everything runs client-side.

## Stack

- **SvelteKit 2 + Vite** (Svelte 5 runes syntax)
- **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin, no config file needed)
- **dom-to-image-more** — PNG export (desktop); **modern-screenshot** (`domToPng`) — PNG export (mobile)
- **PWA** — installable via `static/site.webmanifest`; no service worker, no offline mode

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

- `/` — landing page, links to all four card editors
- `/fighter` — fighter card editor
- `/text` — text/ability card editor
- `/deployment` — deployment card editor
- `/card-back` — card back editor

### Key files

- `src/lib/types.ts` — all TypeScript interfaces (`FighterCardData`, `TextCardData`, `DeploymentCardData`, `Weapon`, `Runemark`, etc.)
- `src/lib/i18n/index.svelte.ts` — i18n store; exports `t(key)` function and `i18n` reactive object
- `src/lib/i18n/locales/en.json` — source locale (en + de ship); all user-visible strings live here
- `src/lib/theme.svelte.ts` — light/dark theme store; exports `toggleTheme()`
- `src/app.css` — global styles, Tailwind import, custom font declarations, theme CSS vars
- `static/fonts/` — self-hosted font files and license texts

### Components

- `FighterCard.svelte` / `FighterForm.svelte` — fighter card visual + form
- `TextCard.svelte` / `TextForm.svelte` — text/ability card visual + form
- `DeploymentCard.svelte` / `DeploymentForm.svelte` — deployment card visual (SVG-based) + form
- `FactionSelect.svelte` — filterable grouped select for Grand Alliance / Faction / Subfaction (used on Fighter + Text editors)
- `LangSwitch.svelte` — language switcher
- `ThemeToggle.svelte` — light/dark theme toggle

### Card rendering approach

Cards are rendered as **CSS/HTML components** (not Canvas). Export uses `dom-to-image-more` at 2× scale for crisp PNGs. This means card visual components are regular Svelte components styled with CSS — no coordinate math.

### Card structure

**Fighter card** (portrait ~600×940px preview):

- Top ~55%: model image area with runemarks overlaid at left/right columns (up to 3 each side)
- When `showRunemarks` is false: a tags row inside `.image-inner` (Alegreya uppercase, ` • ` separator) shows alliance/faction/subfaction names + fighter runemark labels; semi-transparent background strip is clipped by the SVG mask
- `freeHierarchy: boolean` — when true, alliance/faction/subfaction are each set via independent flat selects (no cascade); `findFactionSvg`/`findSubfactionSvg` helpers used for SVG lookup
- Torn paper edge divider (SVG mask)
- Bottom ~45%: parchment area — fighter name, characteristics table, weapons table
- If `isMonster: true`: damage bracket table appended below weapons

**Text card** (portrait, same ratio):

- Top ~28%: dark maroon header — runemarks row + activation badge (DOUBLE/TRIPLE/QUAD) + card label (preset slugs: ability, reaction, heroic-trait, battle-trait, lesser-artefact, greater-artefact, divine-blessing — or custom text)
- `layoutVariant?: 'standard' | 'banderole'` — banderole mode replaces the standard label with a full-width maroon torn-edge ribbon (`<div class="banderole">`) that overhangs the card edges; runemarks invert to black-on-cream; printer-friendly renders a stroke outline SVG instead of the filled shape
- Torn paper edge divider
- Bottom ~72%: parchment area — card name, then (each independently toggled): flavor text (italic), points cost increases table (2-col, Regular/Elite rows), prerequisite text (framed box), body text
- When `showRunemarks` is false: a tags row (Alegreya uppercase, ` • ` separator) shows alliance/faction/subfaction names + fighter runemark labels + activation label; no background needed (dark header behind)
- `freeHierarchy: boolean` — same independent hierarchy behaviour as fighter card
- Show/hide flags on `TextCardData`: `showRunemarks`, `showActivation`, `showFlavorText`, `showPrerequisite`, `showPointsTable`, `showCaption` — collapsing both the card element and its form field
- `smallBodyText: boolean` — when true, reduces body text 20→16 px, flavor text 18→15 px, prerequisite text 18→14 px via `.small-body` class on `.parchment`
- Inline runemark markup: `[slug]` in body/prerequisite text renders the matching SVG inline as `(<span class="inline-rm">…</span>)`; slugs cover all runemark groups + full faction hierarchy. Markup toolbar has B / I / A↓ / [⊕] buttons (bold, italic, font-size toggle, runemark picker)

**Deployment card** (portrait 574×915px, SVG-based rendering):

- Full-bleed battlefield SVG at card centre; dashed centre lines from the midpoint
- Up to 4 player colours (red/blue/green/yellow); each player has deployment points rendered as geometric shapes — triangle (dagger), diamond (hammer), circle (shield) — filled with player colour, white icon via SVG fill inheritance; optional RND label above shape (clamped inside card bounds, flips below shape if clipped at top edge)
- 99 snap positions: 63 inside (7×9 grid, R1C1–R7C9, outermost row/col sits exactly on the battlefield boundary) + 36 outside (9 top + 9 bottom + 7 left + 7 right + 4 corners)
- Perimeter snap points: 8 points per mask circle at cardinal/intercardinal angles, encoded as `` `PRM-{x}-{y}` `` positions in `DeploymentPosition` union; only valid as measurement endpoints
- Two-point measurement lines: tap start position → tap end position; start/end cap picker (arrow/tick/dot/none); text label at midpoint; midpoint dot rendered when line length > 60 SVG units
- Objective markers: black circle with text label
- Corner runemarks: Orientation SVG (top-left) and Matched Play SVG (top-right); fall back to `↑` / `MP` text when Show Runemarks is off
- Zone overlays: rectangular shaded areas; drawn by tapping a start snap position ("Zone from here") then an end position; each zone belongs to a player colour; tap to edit colour, redraw, or remove
- Mask circles: `mask: true` on a `DeploymentZone`; single-tap placement ("Mask circle here"); `startPos` = centre, `radius` snaps to S=89/M=179 SVG units (multiples of `BF_W/8`); rendered as a fully-opaque circle filled with the battlefield background colour (`#d9b8a8`/white in PF), painted on top of regular zone fills to create a visual cutout
- Printer-friendly mode: strictly B&W, player badges left of each shape, white battlefield fill; zones rendered with per-player SVG hatch patterns (forward-diagonal, back-diagonal, crosshatch, horizontal) + circled player numbers inside each zone; no dotted zone borders
- Card name rendered as an Alegreya caption below the SVG
- `DeploymentCardData`: `name`, `players[]` (each `{ color, zones[], points[] }`), `measurements[]`

**Card back** (portrait, same 574×915px):

- Full-card background: `static/background.jpg` texture by default; replaced entirely when a custom background image is uploaded (no double-layering)
- Centred overlay: optional name (Germania One, large, uppercase) + optional runemark (280×280px SVG) + optional mirrored name (rotated 180°) for playing-card symmetry
- `showFlippedName` flag on `CardBackData` controls the mirrored duplicate
- `textColor` (`'white' | 'black' | 'red'`) drives a `--card-text-color` CSS variable for both name and SVG fill; printer-friendly export always forces black
- Custom background image: pan/zoom via sliders on desktop, touch drag + pinch-to-zoom on mobile (`adjustMode` toggle)

### Fonts

- **Germania One** (`static/fonts/GermaniaOne-Regular.ttf`, family `'Germania One'`, weight 400, SIL OFL) — card names, stats values, activation badge, all block-style text
- **Alegreya** (`static/fonts/Alegreya-Regular.ttf` + `Alegreya-Italic.ttf`, family `'Alegreya'`, SIL OFL) — damage table, text card body/flavor text

### Background / textures

- Parchment texture: `static/background.jpg` applied to `.card` (full card coverage)
- Dark header / stat tables: `#5a0a14`
- Table value rows and parchment section are transparent so the texture shows through

### Runemark library

SVGs live in `src/lib/runemarks/svg/` (234 files). Library metadata in `src/lib/runemarks/index.ts`.

### i18n

All user-visible strings use `t(key)` imported from `$lib/i18n/index.svelte`. The source locale is `src/lib/i18n/locales/en.json`; German (`de.json`) also ships. When adding new UI strings or card-rendered text, add a key to both locale files and call `t('namespace.key')` in the template — never hardcode English strings directly. See `src/lib/i18n/README.md` for namespace conventions.

### Theme

Light/dark theme uses CSS custom properties declared on `:root` (dark) and `[data-theme="light"]` in `src/app.css`. Theme state and persistence live in `src/lib/theme.svelte.ts`; `ThemeToggle.svelte` calls `toggleTheme()`. Default is the OS/browser preference; the user's choice persists in `localStorage`.

## Code style

- **Import groups**: sorted alphabetically by the name the variable represents (not by variable name prefix). Each logical group has one header comment; no orphan imports between groups.
- **Object key quoting**: only quote keys that require it — keys containing spaces or hyphens. Single-word plain-identifier keys are unquoted.
- **On-touch cleanup**: when editing any file, also fix incremental-accumulation artifacts in that file — unsorted imports, duplicate or `(additional)`-suffixed section headers, unnecessary quotes. Do not audit unrelated files speculatively.

## Workflow preferences

- Explain plan before making changes. Wait for confirmation.
- At session start, consult `docs/index.html` for prior decisions.
- When asked to "document the session", append a new session panel to `docs/index.html`. Do NOT create separate session files.
- At session end, offer to update/append to `docs/index.html`.
- Documenting a session always means checking and updating **all** of: `docs/index.html`, `README.md`, `CLAUDE.md`, `src/lib/i18n/README.md`, `.github/ISSUE_TEMPLATE/*.md`, and memory files. Not just the session log.
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
