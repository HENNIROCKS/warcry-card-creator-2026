# Security Policy

## Scope

Warcry Card Creator is a fully client-side, static web application. It has no
server, no authentication, no database, and no user data is transmitted or
stored anywhere. The attack surface is therefore very limited.

Known areas of note:

- **`{@html}` in ability card body text** — output is produced by `parseMarkup()`
  in `AbilityCard.svelte`, which only emits `<strong>` and `<em>` tags. No
  user-supplied HTML is passed through unprocessed. Cards are rendered locally
  and never served to other users.
- **Dependencies** — the npm dependency tree is the most realistic source of
  supply-chain risk. Run `npm audit` to check for known vulnerabilities.

## Reporting a vulnerability

Because there is no server or user data at risk, there is no need for a private
disclosure channel. Please open a [GitHub issue](https://github.com/HENNIROCKS/warcry-card-creator-2026/issues)
describing the vulnerability. Include steps to reproduce and, where applicable,
a proof-of-concept.

Issues will be reviewed and responded to as soon as possible.
