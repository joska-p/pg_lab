# glaze3D — Session log (append-only, one dated line per session)

- 2026-09-20 (S0): prep plan multisession — STATUS/PLAN/DECISIONS/SESSIONS poss,
  specs relues, `glaze3d/src/` vide vrifi, next=S1 maths.
- 2026-09-20 (S1): maths done — `math/{vec3,quat,mat4,index}.ts` + 13 tests,
  `vp test` 13/13 + `vp check` verts, next=S2 scene+camra.
- 2026-09-20 (S2): scene+camra done — `core/{object3d,camera,index}.ts` + 11 tests,
  `vp test` 24/24 + `vp check` verts, next=S3 renderer squelette.
- 2026-09-20 (S3): renderer squelette done — `renderer/{renderer,index}.ts` + 3 tests,
  `vp test` 27/27 + `vp check` verts, triangle pixel (255,76,51) headless, next=S4 geometries.
- 2026-09-20 (S4): geometries done — `geometry/{geometry,sphere,cylinder,index,check}.ts` + 3 tests,
  `vp test` 38/38 (9 fichiers) + `vp check` vert, next=S5 phong+renderer.
- 2026-09-20 (S4): geometries done — `geometry/{geometry,sphere,cylinder,index}.ts` + 3 tests,
  `vp test` 36/36 + `vp check` verts (0 erreurs), next=S5 phong (S6 parallelisable).
- 2026-09-20 (S5): phong+renderer done — `material/phong.ts` + renderer Phong
  (1 ambient + 4 dir, custom shader hatch) + 16 tests, `vp test` 51/51
  (10 fichiers) + `vp check` vert, next=S6 orbit controls.
- 2026-09-20 (S6): orbit controls done — `controls/{orbit,index}.ts` + 7 tests
  (+2 maths), `vp test` 60/60 (11 fichiers) + `vp check` vert, next=S7 data layer.
- 2026-09-20 (S7): data layer done — `mol-demo/src/lib/{parseMol,formFactors,
atoms,molecules,index}.ts` + 6 SDF `public/molecules/` (9->56 atomes) +
  `MoleculeList`/`moleculeStore`, `vp test` 34/34 (4 fichiers) + `vp check`
  vert, next=S8 viewer 3D.
- 2026-09-20 (S8): viewer 3D done — `lib/buildMolMesh.ts` + `MolCanvas.tsx`
  (camera 40/(4,3,11) + 1+3 lights, RAF controls.update+render, resizeMol) +
  exports `glaze3d`, `vp test` 37/37 (5 fichiers) + `vp check` vert, next=S9 pattern.
