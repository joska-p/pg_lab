# glaze3D — Plan multisession

Source of truth: `01-objectif.md` (double objectif, scope), `02-usecases.md`
(A1-A6 produit, B1-B8 lib), `03-specs.md` (§1-7 + ordre), `mol-demo.js.txt`
(démo origine, 855 lignes, three.js à remplacer).

## Conventions de session

- Démarrage: lire `STATUS.md` seul, puis le §PLAN de la session en cours.
- Fin (obligatoire): MAJ `STATUS.md` (State+Next), 1 ligne datée `SESSIONS.md`,
  append `DECISIONS.md` si arbitrage, `vp check` vert dans le package touché.
- Preuve avant synthèse: citer `fichier:ligne` et sorties de commandes.
  Un step est done seulement si sa DoD est vérifiée, jamais sur intention.
- Commandes: `vp check` (format+lint+type), `vp test` (vitest
  `src/**/*.test.ts` côté `glaze3d`), `vp run <script>` pour build/dev.
- Priorité lib > viewer en cas d'arbitrage (cf. objectif).

## Carte des dépendances

S1 (maths) → S2 (scene+caméra) → S3 (renderer squelette) → S5 (Phong+renderer)
S1 → S4 (géométries) → S5. S1+S2 → S6 (controls, parallélisable avec S4-S5).
S5+S6 → S8 (viewer). S7 (data) indépendant dès S0. S8+S7 → S9 (pattern) → S10.

## S0 — Préparation (done 2026-09-20)

Poser STATUS/PLAN/DECISIONS/SESSIONS. Vérifié: `packages/glaze3d/src/` vide,
`mol-demo/src/` = App/main/style/stores seuls, specs §1-7 actionnables.

## S1 — Maths glaze3d (spec §1, UC B2/B3)

Fichiers: `packages/glaze3d/src/math/{vec3,quat,mat4}.ts` (+ `index.ts`),
tests `*.test.ts` (length/normalize, subVectors/lerp, setFromUnitVectors/
angleTo, perspective/compose/multiply/invert, `elements` column-major).
Points ouverts à trancher: `Quat.multiply/slerp` seulement si S6 l'exige —
noter la décision dans DECISIONS.md.
DoD: `vp test` et `vp check` verts dans `packages/glaze3d`.

## S2 — Scene graph + caméra (spec §2-3, UC B1/B2/B3)

Fichiers: `src/core/object3d.ts` (Object3D/Group/Mesh/Light/Ambient/
Directional, `add/remove/clear`, `updateMatrix/updateMatrixWorld`),
`src/core/camera.ts` (PerspectiveCamera, `projectionMatrix`,
`matrixWorldInverse` auto via override `updateMatrixWorld`, `updateProjectionMatrix`).
Test décisif: lumière attachée à caméra (`camera.add(light)`) → `matrixWorld`
correcte après `updateMatrixWorld`.
Hors scope: layers/traverse/events/clone, `lookAt`, ortho/culling.
DoD: tests hiérarchie + matrices verts, `vp check` vert.

## S3 — Renderer squelette (spec §6 version squelette, UC B6 partiel)

Fichiers: `src/renderer/renderer.ts` (`Renderer({canvas,alpha,antialias})`,
`setSize/setPixelRatio/setClearColor`, `render(scene,camera)` avec
`updateMatrixWorld` interne + triangle codé en dur, `DEPTH_TEST` on).
But: valider le pipeline WebGL2 avant la complexité (ordre specs §"récap").
DoD: triangle visible via page/harness manuelle + `vp check` vert.
Divergence assumée: `setSize/setPixelRatio` explicites (cf. `resizeMol`,
`mol-demo.js.txt:676-684`), pas de `#resize` auto façon `GpuSurface`.

## S4 — Géométries (spec §4, UC B4)

Fichiers: `src/geometry/{geometry,sphere,cylinder}.ts` (`GeometryData`
positions/normales séparées non entrelacées, `SphereGeometry(radius,
widthSeg, heightSeg)`, `CylinderGeometry(rTop, rBottom, height, radialSeg)`),
`Uint16` défaut → `Uint32` si >65536 vertices.
Hors scope: UVs, tore/cube/plan.
DoD: tests (counts, normales unitaires, indices dans bornes) + `vp check` vert.

## S5 — Shading Phong + renderer complet (spec §5+§6, UC B5/A2)

Fichiers: `src/material/phong.ts` (`Material` base, `PhongMaterial{color,
shininess, specular}`), renderer: génération/compilation shader Phong selon
lumières (constante compile-time ~1 ambient + 4 directional, démo = 1+3),
uniforms lumières (structure libre, noter dans DECISIONS.md), échappatoire
shader custom (même logique que `createProgram()` glaze).
Référence visuelle: `buildMolMesh` (`mol-demo.js.txt:739-763`), shininess
100/70, specular `0x333333`.
DoD: sphère+cylindre éclairés rendus, équivalence crédible, `vp check` vert.

