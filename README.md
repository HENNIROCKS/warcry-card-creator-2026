# Warcry Card Creator 2026

An updated version of my original card creator for Warhammer Age of Sigmar: Warcry, rebuilt with a modern stack. This is a fan project made for the community; it is not commercial and has no affiliation with or endorsement from Games Workshop.

**[Open the live tool →](https://hennirocks.github.io/warcry-card-creator-2026/)** · **[Dev log →](https://hennirocks.github.io/warcry-card-creator-2026/docs/)**

## What it does

Browser-based tool for creating custom Warcry cards. No backend, no login, everything runs client-side.

**Fighter card editor** — upload a model photo, set name and characteristics (Move, Toughness, Wounds), build a weapon profile table, add a damage bracket for monsters, and assign runemarks. On mobile, pan and pinch-to-zoom the model image directly on the preview. Export as a print-ready PNG.

**Text card editor** — set card name, card type (Ability, Reaction, Heroic Trait, Battle Trait, Divine Blessing, Lesser/Greater Artefact, or a custom label), and use the Card Elements checkboxes to toggle which sections appear on the card: runemarks, activation cost (Double / Triple / Quad), flavour text, a points cost increases table (Regular/Elite rows), prerequisite text (framed box), body text with bold/italic markup, and an optional caption at the bottom of the card. A **Card Design** option switches the type label to a full-width banderole — a maroon torn-edge ribbon that spans slightly beyond the card edges. The body/flavor/prerequisite text markup toolbar includes an **A↓ font size toggle** for denser cards, and a **[⊕] runemark picker** to insert inline runemark icons directly into text using `[slug]` syntax. Export as a print-ready PNG.

**Deployment card editor** — build a deployment card with up to 4 player colours (red, blue, green, yellow). Tap any snap position on the card to open a popover with three placement options: place a marker (dagger, shield, or hammer icon with an optional round label), add a measurement line (tap a second position to complete the line; set start/end caps and a text label in the popover), or place an objective marker (black circle with a text label such as "The Tower"). Tap any existing marker or objective to edit or remove it. The View dropdown independently controls Show Markers, Show Runemarks (falls back to letter initials when off), Orientation runemark (top-left corner), and Matched Play runemark (top-right corner). Save and load card layouts as JSON. Pinch-to-zoom and pan the card on mobile; double-tap resets to fit. Export as a print-ready PNG; printer-friendly mode produces a strictly black-and-white card with numbered player badges.

**Card back editor** — create a matching card back with optional name text, a large runemark chosen from the full library (with live search), a custom background image (pan and pinch-to-zoom on mobile), and configurable text/runemark colour. A "mirrored name" option repeats the name upside-down for a symmetrical playing-card style. Export as a print-ready PNG; printer-friendly mode forces black on white.

All four editors support **light and dark theme**, work on **desktop and mobile** (tab-based layout on small screens), and can be **installed as a PWA** from the browser.

## Developing

Requires Node v22+. Run `make dev` to start the dev server at http://localhost:5173.

```bash
make dev      # dev server (opens browser automatically)
make build    # production build
make preview  # preview production build
```

### Testing on a phone or other device

The dev server listens on all network interfaces. Start `make dev` and use the **Network** URL printed by Vite (e.g. `http://192.168.x.x:5173`) from any device on the same Wi-Fi network. If port 5173 is occupied, Vite will increment it — use whichever port appears in the terminal.

## Translations

The tool ships with English and German. Adding a new language requires a single JSON file — no code changes. See [`src/lib/i18n/README.md`](src/lib/i18n/README.md) for the full guide, or [open a "New language" issue](https://github.com/HENNIROCKS/warcry-card-creator-2026/issues/new?template=new_language.md) to express interest and coordinate with others.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for code style, architecture constraints, and how to submit a PR.

## License

MIT — see [LICENSE](LICENSE). Fonts are SIL OFL. Warcry and all associated marks are property of Games Workshop Group PLC; this project is an unofficial fan tool.
