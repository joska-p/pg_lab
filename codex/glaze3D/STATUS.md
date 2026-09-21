# glaze3D — STATUS (entry point, read first)

Goal: `glaze3d` (WebGL2 mini-framework, successeur three.js simple) + `mol-demo`
(registre/viewer molécules sur `glaze3d`, pattern diffraction raw conservé).
Priorité au niveau technique en cas d'arbitrage (cf. `01-objectif.md`).
SSOT: `codex/glaze3D/01-objectif.md`, `02-usecases.md`, `03-specs.md`, `mol-demo.js.txt`.

State: S9 done — pattern diffraction (`lib/pattern/{lut,norm,viewer,index}.ts`:
`XRAY_LUT` γ0.72, `projectAtoms` via `matrixWorldInverse.elements`
`me[0,4,8]/me[1,5,9]`, `computeNorm32Raw` 32×32 + EMA `createPatternNorm`

- 10 tests, `components/PatternCanvas.tsx`: shaders `VS_SRC/fragSrc`
  (MAX_ATOMS mobile/desktop), `makeShader/makeProgram`, `setAtomFFUniforms`,
  throttle 33ms + early-out `angleTo<0.003`, fallback CPU + `resizePat`
  600/900, `change` → `patDirty`, `MolCanvas` expose `viewerRef`, `App`
  mol+pattern côte à côte) + exports pattern (`lib/index.ts`) +
  `vp test` 47/47 (7 fichiers), `vp check` vert, build OK (72 modules).
  Verified: `vp test` 47/47 10:03, `vp check` 0 erreurs 29 fichiers,
  `vp run mol-demo#build` OK (72 modules). Headless: GPU non vérifiable
  visuellement, CPU/GPU fidèles à `mol-demo.js.txt`.
  Next: S10 — finalisation (drop `.mol/.sdf`, lifecycle, comparatif visuel,
  `vp check && vp run -r test && vp run -r build`).
  Detail: `PLAN.md` §S5. Decisions: `DECISIONS.md`. Log: `SESSIONS.md`.

Ritual fin de session (obligatoire): MAJ State+Next ici, 1 ligne datée
dans `SESSIONS.md`, append décisions dans `DECISIONS.md`, `vp check`.
