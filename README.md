# Warcry Card Creator 2026

An updated version of my original card creator for Warhammer Age of Sigmar: Warcry, now rebuilt with a modern stack for sharper exports and easier customisation. This is a fan project made for the community; it is not commercial and has no affiliation with or endorsement from Games Workshop.

## What it does

Browser-based tool for creating Warcry fighter and ability cards with custom image uploads and editable values. No backend, no login, everything runs client-side.

## Developing

Requires Node v22+. Run `make dev` to start the dev server at http://localhost:5173.

### Testing on a phone or other device

The dev server is configured to listen on all network interfaces (`server: { host: true }` in `vite.config.ts`). Start `make dev` and use the **Network** URL printed by Vite (e.g. `http://192.168.x.x:5173`) from any device on the same Wi-Fi network. If another process already occupies port 5173, Vite will increment the port. Use whichever port appears in the terminal output.
