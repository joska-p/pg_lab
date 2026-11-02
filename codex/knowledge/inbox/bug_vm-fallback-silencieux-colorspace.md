# randomart-vm : espace couleur invalide compilé silencieusement en srgb

**Contexte :** À l'import/génération d'une grammaire dont le champ `space` est mal typé (typo, valeur hors registre).

**Corps :** `compile.ts:70` : le check `isColorSpaceId` échoue silencieusement → fallback `srgb` sans erreur. Une typo comme `'oklabc'` produit une image différente de l'intention, sans aucun diagnostic. Cause racine : `Grammar.space: string` au lieu de `ColorSpaceId` (`grammar/types.ts`), ce qui repousse la validation au runtime et l'affaiblit. À corriger dans le sens de la politique maison « contenu invalide = throw » (messages `Randomart:` + chemin de champ).

**Lien codebase :** `packages/randomart-vm/src/codegen/compile.ts:70`, `packages/randomart-vm/src/grammar/types.ts`.

### Action Issue GitHub

```bash
gh issue create --title "randomart-vm: invalid color space silently falls back to srgb" --body "Revue randomart-vm. compile.ts:70: isColorSpaceId failure silently falls back to srgb — a typo like 'oklabc' renders differently with no error. Root cause: Grammar.space is string instead of ColorSpaceId (grammar/types.ts). Fix: brand the field and throw in codegen per the throw-vs-repair policy."

```

---
