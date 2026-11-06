# Progression — correction des warnings `no-unsafe-type-assertion`

Total : 88 avertissements dans 46 fichiers.

## Légende
- `pending` : à traiter
- `done` : corrigé et vérifié via `vp check`
- `branding` : cas attendu lié au branding, traité à part (pattern `typedKeys` + disable comment)
- `cas-par-cas` : correction unitaire selon les patterns de `context.md`

## Tâches (une par fichier, voir `tasks/task-XX.md`)

- task-01.md | packages/glaze/src/core/FrameLoop.ts | 1 warning(s) | done | 1 branding
- task-02.md | packages/glaze/src/core/InputStore.ts | 9 warning(s) | done | 9 branding
- task-04.md | packages/glaze/src/core/render.ts | 1 warning(s) | done | 1 branding
- task-05.md | packages/glaze/src/core/time.ts | 4 warning(s) | done | 4 branding
- task-09.md | packages/glaze/src/gpu/shader/compileProgram.ts | 1 warning(s) | done | 1 cas-par-cas
- task-10.md | packages/glaze/src/react/clockStore.ts | 1 warning(s) | done | 1 branding
- task-11.md | packages/glaze/src/react/surfaceStack.ts | 1 warning(s) | done | 1 branding
- task-13.md | packages/glaze3d/src/controls/orbit.ts | 2 warning(s) | done | 2 cas-par-cas
- task-15.md | packages/sequencer/src/components/layers/LayerOptionSection.tsx | 3 warning(s) | done | 3 cas-par-cas
- task-16.md | packages/sequencer/src/core/layers/drawBarChart.ts | 2 warning(s) | done | 2 cas-par-cas
- task-17.md | packages/sequencer/src/core/layers/drawBaseline.ts | 3 warning(s) | done | 3 cas-par-cas
- task-18.md | packages/sequencer/src/core/layers/drawConnectionLines.ts | 3 warning(s) | done | 3 cas-par-cas
- task-19.md | packages/sequencer/src/core/layers/drawFactorWaves.ts | 2 warning(s) | done | 2 cas-par-cas
- task-20.md | packages/sequencer/src/core/layers/drawMountain.ts | 1 warning(s) | done | 1 cas-par-cas
- task-21.md | packages/sequencer/src/core/layers/drawPlottedNumbers.ts | 3 warning(s) | done | 3 cas-par-cas
- task-22.md | packages/sequencer/src/core/layers/drawRadialSpokes.ts | 5 warning(s) | done | 5 cas-par-cas
- task-23.md | packages/sequencer/src/core/layers/drawRecamanArcs.ts | 3 warning(s) | done | 3 cas-par-cas
- task-24.md | packages/sequencer/src/core/layers/drawStemPlot.ts | 4 warning(s) | done | 4 cas-par-cas
- task-25.md | packages/sequencer/src/modules/fourier/drawFourierEpicycles.ts | 2 warning(s) | done | 2 cas-par-cas
- task-26.md | packages/randomart-core/src/colors.ts | 1 warning(s) | pending | 1 branding
- task-27.md | packages/randomart-core/src/grammar.ts | 2 warning(s) | pending | 2 branding
- task-28.md | packages/randomart-core/src/ops.ts | 1 warning(s) | pending | 1 branding
- task-29.md | packages/randomart-core/src/seed.ts | 2 warning(s) | pending | 2 branding
- task-30.md | packages/randomart-core/src/tree.ts | 1 warning(s) | pending | 1 cas-par-cas
- task-31.md | apps/brouillon/src/App.tsx | 5 warning(s) | pending | 5 branding
- task-32.md | apps/playground/src/components/home/Controls.tsx | 1 warning(s) | pending | 1 branding
- task-33.md | apps/playground/src/experiments.ts | 1 warning(s) | pending | 1 branding
- task-34.md | packages/art-canvas/src/components/Controls.tsx | 1 warning(s) | pending | 1 branding
- task-35.md | packages/art-canvas/src/experiments.ts | 1 warning(s) | pending | 1 branding
- task-36.md | packages/fracture/src/components/Controls.tsx | 1 warning(s) | pending | 1 branding
- task-37.md | packages/fracture/src/experiments.ts | 1 warning(s) | pending | 1 branding
- task-39.md | packages/mosaic-maker/src/components/controls/TileSetControls.tsx | 1 warning(s) | pending | 1 cas-par-cas
- task-40.md | packages/mosaic-maker/src/utils/palettes/fetchPalettes.ts | 2 warning(s) | pending | 1 branding, 1 cas-par-cas
- task-41.md | packages/mosaic-maker/src/utils/random/shuffleObject.ts | 1 warning(s) | pending | 1 cas-par-cas
- task-42.md | packages/notebook/src/components/Controls.tsx | 1 warning(s) | pending | 1 branding
- task-43.md | packages/palette/src/components/Controls.tsx | 2 warning(s) | pending | 2 branding
- task-44.md | packages/palette/src/components/color-picker/colorSpaceCanvas.worker.ts | 1 warning(s) | pending | 1 branding
- task-45.md | packages/palette/src/components/color-picker/colorSpaceCanvasPool.ts | 1 warning(s) | pending | 1 cas-par-cas
- task-46.md | packages/pixel/src/docs/components/Controls.tsx | 2 warning(s) | pending | 2 branding
- task-47.md | packages/pixel/src/processor/neighborhood-tiling.ts | 1 warning(s) | pending | 1 cas-par-cas
- task-48.md | packages/pixel/src/worker/process-image-in-worker.ts | 1 warning(s) | pending | 1 cas-par-cas
- task-49.md | packages/pixel/src/worker/serialization.ts | 1 warning(s) | pending | 1 cas-par-cas
- task-50.md | packages/three-stage/src/components/GetStarted/Root.tsx | 2 warning(s) | pending | 2 branding
- task-51.md | packages/ui/src/components/ExperimentShell.tsx | 1 warning(s) | pending | 1 cas-par-cas
- task-52.md | packages/ui/src/components/Select.tsx | 1 warning(s) | pending | 1 cas-par-cas
- task-53.md | tools/new-mini-app/bin/index.ts | 1 warning(s) | pending | 1 branding

## Comment mettre à jour ce fichier
- Lorsqu'une tâche est terminée : passer sa ligne de `pending` à `done`.
- À la fin d'une session : ajouter ici les nouvelles tâches découvertes pour la session suivante.
- Quand toutes les tâches sont `done` : relancer `vp check` pour confirmer 0 warning `no-unsafe-type-assertion`.
