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

```bash
npm run svgo   # re-optimise src/lib/runemarks/svg/ after adding runemarks
```

Or directly with the correct Node:

```bash
PATH="$HOME/Library/Application Support/Herd/config/nvm/versions/node/v22.22.0/bin:$PATH" npm run dev
```

## Architecture

### Routes

- `/` — landing page, links to all five card editors
- `/fighter` — fighter card editor
- `/text` — text/ability card editor
- `/deployment` — deployment card editor
- `/card-back` — card back editor
- `/reference` — reference card editor (runemark library grid, exportable)

### Key files

- `src/lib/card-size.svelte.ts` — card size store; exports `cardSize`, `CARD_SIZES`, `EXPORT_SCALE`
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
- `CardSizeSelect.svelte` — bridge/poker picker + live size info line; sits in every export dropdown
- `FactionSelect.svelte` — filterable grouped select for Grand Alliance / Faction / Subfaction (used on Fighter + Text editors)
- `LangSwitch.svelte` — language switcher
- `ThemeToggle.svelte` — light/dark theme toggle

### Card rendering approach

Cards are rendered as **CSS/HTML components** (not Canvas). Export uses `dom-to-image-more` at 2× scale for crisp PNGs. This means card visual components are regular Svelte components styled with CSS — no coordinate math.

### Card structure

**Fighter card** (portrait, `cardSize.portrait` — 588×915 at bridge):

- Top ~55%: model image area with runemarks overlaid at left/right columns (up to 3 each side)
- When `showRunemarks` is false: a tags row inside `.image-inner` (Alegreya uppercase, ` • ` separator) shows alliance/faction/subfaction names + fighter runemark labels; semi-transparent background strip is clipped by the SVG mask
- `freeHierarchy: boolean` — when true, alliance/faction/subfaction are each set via independent flat selects (no cascade); `findFactionSvg`/`findSubfactionSvg` helpers used for SVG lookup
- Torn paper edge divider (SVG mask)
- Bottom ~45%: parchment area — fighter name, characteristics table, weapons table
- If `isMonster: true`: damage bracket table appended below weapons
- `classicFormat: boolean` — landscape layout (`cardSize.classic` — 1167×750 at bridge) modeled on Warcry's 2019 card design, as an alternative to the portrait layout above: name/characteristics/weapons/damage-table stacked in a left column (fixed 576px, sized so the stats/weapons row lands at 500px plus padding), full-height model image with runemarks on the right. Faction hierarchy (alliance/faction/bladeborn) sits on the image's right edge, fighter runemarks on its left — swapped from portrait. The characteristics/weapons/damage-table group is bottom-anchored via `margin-top: auto` on `.stats-box`; the damage table's slot is a fixed 168px height regardless of `isMonster`, so the group's position never shifts. Tags row and caption (when runemarks are hidden) stack at the bottom of the image instead of spanning the parchment. Rendered as a fully separate markup branch in `FighterCard.svelte` (not a CSS reflow of the portrait tree) — keep both branches in sync when adding a field. `routes/fighter/+page.svelte` mirrors the layout's `576`/`5` magic numbers for the mobile touch-drag overlay; comments cross-reference both files. Type scales up in classic (it renders at 13.1 px/mm against portrait's 10.3), in **two tiers rather than one factor**: single-line display type (name, stat/weapon values) sits at full physical parity, while type that can wrap to a second line (labels, headers, weapon names, damage table, tags, caption) is held below it. Row heights stay at portrait's pixel values and are therefore physically smaller here, so a uniform parity scale overflows — 21px is the largest damage-table size that fits the fixed 28px row. Do not flatten the two tiers back to one factor.

**Text card** (portrait, same ratio):

