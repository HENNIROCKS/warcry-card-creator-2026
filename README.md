# Warcry Card Creator 2026

An updated version of my original card creator for Warhammer Age of Sigmar: Warcry, rebuilt with a modern stack. This is a fan project made for the community; it is not commercial and has no affiliation with or endorsement from Games Workshop.

**[Open the live tool →](https://hennirocks.github.io/warcry-card-creator-2026/)**

## What it does

Browser-based tool for creating custom Warcry cards. No backend, no login, everything runs client-side.

**Fighter card editor** — upload a model photo, set name and characteristics (Move, Toughness, Wounds), build a weapon profile table, add a damage bracket for monsters, and assign runemarks. On mobile, pan and pinch-to-zoom the model image directly on the preview. Export as a print-ready PNG.

**Text card editor** — set card name, card type (Ability, Reaction, Heroic Trait, Battle Trait, Divine Blessing, Lesser/Greater Artefact, or a custom label), and use the Card Elements checkboxes to toggle which sections appear on the card: runemarks, activation cost (Double / Triple / Quad), flavour text, a points cost increases table (Regular/Elite rows), prerequisite text (framed box), body text with bold/italic markup, and an optional caption at the bottom of the card. Export as a print-ready PNG.

**Deployment card editor** — build a deployment card with up to 4 player colours (red, blue, green, yellow). Place deployment points (dagger, shield, or hammer icons with an optional round label) at any of 33 snap positions inside or around the battlefield. Add measurement lines with configurable direction, start/end caps, and a distance label. Shade zone overlays over the battlefield. Export as a print-ready PNG; printer-friendly mode produces a strictly black-and-white card with numbered player badges.

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
