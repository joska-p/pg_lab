# randomart-ui

Interactive playground for the **randomart** procedural art generator. Consumes `randomart-core` for grammar, generation, and GLSL compilation; renders via `@repo/surface` WebGL abstraction.

## Architecture

```
(randomart-core grammar, seed, space)
        │
        ▼
┌───────────────────┐
│   artworkStore    │  ──▶ builds Artwork (expression, compiled shader)
│  (zustand + batch)│
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
Scene       Controls
(RandomArtCanvas)  (PrimaryActions, GrammarSelect, SeedSection, …)
```

### Stores

| Store          | Responsibility                                                                                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `artworkStore` | Single source of truth: `Artwork { grammar, seed, space, expression, shader }`. Mutations go through `editGrammar`, `newSeed`, `setSpace`, `randomizeGrammar`, `applyPreset` (batched via RAF).             |
| `surfaceStore` | Holds the mounted surface clock for PNG export and the latest shader error. Playback is scoped by `Experiment.tsx` via `PlaybackProvider`/`createPlaybackStore(false)`, not by a global import side effect. |
| `errorStore`   | Action errors of the latest action (`actionErrors`), replaced by the next failing action and cleared by the next successful one.                                                                            |

### Components

`Controls` is a single panel ordered from the coarse, everyday actions (toy level) down to the fine
controls. Each element is its own component, so the layout is rearranged by moving lines in
`Controls.tsx`.

```
App
├── Scene (RandomArtCanvas)
└── Controls
    ├── PrimaryActions            # toy level
    │   ├── PlaybackControls (play/pause, reset)
    │   └── ArtworkActions (new seed, export PNG)
    ├── GrammarSelect (preset + random)
    ├── ColorSection (color space)
    ├── SeedSection (seed input)  # fine controls
    ├── OperatorWeights (weights, grouped by family)
    ├── StructureSection (depth, nodes, share)
    ├── Inspector (formatted formulas)
    ├── ShaderSource (popover with compiled GLSL)
    └── ErrorReadout
```

### Commands

| Command     | File                    | Notes                                                                                                                                                               |
| ----------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `exportPng` | `commands/exportPng.ts` | Renders the compiled Shadertoy shader offscreen (WebGL2 `OffscreenCanvas`, `EXPORT_SIZE` px square, capped by the GPU limits). Independent of the displayed canvas. |

### Rendering

`RandomArtCanvas` wraps `@repo/surface/react/GpuCanvas`:

- **Timed clock**: `Experiment.tsx` provides a scoped playback store created with `createPlaybackStore(false)`, so randomart starts paused by experiment choice.
- **Lazy rendering**: `shouldRender` gate only redraws on time change (animated shaders), resize, or context restore.
- **Square canvas** via CSS `aspect-ratio: 1/1`.
- **Time**: `@repo/surface` auto-injects `iTime = surface.clock.time`. The shader's `ra_phase()` hook (from `@repo/randomart-core/glsl`) derives continuous animation time from it.

### Post-processing

`postProcessing/effects.ts` is the registry of full-screen passes applied after the artwork shader,
sorted by `order` (lower runs first). Each pass reads `u_source` and writes color back, so an effect
must preserve the artwork unless it is explicitly a debug view.

- `grain` adds deterministic per-pixel noise.
- `smin` / `smax` soft-clip highlights / shadows toward mid-gray using the shared
  `ra_smin` / `ra_smax` helpers from `randomart-core/glsl`, then apply the luminance change as a
  gain so hue and alpha are preserved. Enabling both flattens the image toward mid-gray by
  construction: one compressor followed by one lifter leaves little range.

### Color spaces

The color space is selected independently of the grammar (in `ColorSection`, via `useSpace` /
`setSpace`) and passed to `compile` as its ColorSpace. Generation never reads it: changing the space
keeps the same expression and only recompiles the shader.

Raw channel triplets `[-1, 1]³` → sRGB via `randomart-core/colors.ts`:

| ID      | Label | GLSL entry point |
| ------- | ----- | ---------------- |
| `srgb`  | sRGB  | `ra_srgb`        |
| `oklch` | OKLCH | `ra_oklch`       |
| `oklab` | OKLab | `ra_oklab`       |
| `hsl`   | HSL   | `ra_hsl`         |

CPU reference `toSrgb(id, raw)` exists in core for testing / headless rendering.

### Development

```bash
# From repo root
vp -C packages/randomart-ui dev        # Dev server
vp -C packages/randomart-ui build      # Production build
vp check --fix                         # Format, lint, type-check (all packages)
vp test --exclude '.Trash-1000/**'     # All tests (skips the deleted glaze tree)
```

### Adding a grammar preset

Add a `preset('id', label, description, options, space)` entry to `GRAMMAR_PRESETS` in
`randomart-core/src/grammar.ts`. The space is only a suggested ColorSpace: applying the preset sets
both the grammar and the current space.

### Shader export

`ShaderSource` popover shows the compiled Shadertoy fragment shader. "Copy for Shadertoy" copies the
exact rendered source for pasting into `shadertoy.com/new` (Image tab), using the Clipboard API
(fail-soft).

### PNG export

`exportPng` renders the compiled shader offscreen in a dedicated WebGL2 `OffscreenCanvas` via
`@repo/surface/gpu/Program` at `EXPORT_SIZE` px square (capped by the GPU viewport limits),
independent of the displayed canvas. It exports at the current surface clock `time` (the same
`iTime` as the canvas), so the PNG matches the live image. For static shaders time is irrelevant.
Filename: `randomart-<sanitized-seed>.png`.

### Conventions

- **English** for all UI copy, comments, docs.
- **"Artwork"** = the central concept (grammar + seed + space + compiled output).
- **StyleX** for component styles (no inline `CSSProperties`).
- **Seed** = trimmed non-empty string ≤ 64 chars (`randomart-core/seed.ts`).
