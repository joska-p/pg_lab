# Porter la chaîne dataset (CLI + analyse) vers randomart-vm

**Contexte :** Revue comparative v1 (`@repo/randomart`) vs v2 (`randomart-vm` + `randomart-ui`) : la v2 a perdu l'intégralité de la chaîne dataset, seul gros bloc fonctionnel non migré. Tant qu'il n'est pas porté, `@repo/randomart` (désormais orphelin, plus importé nulle part) ne peut pas être supprimé.

**Description :** Porter vers l'API `@repo/randomart-vm` (~1 240 l. prod + tests v1) : CLI 5 sous-commandes (`run/write/features/pca/sheet`), contact sheets PNG, descripteurs (parts spectrales par pyramide, colorfulness Hasler-Süsstrunk), PCA Jacobi (seuils 1e-20/1e-300, signe des composantes fixé, garde colonnes constantes), et le sampler déterministe `sampleGrammars` (dédup + seeds dérivés golden-ratio). L'outil est testé et câblé aux scripts npm `dataset*` — le reprendre tel quel, seul le backend (`vm.generate/compile` au lieu du cœur v1) change.

**Lien codebase :** `packages/randomart/src/dataset/**` (notamment `node/cli.ts`, `node/writeDataset.ts`, `analysis/pca.ts`, `analysis/descriptors.ts`, `grammar/sample.ts`), `packages/randomart/package.json` (scripts `dataset*`) → cible `packages/randomart-vm`.

### Action Kanban

```bash
./scripts/kanban.sh idea "Porter la chaîne dataset vers randomart-vm" -b "La v2 a perdu la chaîne dataset v1 (~1 240 l. : CLI run/write/features/pca/sheet, PCA, descripteurs, sampler déterministe). Porter ces outils sur l'API vm (vm.generate/compile) pour pouvoir supprimer @repo/randomart, orphelin depuis le portage UI."

```

---
