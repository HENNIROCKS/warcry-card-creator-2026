# Adding a translation

1. Copy `locales/en.json` to `locales/XX.json` where `XX` is the [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) code (e.g. `de`, `fr`, `es`).
2. Update the `meta` block at the top:
   - `"language"` — the language name in its own language (e.g. `"Deutsch"`, `"Français"`)
   - `"code"` — the ISO code matching the filename (e.g. `"de"`)
   - `"dir"` — `"ltr"` for left-to-right scripts, `"rtl"` for Arabic, Hebrew, etc.
   - `"contributors"` — add your GitHub username (optional but appreciated)
3. Translate all the **values** in the file. **Never edit the keys** — they must stay identical to `en.json`.
4. Open a pull request. No other code changes are needed — the app picks up new locale files automatically.

## Notes

- **Faction names** (`alliances`, `factions`, `subfactions`) are the localised display names. In most languages these stay in English, but translate them if an official localised version exists.
- **`ui`** keys are editor interface strings (buttons, placeholders, page text).
- **`card`** keys are strings that appear on the rendered card itself (activation dice labels, card type labels).
- If a translation is missing for a key, the English value is shown as fallback — so partial translations are fine.
- Do **not** change the `en.json` file for translations; it is the source of truth.
