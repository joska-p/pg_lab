# Backfiller les tests de randomart-vm (11 tests pour un compilateur GLSL)

**Contexte :** Revue `randomart-vm` : un seul fichier de test (11 tests, 133 l.) alors que la v1 en avait ~259. Pire : la sortie du pipeline est du GLSL jamais exécuté en test — aucun filet sur le produit final du compilateur.

**Description :** Compléter `test/basic.test.ts` avec : (1) chemins d'erreur — `IrError`, `CodegenError` « Source too long », `GenError` ; (2) les policies de sharing `none|shared|all` (seule `shared` est testée) ; (3) le contrat GLSL complet (`vUv`, `v_p`, `o_color`, `u_phase`) + validation shader ; (4) déterminisme multi-seeds en masse (même seed → même source) ; (5) roundtrip sérialisation avec entrées malformées (gardes `MAX_IMPORT_DEPTH`/`MAX_IMPORT_NODES`, chemins d'erreur pointés).

**Lien codebase :** `packages/randomart-vm/test/basic.test.ts`, `src/codegen/compile.ts`, `src/ir/serialize.ts`, `src/gen/generator.ts`.

### Action Kanban

```bash
./scripts/kanban.sh idea "Backfiller les tests de randomart-vm" -b "11 tests happy-path pour un compilateur GLSL dont la sortie n'est jamais exécutée en test. Ajouter: chemins d'erreur (IrError/CodegenError/GenError), policies de sharing, contrat GLSL, déterminisme multi-seeds, roundtrip sérialisation malformée."

```

---
