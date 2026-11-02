# Trancher le destin de l'artefact `.randomart.json` + provenance en v2

**Contexte :** Revue comparative v1/v2 : la v1 exporte/importe un artefact persistant (render settings, titre, **provenance vérifiée** — régénération `(grammar, seed)` avec statut `regenerable / hand-edited / version-mismatch`). La v2 n'a que l'export PNG. Décision produit jamais prise, code v1 (~450 l.) en attente.

**Description :** Deux options : (a) porter le format en v2 — auquel cas **versionner d'abord le format sérialisé** (cf. bug `vm-serialize-non-versionne`) et utiliser la provenance comme filet de compatibilité inter-versions (les seeds ne se rejouent pas v1↔v2 : `mulberry32` direct vs `xmur3→mulberry32`, plages de params élargies `const` [-1,1]→[-2,2], amp `x/y` 0.7→1.0) ; (b) assumer PNG-only et supprimer le code v1 correspondant. Ne pas laisser le bloc en suspens : c'est ce qui empêche de clore la migration.

**Lien codebase :** `packages/randomart/src/core/artwork/{serialize,create,provenance}.ts`, `packages/randomart/src/stores/labStore.ts:350-430` ; cible v2 : `packages/randomart-vm/src/ir/serialize.ts`, `packages/randomart-ui/src/stores/vmStore.ts`.

### Action Kanban

```bash
./scripts/kanban.sh idea "Trancher artefact .randomart.json + provenance en v2" -b "v1 exporte un artefact avec provenance vérifiée (regenerable/hand-edited/version-mismatch), v2 n'a que le PNG. Soit porter le format (versionner ir/serialize d'abord), soit assumer PNG-only et supprimer le code v1. Bloque la clôture de la migration."

```

---
