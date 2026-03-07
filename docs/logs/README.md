# Logs de session

Ce dossier contient les journaux detailles par session/date.

## Convention
- Fichier: `YYYY-MM-DD.md`
- Une session peut contenir plusieurs actions.
- Chaque action suit le format:
  - Type
  - Summary
  - Files
  - Why
  - Impact
  - Verify

## Commandes recommandees
- `npm run logs:start`
- `npm run logs:action -- --type=... --summary=\"...\" --files=\"file1,file2\" --why=\"...\" --impact=\"...\" --verify=\"...\"`
- `npm run logs:end`
