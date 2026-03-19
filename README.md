# Warcry Card Creator 2026

An updated version of my original card creator for Warhammer Age of Sigmar: Warcry, rebuilt with a modern stack for sharper exports and easier customisation. This is a fan project made for the community; it is not commercial and has no affiliation with or endorsement from Games Workshop.

**[Open the live tool →](https://hennirocks.github.io/warcry-card-creator-2026/)**

## What it does

Browser-based tool for creating custom Warcry cards. No backend, no login, everything runs client-side.

**Fighter card editor** — upload a model photo, set name and characteristics (Move, Toughness, Wounds), build a weapon profile table, add a damage bracket for monsters, and assign runemarks. Export as a print-ready PNG.

**Ability card editor** — set card type (Ability, Reaction, Heroic Trait, Battle Trait, Lesser/Greater Artefact), activation cost (Double / Triple / Quad), card name, flavour text, and body text with bold/italic markup. Export as a print-ready PNG.

Both editors support **light and dark theme**, work on **desktop and mobile** (tab-based layout on small screens with touch pan and pinch-to-zoom on the model image), and can be **installed as a PWA** from the browser.

## Developing

Requires Node v22+. Run `make dev` to start the dev server at http://localhost:5173.

```bash
make dev      # dev server (opens browser automatically)
make build    # production build
make preview  # preview production build
```

### Testing on a phone or other device

The dev server listens on all network interfaces. Start `make dev` and use the **Network** URL printed by Vite (e.g. `http://192.168.x.x:5173`) from any device on the same Wi-Fi network. If port 5173 is occupied, Vite will increment it — use whichever port appears in the terminal.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for code style, architecture constraints, and how to submit a PR.

## License

MIT — see [LICENSE](LICENSE). Fonts are SIL OFL. Warcry and all associated marks are property of Games Workshop Group PLC; this project is an unofficial fan tool.
