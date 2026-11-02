# v1 : saisie de seed invalide → throw non catché dans le handler d'événement

**Contexte :** Panel lab v1, saisie manuelle d'une seed dans le champ dédié (champ vidé ou non numérique).

**Corps :** `GrammarSection.tsx:105` appelle `resetSeed(createSeed(Number(value)))` hors du try/catch de `commit` : `Number('')` → `NaN` → `assertIntegerInRange` throw (`core/random/seed.ts:10`), dans un handler d'événement React — ni ErrorBoundary ni feedback utilisateur, le champ se vide silencieusement sans message. Valider la saisie (parse + garde) avant `createSeed`, ou router l'erreur vers `actionError`. NB : `@repo/randomart` est orphelin depuis le portage v2 — à corriger seulement si la v1 survit (le dataset en dépend encore tant que le portage dataset n'est pas fait).

**Lien codebase :** `packages/randomart/src/components/lab/GrammarSection.tsx:105`, `packages/randomart/src/core/random/seed.ts:10`.

### Action Issue GitHub

```bash
gh issue create --title "randomart (v1): invalid seed input throws uncaught in event handler" --body "GrammarSection.tsx:105 calls resetSeed(createSeed(Number(value))) outside commit's try/catch: empty/non-numeric input -> NaN -> assertIntegerInRange throws in an event handler with no ErrorBoundary and no user feedback. Validate input before createSeed. Note: package is orphaned since v2 port — fix only if v1 survives the dataset migration."

```

---
