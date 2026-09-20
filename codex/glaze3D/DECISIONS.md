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
