# Automa migration — AUDIT (faits vérifiés)

Source: `_TMP/automa-to-migrate` — 19 fichiers, ~1407 lignes.
Cible: `packages/automa/src` — squelette `App.tsx` (ExperimentShell+Stage+
theme via `stores/appStore.tsx`), `main.tsx`, `style.css`. Deps déjà OK:
`@repo/glaze`, `@repo/ui`, `zustand` (`packages/automa/package.json:11-16`).
Références pattern: `mosaic-maker/src/App.tsx:1-27`,
`mol-demo/src/App.tsx:16-75`, `art-canvas/src/App.tsx:71-106`.

## 1. TLC → @repo/ui (7 fichiers)

| Ancien (tlc)                                                             | Nouveau (@repo/ui)                                                                                                                   | Fichiers source                                                                |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `Shell, ShellCanvas, ShellPanels` (`layout`)                             | `ShellWrapper` + `ExperimentShell panel=` + `Stage`                                                                                  | `App.tsx:1-2,10-17`                                                            |
| `ErrorBoundary` (`components/display`)                                   | `ErrorBoundary` (`components/ErrorBoundary`)                                                                                         | `App.tsx:1,9`                                                                  |
| `Panel title=` (`layout`)                                                | `ControlPanel title=`                                                                                                                | `controls/ControlPanel.tsx:1,10`                                               |
| `PanelSection label= collapsible=`                                       | `ControlSection title=` (pas de repliable)                                                                                           | 4 sections, `collapsible={false}` partout                                      |
| `ControlGrid columns={2}`                                                | `Stack` ou grille stylex locale (cf `mosaic-maker/.../MosaicControlsPanel.tsx:64-69` : `display:grid repeat(2,1fr)`)                 | `PlaybackSection.tsx:18,36`, `EditSection.tsx:16,50`                           |
| `FieldRow label=`                                                        | label intégré au widget (`Select label=`, `Slider label=`, `ColorField label=`) ou `ControlField` pour custom                        | `PlaybackSection.tsx:36`, `RuleSection.tsx:19,31-35`, `CreatureSection.tsx:17` |
| `Button variant= primary/secondary/default/destructive onClick disabled` | `Button family= onClick disabled` — familles: `aurora solder neon-violet amber error aqua orange` (`ui/.../families.stylex.ts:4-11`) | `PlaybackSection.tsx:19-34`, `EditSection.tsx:17-49`                           |
| `Slider value= onChange= min max step`                                   | `Slider value= onValueChange= min max step label=` (`ui/.../Slider.tsx:11-23`)                                                       | `PlaybackSection.tsx:37-45`                                                    |
| `Select value= onChange= options=[{label,value}]`                        | `Select value= onValueChange= options=` même forme (`ui/.../Select.tsx:17-31`)                                                       | `RuleSection.tsx:20-29`, `CreatureSection.tsx:18-27`                           |
| `<input type=color>` brut (`RuleSection.tsx:36-43`, class tailwind)      | `ColorField label= value= onValueChange=` (`ui/.../ColorField.tsx:12-24`)                                                            | `RuleSection.tsx:31-45`                                                        |
| `@import '@repo/tlc/theme'` + `@source ...tlc` (`styles/global.css:1-4`) | `@repo/ui/styles` + `style.css` existant + `ShellWrapper`                                                                            | `main.tsx:5`, `styles/global.css`                                              |

## 2. Glaze — éclatement de `core/types`, pas de refonte

Ancien import unique `@repo/glaze/core/types` → nouveau, par symbole:

- `CssColor, createCssColor` → `@repo/glaze/core/render`
  (`packages/glaze/src/core/render.ts:3,35`). Usage: `store.ts:9`,
  `actions.ts:1,12`, `constants.ts:1`, `colors.ts:1`, `RuleSection.tsx:1`.
- `Seconds, NonNegativeSeconds, msToSeconds` → `@repo/glaze/core/time`
  (`src/core/time.ts:3-12,50`). Usage: `actions.ts:12,70`,
  `SimulationEngine.ts:2,15,47,76`.
- `Point2D, toScreenPoint` → `@repo/glaze/core/geometry`
  (`src/core/geometry.ts:3-24`). `Camera` type → `@repo/glaze/core/Camera`
  (classe `src/core/Camera.ts:6-40`). Usage: `coordinates.ts:1-2`,
  `gridPlacement.ts:1`.
- Inchangés (même path, même API): `defaultCamera` (`core/Camera`),
  `createClock` (`core/Clock`), `parseColor` (`gpu/shapes/color`),
  `GpuCanvas` (`react/GpuCanvas`), `createStateBuffer`+`StateBuffer`
  (`gpu/StateBuffer.ts:205-301`: `addProgram/useProgram/setUniforms/
step/init/resize/destroy/getTexture`), `GpuSurface.createStateBuffer`,
  `surface.width/height/camera/deltaTime`.

## 3. Breaking change réel: `CanvasInteractions`

- Nouveau type (`glaze/src/react/types.ts:63-71`): `onStart/onMove/onZoom/
onContextMenu → void` (ancien code retourne `boolean false` dans
  `hooks/useCellPainting.ts:29-64` — à réécrire, `return false` interdit).
- `onEnd` reçoit désormais l'event (`LiveInteractionEvent`) — ancien
  `onEnd = (): void` doit accepter l'arg (l'ignorer).
- `pan: { button: 1 }` reste valide (`PanOptions.button?: number|number[]`,
  `gestureTypes.ts:17-19`). `initialCamera={{minZoom,maxZoom}}`,
  `fragmentShader/uniforms/onFrame/onMount` inchangés
  (`GpuCanvas.tsx:9-69`, `react/types.ts:113-132`).

## 4. Port tel quel (zéro risque UI)

`engine/config.ts, grid.ts, rng.ts, rules/registry.ts, creature/registry.ts,
creature/builtin.ts (305l), lib/gridPlacement.ts, lib/constants.ts,
stores/automa/store.ts (vanilla zustand), stores/automa/selectors.ts`,
3 shaders (`cell-mesh.frag, sim-step.frag, gpu-paint.frag`, imports `?raw`
— pattern déjà utilisé: `art-canvas/.../Spirale.tsx:3`).

## 5. État jamais affiché

`generation` trackée (`actions.ts:32-34`, `SimulationEngine.ts:212-215`)
mais aucun composant ne lit `useGeneration` (`selectors.ts:13`). Seul ajout
fonctionnel prévu: `Readout` génération (pattern
`mol-demo/.../MoleculeList.tsx:37-44`).
