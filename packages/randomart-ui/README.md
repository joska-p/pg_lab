# randomart-ui

Interactive playground for the **randomart** procedural art generator. Consumes `randomart-core` for grammar, generation, and GLSL compilation; renders via `@repo/glaze` WebGL abstraction.

## Architecture

```
(randomart-core grammar, seed)
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
(RandomArtCanvas)  (GrammarSection, Inspector, ShaderSource, …)
```

### Stores

| Store           | Responsibility                                                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `artworkStore`  | Single source of truth: `Artwork { grammar, seed, expression, shader }`. Mutations go through `editGrammar`, `newSeed`, `randomizeGrammar`, `applyGrammar` (batched via RAF). |
| `surfaceStore`  | Holds the live `ClockStore` for playback controls and duration sync.                                                                                                          |
| `playbackStore` | Animation loop duration.                                                                                                                                                      |
| `modeStore`     | UI mode: `'toy' \| 'lab'`.                                                                                                                                                    |
| `errorStore`    | Single action error (`actionError`), cleared by the next successful action.                                                                                                   |

### Components

```
App
├── Scene (RandomArtCanvas)
└── Controls
    ├── ToyPanel (play/pause, reset, new seed, export PNG, GrammarSelect)
    ├── LabPanel
    │   ├── GrammarSection (weights, structure, color space, seed)
    │   ├── Inspector (formatted formulas)
    │   ├── ShaderSource (popover with compiled GLSL)
    │   └── PlaybackSection (loop (s))
    └── ErrorReadout
```

### Commands

| Command     | File                    | Notes                                                                                                                                                     |
| ----------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `exportPng` | `commands/exportPng.ts` | Renders the compiled shader offscreen (WebGL2 `OffscreenCanvas`, `EXPORT_SIZE` px square, capped by the GPU limits). Independent of the displayed canvas. |

### Rendering

`RandomArtCanvas` wraps `@repo/glaze/react/GpuCanvas`:

- **Timed clock** (paused at `phase = 0`), duration from `playbackStore`.
- **Lazy rendering**: `shouldRender` gate only redraws on phase change, resize, or context restore.
- **Square canvas** via CSS `aspect-ratio: 1/1` (shader coordinates unchanged).
- **Uniforms**: `u_phase` from clock progress; `v_p` declared in `main()` by randomart-core from `vUv`.

### Color spaces

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
vp test                                # All tests
```

### Adding a grammar preset

Add a `preset(label, description, options)` entry to `grammarRegistry` in
`randomart-core/src/grammar.ts`.

### Shader export

`ShaderSource` popover shows the compiled fragment shader. "Copy source" uses Clipboard API (fail-soft).

### PNG export

`exportPng` renders the compiled shader offscreen in a dedicated WebGL2 `OffscreenCanvas` at `EXPORT_SIZE` px square (capped by the GPU viewport limits), independent of the displayed canvas. The phase is the current clock progress for animated shaders, `0` otherwise. Filename: `randomart-<sanitized-seed>.png`.

### Conventions

- **English** for all UI copy, comments, docs.
- **"Artwork"** = the central concept (grammar + seed + compiled output).
- **StyleX** for component styles (no inline `CSSProperties`).
- **Seed** = trimmed non-empty string ≤ 64 chars (`randomart-core/seed.ts`).
