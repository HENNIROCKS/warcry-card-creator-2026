# Adding a translation

1. Copy `locales/en.json` to `locales/XX.json` where `XX` is the [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) code (e.g. `de`, `fr`, `es`).
2. Update the `meta` block at the top:
   - `"language"` — the language name **in its own language** (e.g. `"Deutsch"`, `"Français"`)
   - `"code"` — the ISO code matching the filename (e.g. `"de"`)
   - `"dir"` — `"ltr"` for left-to-right scripts, `"rtl"` for Arabic, Hebrew, etc.
   - `"contributors"` — add your GitHub username (optional but appreciated)
3. Translate all the **values**. Never edit the keys — they must stay identical to `en.json`.
4. Open a pull request. No other code changes are needed — the app picks up new locale files automatically via Vite's `import.meta.glob`.

## Key namespaces

| Namespace | What it covers |
|---|---|
| `meta` | File metadata — language name, code, direction. Not displayed directly. |
| `ui` | Editor interface — buttons, labels, placeholders, tabs, export strings. |
| `card` | Text rendered **on the card itself** — activation labels (Double/Triple/Quad), card type labels (Ability, Reaction…), column headers, name placeholders. |
| `runemarks` | Runemark names as shown in the selection UI. |
| `weapons` | Weapon type names in the weapon profile dropdowns. |
| `alliances` | Grand Alliance display names (Allies of Chaos, Bringers of Death…). |
| `factions` | Faction display names. |
| `subfactions` | Subfaction / warband display names. |

## Faction and subfaction names

Official localised names exist for most factions in languages where Games Workshop publishes rulebooks. Use the official name if one exists. If no official translation exists, keep the English name and add a `TODO` suffix so it's easy to grep for later:

```json
"slaves-to-darkness-corvus-cabal": "Sklaven der Finsternis: Corvus Cabal TODO"
```

The `TODO` suffix is stripped out in display — it's only a signal for translators that the string needs attention.

## Partial translations

If a value is missing or falls back to the key string, the English value from `en.json` is shown automatically. Partial translations are perfectly fine — translate what you know, leave the rest to fall back.

## Text direction

Set `"dir": "rtl"` for right-to-left languages (Arabic, Hebrew, Persian, Urdu). The app applies the `dir` attribute to the card container automatically.

## What not to translate

- **Keys** — never change the key names
- `en.json` itself — it is the source of truth and the fallback for all locales
- The `meta.code` value — it must match the filename
