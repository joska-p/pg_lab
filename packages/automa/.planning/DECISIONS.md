# Automa migration — DECISIONS (append-only, ne jamais réécrire)

- 2026-09-21 D1: cible = `packages/automa` existant, structure
  ExperimentShell conservée (patterns mosaic-maker/art-canvas/mol-demo).
- 2026-09-21 D2: Button sans fidélité aux variants tlc; familles UI
  choisies pour une interface sympa et cohérente.
- 2026-09-21 D3: sections toujours ouvertes (`ControlSection`, pas de
  repliable); `<input type=color>` brut → `ColorField`.
- 2026-09-21 D4: seule feature ajoutée = readout génération (`Readout`);
  sinon port à l'identique.
- 2026-09-21 D5 (S1): `SimulationEngine.ts` copié dès S1 (requis par
  l'import type de `store.ts`); `actions.ts`, `coordinates.ts`,
  `useCellPainting.ts` restent en S2. Fichiers portés normalisés au
  style repo via `vp check --fix` (guillemets doubles, indent 2).
- 2026-09-21 D6 (S2): fix `CanvasInteractions` void appliqué dès S2
  (pas différé en S3) — requis pour un `vp check` vert; `onEnd`
  accepte l'event et l'ignore (`_event`); `GpuSurface` garde son path
  `gpu/GpuSurface` (inchangé, vérifié).