- Top ~28%: dark maroon header — runemarks row + activation badge (DOUBLE/TRIPLE/QUAD) + card label (preset slugs: ability, reaction, heroic-trait, battle-trait, lesser-artefact, greater-artefact, divine-blessing — or custom text)
- `layoutVariant?: 'standard' | 'banderole'` — banderole mode replaces the standard label with a full-width maroon torn-edge ribbon (`<div class="banderole">`) that overhangs the card edges; runemarks invert to black-on-cream; printer-friendly renders a stroke outline SVG instead of the filled shape
- Torn paper edge divider
- Bottom ~72%: parchment area — card name, then (each independently toggled): flavor text (italic), points cost increases table (2-col, Regular/Elite rows; same maroon header, bordered box and alternating row stripes as the fighter card's damage table), prerequisite text (framed box), body text
- When `showRunemarks` is false: a tags row (Alegreya uppercase, ` • ` separator) shows alliance/faction/subfaction names + fighter runemark labels + activation label; no background needed (dark header behind)
- `freeHierarchy: boolean` — same independent hierarchy behaviour as fighter card
- Show/hide flags on `TextCardData`: `showRunemarks`, `showActivation`, `showFlavorText`, `showPrerequisite`, `showPointsTable`, `showCaption` — collapsing both the card element and its form field
- `smallBodyText: boolean` — when true, reduces body text 20→16 px, flavor text 18→15 px, prerequisite text 18→14 px via `.small-body` class on `.parchment`
- Inline runemark markup: `[slug]` in body/prerequisite text renders the matching SVG inline as `(<span class="inline-rm">…</span>)`; slugs cover all runemark groups + full faction hierarchy. Markup toolbar has B / I / A↓ / [⊕] buttons (bold, italic, font-size toggle, runemark picker)

**Deployment card** (landscape, `cardSize.landscape` — 915×588 at bridge, SVG-based rendering):

- Full-bleed battlefield SVG at card centre; dashed centre lines from the midpoint
- Up to 4 player colours (red/blue/green/yellow); each player has deployment points rendered as geometric shapes — triangle (dagger), diamond (hammer), circle (shield) — filled with player colour, white icon via SVG fill inheritance; optional RND label above shape (clamped inside card bounds, flips below shape if clipped at top edge)
- 99 snap positions: 63 inside (7×9 grid, R1C1–R7C9, outermost row/col sits exactly on the battlefield boundary) + 36 outside (9 top + 9 bottom + 7 left + 7 right + 4 corners)
- Perimeter snap points: 8 points per mask circle at cardinal/intercardinal angles, encoded as `` `PRM-{x}-{y}` `` positions in `DeploymentPosition` union; only valid as measurement endpoints
- Two-point measurement lines: tap start position → tap end position; start/end cap picker (arrow/tick/dot/none); text label at midpoint; midpoint dot rendered when line length > 60 SVG units
- Objective markers: black circle with text label
- Corner runemarks: Orientation SVG (top-left) and Matched Play SVG (top-right); fall back to `↑` / `MP` text when Show Runemarks is off
- Zone overlays: rectangular shaded areas; drawn by tapping a start snap position ("Zone from here") then an end position; each zone belongs to a player colour; tap to edit colour, redraw, or remove
- Mask circles: `mask: true` on a `DeploymentZone`; single-tap placement ("Place mask circle"); `startPos` = centre, `radius` snaps to Small=89/Large=179 SVG units (multiples of `BF_W/8`); rendered as a fully-opaque circle filled with the battlefield background colour (`#d9b8a8`/white in PF), painted on top of regular zone fills to create a visual cutout. Clipped to the battlefield interior via SVG `<mask id="inside-bf-mask">` (black full-SVG rect, white battlefield rect) — rendered as two `<circle>` elements: a masked visual (pointer-events off) + a transparent full-size hit target
- Printer-friendly mode: strictly B&W, player badges left of each shape, white battlefield fill; zones rendered with per-player SVG hatch patterns (forward-diagonal, back-diagonal, crosshatch, horizontal) + circled player numbers inside each zone; no dotted zone borders
- Card name rendered as an Alegreya caption below the SVG
- `DeploymentCardData`: `name`, `players[]` (each `{ color, zones[], points[] }`), `measurements[]`

**Reference card** (portrait, `cardSize.portrait`):

- Full runemark library browsable via sidebar checkboxes split into Card Elements (core categories) and Card Design
- 5×8 CSS grid filling the full card; `cardPages` returns `RmItem[][][]` (pages → groups → items); pagination at 40 items per page
- Card Design toggles: **Circles** — fills each runemark with the maroon blob mask (same as Fighter Card); **Separators** — draws a 1 px category divider between groups
- Separators use dynamic `grid-template-rows` per page: `1fr` per item row, `12px` per separator row, padded to 8 item rows — icons never move when toggling separators
- Printer-friendly: white background, black ring circle style, dark separator line
- Multi-card export: numbered suffix `_1`, `_2`, … when more than one page

**Card back** (portrait, same `cardSize.portrait`):

- Full-card background: `static/background.jpg` texture by default; replaced entirely when a custom background image is uploaded (no double-layering)
- Centred overlay: optional name (Germania One, large, uppercase) + optional runemark (280×280px SVG) + optional mirrored name (rotated 180°) for playing-card symmetry
- `showFlippedName` flag on `CardBackData` controls the mirrored duplicate
- `textColor` (`'white' | 'black' | 'red'`) drives a `--card-text-color` CSS variable for both name and SVG fill; printer-friendly export always forces black
- Custom background image: pan/zoom via sliders on desktop, touch drag + pinch-to-zoom on mobile (`adjustMode` toggle)

### Card size

Two output sizes ship, both standard playing-card proportions: **bridge** (57 × 89 mm, 1:1.5556) and **poker** (63 × 88 mm, 1:1.400). `src/lib/card-size.svelte.ts` holds the dimension table and a `localStorage`-persisted store (`warcry-card-size`), restored in the store's constructor rather than from `onMount`, so the first client render already uses the saved size.

| | bridge | poker |
| --- | --- | --- |
| `portrait` — fighter, text, card back, reference | 588×915 | 654×915 |
| `classic` — classic-format fighter | 1167×750 | 1167×834 |
| `landscape` — deployment | 915×588 | 915×654 |

Portrait holds its 915px height and varies width (the parchment column is vertically tight); classic holds its 1167px width and varies height (the parchment column is pinned at 576px).

Card components never hardcode dimensions — they set `--card-w` / `--card-h` inline from the store and their CSS reads `width: var(--card-w)`. Route files read `cardSize.portrait` / `.classic` / `.landscape` for export dimensions and the preview `cardScale` divisor, and `EXPORT_SCALE` (2) for the PNG scale factor.

The deployment card derives its battlefield offset from the card height (`BF_T = round((CARD_H − BF_H) / 2)`, `CNR_T/B = BF_T/B ∓ CNR_GAP_Y`) so the battlefield re-centres at any size; all 99 snap positions derive from those constants, and saved JSON stores position IDs rather than coordinates, so old layouts still load.

Stats, weapons and damage-table columns use fractional widths (`flex: 1 1 0` on `.stat-col`/`.stat-val`/`.wcol`, `flex: 0 0 20%` on `.dcol-stat`) so the two tables stay column-aligned at any card width.

`CardSizeSelect.svelte` renders the picker plus a live info line, and sits at the bottom of every editor's export dropdown. It takes a `layout` prop so the quoted pixel size matches what that editor exports. Its click handler calls `stopPropagation()` — the routes close their dropdown on any document click.

### Fonts

- **Germania One** (`static/fonts/GermaniaOne-Regular.woff2`, family `'Germania One'`, weight 400, SIL OFL) — card names, stats values, activation badge, all block-style text
- **Alegreya** (`static/fonts/Alegreya-Regular.woff2` + `Alegreya-Italic.woff2`, family `'Alegreya'`, SIL OFL) — damage table, text card body/flavor text

Fonts ship as woff2 subset with `pyftsubset --unicodes='*' --desubroutinize`, declared with `font-display: swap`. Character coverage is deliberately left intact — only unused OpenType alternates (small caps, oldstyle/tabular numerals, stylistic sets) are dropped — hinting is kept, since it costs nothing and dropping it shifted glyph rasterisation, so adding a locale in any script the original fonts covered still renders. `kern` and `liga` are retained. Re-run the same command if a font is ever replaced.

### Background / textures

- Parchment texture: `static/background.jpg` applied to `.card` (full card coverage)
- Dark header / stat tables: `#5a0a14`
- Table value rows and parchment section are transparent so the texture shows through

### Runemark library

SVGs live in `src/lib/runemarks/svg/` (233 files), optimised with SVGO. Library metadata in `src/lib/runemarks/index.ts` and `hierarchy.ts`.

**Metadata is split from content.** The records in `index.ts` (`weaponRunemarks`, `fighterRunemarks`, `characteristicRunemarks`, …) and the `file` field on hierarchy entries hold an SVG **basename**, not SVG source. Content is resolved through `src/lib/runemarks/loader.svelte.ts`, which globs `./svg/*.svg` lazily and caches each file in a rune-backed store. The pickers render labels only, so a route pulls just the handful of icons its card actually shows.

- **`<Runemark file={…} />`** (`src/lib/components/Runemark.svelte`) is the only place runemark SVG is injected. Pass `fallback` to render `PLACEHOLDER_SVG` when the entry has no runemark; a file that is merely still loading renders nothing, so badges do not flicker.
- **Getters return basenames**: `getAllianceFile`, `getFactionFile`, `getSubfactionFile`, `findFactionFile`, `findSubfactionFile`.
- **Export handlers must `await settled()`** (imported as `runemarksSettled`) before snapshotting, or a PNG can capture a card whose icons are still in flight. `/deployment` is exempt — it imports its five icons directly.
- **The seven characteristic runemarks are bundled**, not fetched: they head every fighter card's stat tables. They are seeded into the loader cache, so callers still address them by basename like any other runemark.
- **Adding a runemark**: drop the SVG in `svg/`, add its basename to the right record or hierarchy entry, then run `npm run svgo`.

SVGO config lives in `svgo.config.mjs` (`multipass`, `floatPrecision: 1`, `preset-default`). Precision is the lever that matters — `preset-default` alone saves 0.3%, because the files carry no ids, styles or fill attributes and all their weight is path-coordinate precision. Do not raise precision without re-checking rendering; do not lower it below 1.

### i18n

All user-visible strings use `t(key)` imported from `$lib/i18n/index.svelte`. The source locale is `src/lib/i18n/locales/en.json`; German (`de.json`) also ships. When adding new UI strings or card-rendered text, add a key to both locale files and call `t('namespace.key')` in the template — never hardcode English strings directly. See `src/lib/i18n/README.md` for namespace conventions.

### Theme

Light/dark theme uses CSS custom properties declared on `:root` (dark) and `[data-theme="light"]` in `src/app.css`. Theme state and persistence live in `src/lib/theme.svelte.ts`; `ThemeToggle.svelte` calls `toggleTheme()`. Default is the OS/browser preference; the user's choice persists in `localStorage`.

## Code style

- **Import groups**: sorted alphabetically by the name the variable represents (not by variable name prefix). Each logical group has one header comment; no orphan imports between groups.
- **Import order**: value imports, then components, then `?raw` assets, then `import type` as a trailing group. Type imports are erased at compile time, so they sit last rather than leading the block. Named specifiers inside one import are sorted the same way, case-insensitively.
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