## S6 — Orbit controls (spec §7, UC A3/B7)

Fichiers: `src/controls/orbit.ts` (`OrbitControls(camera, domElement,
{enableDamping/dampingFactor/autoRotate/autoRotateSpeed/enablePan/
enableZoom})`, `update()` par frame, event `change`, `dispose()`).
Cible fixe = origine (pas de `target` mobile). `enablePan/Zoom` exposés même
si démo à `false` (`mol-demo.js.txt:716-722`: pan/zoom false, autoRotate
0.75, damping 0.07). `change` → `patDirty=true` (intégration A6).
Ne dépend que de S1+S2: parallélisable avec S4-S5.
Hors scope: pinch avancé, min/maxPolarAngle.
DoD: drag → rotation, damping/autoRotate fluides, test simulé + `vp check`.

## S7 — mol-demo data layer (UC A1/A4/A5)

Fichiers: `packages/mol-demo/src/lib/{parseMol,formFactors,atoms}.ts`
(portage `parseMol` V2000 + centroïde `mol-demo.js.txt:605-652`,
tables FF `FF_DATA/FF_SYMS→FF` l.11-126 + `FF_TBL/ff` l.133-154,
palette `ATOM/ATOM_FALLBACK` l.157-188, constantes `Q_MAX/Q_MIN/FF_N`,
`MAX_ATOMS` mobile 16 / desktop 60 l.132), assets SDF → `public/molecules/`
(choisir subset ≤60 atomes depuis `PubChem_search_records.sdf` ou fixtures),
registre/liste (`MOLECULES` l.259-266 → composant React).
Validation: éléments inconnus et `> MAX_ATOMS` → refuse proprement, garde
l'ancienne molécule (`switchMolecule` l.655-673).
DoD: tests parser (V2000, centroïde, erreurs) + FF spot-check, `vp check` vert.

## S8 — mol-demo viewer 3D (UC A2/A3/A4, B1/B6)

Fichiers: `src/components/MolCanvas.tsx` (canvas fourni à `Renderer`,
`resizeMol` l.676-684, boucle RAF `controls.update + render` l.769-779),
`src/lib/buildMolMesh.ts` (sphères `r*0.45` 32×20, cylindres `0.065` 16 segs,
midpoint+`setFromUnitVectors(Y,dir)` l.739-763, `molGroup.clear()` au switch),
scène: `PerspectiveCamera(40,1,0.01,200)` pos `(4,3,11)` + 1 ambient 0.5 +
3 directional attachées caméra (l.711-733).
DoD: `vp run mol-demo#dev` affiche une molécule, drag tourne, switch sans
fantômes/fuites, `vp check` vert.

## S9 — Pattern diffraction + intégration caméra (UC A6, point sensible)

Fichiers: `src/lib/pattern/{lut,norm}.ts` (`XRAY_LUT` l.271-300,
`computeNorm32` grille 32×32 + EMA l.472-507), `src/components/PatternCanvas.tsx`
(shaders `VS_SRC/FS_SRC` l.309-371, `makeShader/makeProgram`, `initGPU`,
`setAtomFFUniforms`, uniforms `uAtomPos/uFFa/uFFb/uFFc`, `drawPattern`
throttle 33ms + early-out quaternion `angleTo<0.003` l.509-539,
fallback CPU l.542-599 + `initCPU`, `resizePat` BUF 600/900 l.686-704).
Lecture caméra imposée: `camera.updateMatrixWorld()` puis
`matrixWorldInverse.elements` projetant `(x,y)` (`me[0,4,8]`/`me[1,5,9]`,
l.521-526) — `glaze3d` ne doit rien connaître du pattern.
DoD: pattern réagit à la rotation, `change` → `patDirty`, GPU+CPU OK,
`vp check` vert.

## S10 — Finalisation (critères succès objectif)

Fichiers: drop `.mol/.sdf` sur parent `.mol-stage` (l.798-816), lifecycle
(`pageshow/visibilitychange` l.840-855), comparatif visuel vs démo origine.
Critères: zéro import three.js, sphères/cylindres + Phong + damping/
autoRotate équivalents, `drawPattern` lit la caméra `glaze3d`, API réutilisable
sans supposer "1 molécule/1 canvas" (B8 sans sur-ingénierie).
DoD: `vp check && vp run -r test && vp run -r build` verts + revue visuelle.
Clôturer: STATUS → done, dernière ligne SESSIONS.md.
