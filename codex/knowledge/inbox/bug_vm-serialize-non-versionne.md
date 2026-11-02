# randomart-vm : format de sérialisation non versionné

**Contexte :** Toute sauvegarde/recharge d'expression (IR) via `ir/serialize.ts`, aujourd'hui et à chaque évolution du format.

**Corps :** `ExpressionData` (`ir/serialize.ts:27-32`) n'a aucun champ `version`, alors que `GENERATOR_VERSION = 1` existe dans `spec/constants.ts:6` — exporté mais jamais utilisé. La whitelist stricte des champs interdit en plus toute évolution forward-compatible : un ancien fichier rejoué après extension du format échouera avec un message d'erreur de whitelist (« Expression invalid at r.in[1].params[0] ») sans expliquer le vrai problème (version). Ajouter un champ `version` au format + rejet explicite `version-mismatch` avant la whitelist.

**Lien codebase :** `packages/randomart-vm/src/ir/serialize.ts:27-32`, `packages/randomart-vm/src/spec/constants.ts:6`.

### Action Issue GitHub

```bash
gh issue create --title "randomart-vm: serialize format is unversioned" --body "Revue randomart-vm. ExpressionData (ir/serialize.ts:27-32) has no version field while GENERATOR_VERSION=1 (spec/constants.ts:6) is exported but unused. The strict field whitelist will make old files fail with misleading path errors after any format evolution. Fix: add a version field and reject version-mismatch explicitly before whitelist validation."

```

---
