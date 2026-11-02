# UI (v1 et v2) : `commit()` régénère + recompile à chaque événement de slider

**Contexte :** Drag d'un slider de poids/size/shareDepth dans les panels lab — le hot path d'interaction des deux apps (l'UI est identique dans les deux).

**Corps :** L'option `coalesce` de `commit()` ne déduplique que **l'entrée d'historique**, pas le **calcul** : à chaque tick d'événement, `vm.generate` + `vm.compile` (CPU) s'exécutent, plus la recompilation GPU côté `GpuCanvas` au changement de `source` — sans throttle rAF. Le problème est hérité de la v1 (même code dans `labStore.ts`). S'y ajoutent : (1) double `setState` par commit (historique puis état courant → état intermédiaire observable pour tout observateur non-React ; fusionnable en un seul) ; (2) champ mort `HistoryEntry.expression?` jamais peuplé ni lu (vestige du publish/import v1 — s'il était peuplé, `restoreEntry` éviterait generate+compile) ; (3) `setCanvas` sans remise à `null` au démontage (référence à un canvas détaché retenue au remontage/HMR).

**Lien codebase :** `packages/randomart-ui/src/stores/vmStore.ts:224-265,25,178`, `packages/randomart/src/stores/labStore.ts:210-268`.

### Action Issue GitHub

```bash
gh issue create --title "randomart-ui: commit() regenerates+recompiles per slider event, double setState, dead expression field" --body "UI identical in both apps. commit() coalesce option only dedupes the history entry, not the work: vm.generate+vm.compile CPU run on every slider tick plus GPU recompile, no rAF throttle (vmStore.ts:224-265 / labStore.ts:210-268). Also: two setState per commit (observable intermediate state), dead HistoryEntry.expression? field (never populated nor read), setCanvas never cleared on unmount."

```

---
