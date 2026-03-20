# Contributing

Thanks for your interest in contributing to the Warcry Card Creator.

## Prerequisites

Node v22+ is required. The system default may be v16 (e.g. via Laravel Herd).
Use `make dev` which sets the correct PATH automatically, or prefix commands
with the Herd Node path:

```bash
PATH="$HOME/Library/Application Support/Herd/config/nvm/versions/node/v22.22.0/bin:$PATH"
```

```bash
make dev      # dev server at http://localhost:5173
make build    # production build
make preview  # preview production build
```

## Architecture constraints

**No backend.** Everything runs client-side. No server-side data fetching,
no persistent storage, no API routes. Keep it that way.

**Cards are CSS/HTML, not Canvas.** The card components are regular Svelte
components styled with CSS. Export uses `dom-to-image-more` (desktop) and
`modern-screenshot` (mobile). Both must be dynamically imported inside click
handlers — importing them at module top-level crashes SvelteKit SSR.

**Svelte 5 runes syntax only.** Use `$state`, `$derived`, `$effect`, `$props`.
Do not use the Svelte 4 Options API (`export let`, reactive statements with
`$:`, `on:event` directives).

## Code style

- **Import groups** — sorted alphabetically by the name the variable represents,
  not by the import path. Each logical group has one header comment.
- **Object keys** — only quote keys that require it (keys containing spaces or
  hyphens). Plain identifier keys are unquoted.
- **On-touch cleanup** — when editing any file, also fix incremental-accumulation
  artifacts in that file: unsorted imports, orphan imports without a header,
  duplicate section headers, unnecessarily quoted object keys. Do not audit
  unrelated files speculatively.

## Submitting changes

1. Fork the repository and create a branch from `main`.
2. Make your changes and verify `make build` completes without errors.
3. Open a pull request — fill in the PR template checklist.

## What makes a good contribution

- Bug fixes with a clear description of the problem and how it's reproduced
- Visual improvements backed by a screenshot of the card in both preview and export
- Runemark additions (SVGs in `src/lib/runemarks/svg/` + entry in `src/lib/runemarks/index.ts`)
- Translations — a single JSON file, no code changes needed (see [`src/lib/i18n/README.md`](src/lib/i18n/README.md))
- Keep scope small — one concern per PR
