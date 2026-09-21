# mol-demo

Interactive molecular X-ray scattering demo: a 3D molecule viewer paired with a live oriented IAM scattering pattern.

Rotate the molecule, the diffraction pattern updates. Drop a `.mol` / `.sdf` file onto the stage to load it.

## Origin / credits

Port / re-implementation for this playground. The physics and rendering approach follow the original demo by David Romano:

- Site: https://davidromano.dev/
- `docs/mol-demo.js.txt` is a snapshot of the original page script it was adapted from.

## What it does

- 3D molecule view (`src/components/MolCanvas.tsx`, `src/lib/buildMolMesh.ts`)
- 2D scattering pattern, GPU WebGL2 + CPU fallback (`src/components/PatternCanvas.tsx`, `src/lib/pattern/`)
- Atomic form factors, IAM model (`src/lib/formFactors.ts`, `src/lib/atoms.ts`)
- `.mol` / `.sdf` V2000 parser + drag-and-drop loading (`src/lib/parseMol.ts`, `src/stores/moleculeStore.ts`)
- Molecule list, theme, perf HUD (`src/components/MoleculeList.tsx`, `src/components/PerfHud.tsx`)
