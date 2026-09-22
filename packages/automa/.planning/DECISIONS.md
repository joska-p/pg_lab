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
- 2026-09-21 D7 (S3): `className="h-full w-full"` (tailwind) abandonné
  — `GpuCanvas` force déjà 100 % + block; pas de tailwind dans la
  cible. Callback `uniforms` annoté `Record<string, UniformValue>`
  (nouveau glaze strict sur l'union avec `{}`). Montage `CellMesh`
  dans `App` temporaire, layout Shell définitif en S4.
- 2026-09-22 D8 (S4): `PlaybackSection` porté dès S4 (pas en S5) —
  la simulation autoStart=false ne s'incrémente que via Play, requis
  pour le test manuel du live. Slider `onValueChange` + `Button
family`, grille 2 col en stylex local. Dev server lancé
  manuellement par l'utilisateur (ne pas relancer via l'agent).
- 2026-09-22 D9 (S4): `Readout Generation` placé dans un `ControlSection
title="Simulation"`; S4 validé manuellement par l'utilisateur.
- 2026-09-22 D10 (S5): familles Edit = Randomize `neon-violet`, Clear
  `error`, Draw actif `solder` (inactif défaut), Erase actif `error`
  (inactif défaut); Rule `amber`; Pattern `aqua` — pixels de mode = LED
  famille, pas de variant "secondary/destructive" (D2). Grille 2 col
  stylex identique à PlaybackSection.
- 2026-09-22 D11 (S5): `Select` type-safe — `onValueChange={setRule}`
  direct, pas de cast `value as RuleId` (le nouveau Select est générique
  `<T extends string>`, obsolete depuis tlc). Couleurs: `ColorField`
  value + `onValueChange` → `createCssColor` via `@repo/glaze/core/render`.
