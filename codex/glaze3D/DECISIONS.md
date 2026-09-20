# glaze3D — Decisions (append-only, never rewrite)

- 2026-09-20 (S0): prior lib > viewer en arbitrage (objectif). Source: `01-objectif.md:40-45`.
- 2026-09-20 (S0): rep main droite + WebGL2 only, unis angstrms cte dmo.
  Source: `03-specs.md:9-13`, `01-objectif.md:76-78`.
- 2026-09-20 (S0): `Scene` = `Group` racine, pas de classe part.
  Source: `03-specs.md:127-129`.
- 2026-09-20 (S0): `updateMatrixWorld` explicite via `render()`, pas auto par mutation.
  Source: `03-specs.md:130-133`.
- 2026-09-20 (S0): `matrixWorldInverse` auto dans `updateMatrixWorld` (pattern lit
  `elements` chaque frame sans recalcul, `mol-demo.js.txt:521-525`).
  Source: `03-specs.md:171-175`.
- 2026-09-20 (S0): pas de `lookAt` tant que seul S8 en a besoin.
  Source: `03-specs.md:176-179`.
- 2026-09-20 (S0): buffers non entrelacs, Uint16->Uint32 si >65536.
  Source: `03-specs.md:217-222`.
- 2026-09-20 (S0): 1 ambient + 4 directional compile-time, 1 seul `PhongMaterial`,
  escape hatch shader custom. Source: `03-specs.md:259-267`.
- 2026-09-20 (S0): `setSize/setPixelRatio` explicites (divergence `GpuSurface`
  assume), `DEPTH_TEST` on. Source: `03-specs.md:307-314`.
- 2026-09-20 (S0): controls cible origine fixe, flags pan/zoom exposs mme si
  dmo `false`, event `change` requis pour `patDirty`. Source: `03-specs.md:354-364`.
- 2026-09-20 (S0): entre `codex/glaze3D/STATUS.md` (entry), `PLAN.md`, `DECISIONS.md`,
  `SESSIONS.md` comme mmoire multisession (skill multisession, layout libre).
- 2026-09-20 (S1): `Quat.multiply/slerp` non ajouts (S6 non dmarr, hypothse
  angles sphriques directe). Source: `PLAN.md:31-35`, `03-specs.md:50-51,79-81`.
- 2026-09-20 (S1): extras minimaux hors spec littrale: `Vec3.set/dot/cross/
lengthSq`, `Quat.clone/normalize`, `Mat4.copy/multiplyMatrices` — requis pour
  `setFromUnitVectors`/`compose`/`position.set` (S2) et futur orbit, pas
  d'algbre gnrale. Source: `03-specs.md:17-63`.
- 2026-09-20 (S1): imports sans extension `.ts` (TS5097,
  `allowImportingTsExtensions` off, convention repo `glaze/src`).
- 2026-09-20 (S2): `Mesh.geometry/material` en `unknown` opaque (S4/S5 non
  demarres, pas de faux types partages). Source: `03-specs.md:113-116`.
- 2026-09-20 (S2): `updateMatrixWorld(force?)` propage toujours (pas de flag
  `matrixAutoUpdate`, appel explicite via `render()`). Source: `03-specs.md:130-133`.
- 2026-09-20 (S3): `setSize` ne touche pas au style CSS (caller owns CSS via
  `getBoundingClientRect`, cf. `resizeMol`), seul drawingbuffer+viewport.
  Source: `PLAN.md:56-57`.
- 2026-09-20 (S3): clear defaut transparent `[0,0,0],0` (fond transparent A2/A6),
  `antialias` defaut false, triangle squelette en clip-space sans uniforms
  (camera ignoree mais matrices MAJ dans `render()`). Source: `03-specs.md:286-311`.
- 2026-09-20 (S4): `toIndexArray(count,filled)` Uint16 defaut, Uint32 si
  vertices >65536 (seuil spec exact: max index 65535 tient en Uint16).
  Source: `03-specs.md:220-222`.
- 2026-09-20 (S4): tris polaires degeneres conserves (boucle uniforme,
  cout negligeable), segments clampes `Math.max` facon three.js (pas de
  throw). Source: `03-specs.md:188-228`.
- 2026-09-20 (S4): cylindre ferme (mur + 2 caps en fan, anneaux dupliques
  pour normales plates), normales mur purement radiales (demo = rayons
  egaux, pas de correction de pente). Source: `03-specs.md:188-213`.
- 2026-09-20 (S4): `geometry/check.ts` hors livrable (helpers de test:
  bornes, normales unitaires, orientation faces vers l'exterieur, tris
  degeneres ignores). DoD: counts + normales + bornes + winding.
- 2026-09-20 (S4): orientation sphere = three.js (`-cos(phi)sin(theta),cos(theta),
sin(phi)sin(theta)`), main droite conservee. Source: `03-specs.md:9-13`.
- 2026-09-20 (S4): cylindre ferme, anneaux caps dupliques (normales plates
  +/-Y), winding outward verifie; tris polaires sphere degeneres acceptes
  (zero-area, standard UV-sphere three.js, GPU-cules). Source: `03-specs.md:215-222`.
- 2026-09-20 (S4): helper `createIndexArray(count,filled)` (Uint16 si
  <=65536 verts, Uint32 au-dela), nom aligne sur `geometry.test.ts`.
  Source: `03-specs.md:220-222`.
- 2026-09-20 (S4): `Mesh.geometry/material` restent `unknown` (S5 resserre
  les deux ensemble, pas de faux types intermediaires).
