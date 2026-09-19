# Art Canvas — Audit (analysis + migration reference)

> Companion to `STATUS.md` (entry point) and `DECISIONS.md` / `SESSIONS.md`.
> This file holds the durable analysis: what the app is, what was copied, the
> `@repo/tlc` → `@repo/ui` mapping, the store plan, and the detailed steps.

---

## 1. What the app is

A drop-bag for WebGL shader experiments. The container provides canvas + state +
controls wiring; each idea lives as a self-contained module. 5 modules + 1 planned:

| Module         | Nature                                                                                                       | tlc-free today           |
| -------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------ |
| `spirale`      | Archimedean spiral, plotter aesthetic (GLSL `snoise` 3D Perlin); clock store                                 | canvas yes / controls no |
| `seed`         | Registry-based procedural shader generation from a seed string (moods / palettes / templates / module picks) | canvas yes / controls no |
| `folded-space` | Indexed-space neon folding (3 GLSL modules injected)                                                         | **fully yes**            |
| `atlas`        | Unicode-syllabics grid via modular arithmetic (Fibonacci SDFs); the "current architectural push"             | canvas yes / controls no |
| `manual`       | OKLCH field explorer (pure OKLCH→sRGB fragment shader)                                                       | canvas yes / controls no |
| `guilloche`    | planned — only `refs.md`, no code                                                                            | n/a (out of scope)       |

Shared infra: `assembly/` (seeded deterministic shader assembly), `shaders/`
(GLSL libs + module wrappers + 3 templates + registries), `palettes/` (5 cosine
palettes), `stores/ui` (mode switcher).

## 2. Source ↔ destination & current tree

- Sources (keep): `_TMP/art-canvas-to-migrate/` — 78 files, ~1900 LOC, gitignored.
- Destination: `packages/art-canvas/` (skeleton committed `b05d0e7 setup art-canvas`).
- Copied 2026-09-19: 74 files → `packages/art-canvas/src/` (`src/` now holds 78 files,
  4 were pre-existing skeleton files: `App.tsx`, `main.tsx`, `style.css`, `stores/appStore.tsx`).
- Not copied from `_TMP` (replaced/rewritten): `App.tsx`, `main.tsx`,
  `styles/global.css` (tailwind), `README.md` (→ migration target for Step 4).

```text
packages/art-canvas/src/
  App.tsx                  # ui shell + ErrorBoundary (no modules yet)
  main.tsx                 # ok as-is
  style.css                # ok as-is (box-sizing, color-scheme dark)
  stores/
    appStore.tsx           # skeleton theme store — DEAD (see DECISIONS D8)
    ui/store.ts            # inputMode store → repo pattern (Step 1), typo setInpuMode→setInputMode
  assembly/                # 12 files, pure TS, no tlc
  palettes/registry.ts     # 5 cosine palettes
  shaders/                 # 38 files: glsl×15 (raw), modules×17 (TS wrappers), preamble×2, templates×3, types×1
  modules/<name>/          # 22 files (each: component + controls + store; atlas has store/{actions,selectors,store,types})
```

## 3. Target repo conventions (behave like `mosaic-maker`)

- Vite+ (`vp …`) + React 19 + `@repo/ui` (StyleX source, not dist) + zustand; pnpm `catalog:` deps.
- Local `stylex.create` in the app imports tokens from `@repo/ui/tokens/*.stylex` /
  `@repo/ui/recipes/*.stylex`, never from the barrel (`codex/docs/ui-setup.md` § 3).
- Stores: zustand `create<T>(() => ({…}))`; hooks/actions as plain named functions.
- Formatting/lint: 2-space indent, double quotes, named exports; `vp check --fix`.
- Conventions SSOT: `codex/docs/{coding-conventions,ui-setup,component-authoring}.md`.

## 4. Infra compatibility (already migrated, format-only)

- `@repo/glaze` provides `GpuCanvas` (props `fragmentShader`, `uniforms`, `onFrame`,
  `onClockStore`, `canvasInteractions`), `createClockStore`/`createNullClockStore`
  (`@repo/glaze/react/clockStore`), `ClockStore` (`@repo/glaze/react/types`). All APIs
  used by the source exist identically.
- Default GPU uniforms (`gpu/shader/setUniforms.ts`): `u_resolution`, `u_aspect`,
  `u_mouse`, `u_camera`, `u_dpr`, `u_time`, `u_clockTime` → every shader works as-is
  (`spirale` uses `u_resolution`/`u_clockTime`; templates use `u_time`/`u_mouse`).
- `?raw` imports (`*.glsl?raw`) are covered by `types: ["vite/client"]` in the app
  tsconfig and work natively under Vite.
- Not counted in tlc surface: `assembly/`, `palettes/`, `shaders/**`, all five
  canvas components, `SyllabicFibonacciMaterial.ts`, GLSL files, module refs docs.

## 5. Dependency check

`packages/art-canvas/package.json` is already complete:

```jsonc
"dependencies": {
  "@repo/glaze": "workspace:*",
  "@repo/ui": "workspace:*",
  "react": "catalog:",
  "react-dom": "catalog:",
  "zustand": "catalog:"
}
```

Dropped: `@repo/tlc` (replaced by `@repo/ui`), `tailwindcss` (only in the unmigrated
`global.css`). No `zod` (that's mosaic-maker-specific).

## 6. `@repo/tlc` → `@repo/ui` mapping (authoritative)

`@repo/tlc` doesn't exist in this repo. Controls are the only consumers.

| Source (`@repo/tlc/…`)                                          | Target (`@repo/ui/components/…`)                                                                                          | Notes on API differences                                                           |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `layout` `Shell`, `ShellCanvas`, `ShellPanels`                  | `ShellWrapper` + `ExperimentShell` (`panel` + children; `panelPlacement="docked"\|"floating"`; built-in show/hide toggle) | App-level only                                                                     |
| `layout` `Panel` (`title`)                                      | `ControlPanel` (`title`, children)                                                                                        | `<aside>`, h2                                                                      |
| `layout` `PanelSection` (`label`)                               | `ControlSection` (`title`, children)                                                                                      | h3                                                                                 |
| `components/forms` `FieldRow` (`label`)                         | `ControlField` (`label`, children)                                                                                        | Custom content only — don't double-label                                           |
| `components/forms` `Select` (`options`, `onChange`)             | `Select` (`options`, **`onValueChange`**)                                                                                 | Generic `<T extends string>`; `readonly T[]` or `readonly {value,label}[]`         |
| `components/forms` `Input` (`value`, `onChange`)                | `TextInput` (`value`, **`onValueChange`**)                                                                                | `(value: string) => void`                                                          |
| `components/forms` `Textarea` (`value`, `onChange`)             | `TextArea` (`value`, **`onValueChange`**, `rows`)                                                                         |                                                                                    |
| `components/forms` `Slider` (`value`, `onChange`, min/max/step) | `Slider` (`value`, **`onValueChange`**, `label`, min/max/step)                                                            | Target renders its own value — drop `FieldRow label="div: X"`                      |
| `components/forms` `Button`                                     | `Button`                                                                                                                  | `type="button"` default; `family`, `disabled`, `loading`                           |
| `components/forms` `ControlGrid` (`columns`)                    | none → local `stylex.create` grid                                                                                         | pattern: `MosaicControlsPanel` `styles.actions` (`grid` + `space["2"]`)            |
| `components/display` `ErrorBoundary`                            | `ErrorBoundary` (**new, in `@repo/ui`**)                                                                                  | class; `fallback`, `onError`, `showStack` (gate on `import.meta.env.DEV`), `style` |
| `theme` + tailwind (`global.css`)                               | dropped — keep minimal `src/style.css`                                                                                    |                                                                                    |

## 7. Store plan (repo pattern)

Source uses `createStore` (vanilla) + custom `useStore` hooks. Target:

```ts
// store.ts
import { create } from "zustand";
export const uiStore = create<UiState>(() => ({ inputMode: "spirale" }));

// selectors.ts
export function useInputMode() {
  return uiStore((s) => s.inputMode);
}

// actions.ts
export function setInputMode(mode: InputMode) {
  uiStore.setState({ inputMode: mode });
}
```

Per module:

- `atlas` — already split `store/{store,actions,selectors,types}.ts` → convert to `create` + named functions, keep split.
- `seed`, `manual`, `spirale` — single-file `store.ts` today → convert to `create`; a single readable file is fine (coding-conventions § 2.5); split only if it grows.
- `spirale` clock store — keep wiring: default `createNullClockStore()`, `onClockStore={setClockStore}`, `useSyncExternalStore` for play state, `useClockStore`/`useHasClockStore` (null-store sentinel). API matches glaze.
- `stores/ui` — convert to repo pattern; **fix typo** `setInpuMode` → `setInputMode`.
- `stores/appStore.tsx` (skeleton `theme` store) — unused after migration; recommendation: delete (see `DECISIONS.md` D8).

Style details for controls (from existing `@repo/ui` usage):

- `MosaicControlsPanel` is the copied pattern: `ControlSection` sections, `Slider label min max step value onValueChange`, `Button family`, local grid for button groups, tokens imported from `@repo/ui/tokens/*.stylex`.
- `Segmented<T>` exists for binary/mode picks (`apps/dev` uses it for theme/view).

## 8. Migration plan

### Step 1 — baseline (next)

- `vp -C packages/art-canvas check --fix` (formats the 53 copied files).
- Convert `src/stores/ui/store.ts` to the repo pattern (§ 7) + rename `setInputMode`.
- `vp -C packages/art-canvas check` → capture the exact tlc import sites (should be
  only `*Controls.tsx` ×4 + nothing else).

### Step 2 — infra (format-only)

- `assembly/*`, `palettes/*`, `shaders/**`, module canvases + materials, GLSL.
- Sanity type-check from `folded-space` (no controls, no store) once formatted.

### Step 3 — controls + stores + App (order: spirale → seed → atlas → manual)

For each module: apply § 6 mapping to `*Controls.tsx`, convert its store (§ 7), then
mount in `App.tsx`:

```text
Mode switcher in ControlPanel (Select<InputMode> or Segmented<InputMode>) using
useInputMode / setInputMode; conditional mode === "x" && <X /> in Stage and
mode === "x" && <XControls /> inside a ControlSection title={mode}.
ErrorBoundary stays at shell level (showStack={import.meta.env.DEV}).
```

`folded-space` just gets mounted (no controls).

### Step 4 — docs & finishing

- `README.md` for the package (adapt the rich `_TMP/.../README.md`; English),
  mirroring `mosaic-maker/README.md` brevity.
- Showcase `ErrorBoundary` in `apps/dev` (component-authoring § 2) — optional.
- When the migration is committed: delete `_TMP/art-canvas-to-migrate` (keep `_TMP`
  root, it still holds mosaic-maker sources).
- Final: `vp check`, `vp run -r build`, `vp -C packages/art-canvas dev` smoke-test.

## 9. Verification commands

```text
vp -C packages/ui check               # lib green (ErrorBoundary)
vp check                              # whole-repo fmt+lint+types
vp -C packages/art-canvas check       # app check (red until Step 3)
vp -C packages/art-canvas build       # tsc -b && vp build
vp -C packages/art-canvas dev         # dev server — shaders compile & render
curl localhost:<port>/stylex.css      # UI contract (ui-setup.md § 5)
```

Known-red until Step 3: 53 unformatted files + `@repo/tlc` imports in the 4 controls.

## 10. Git workflow

- Current uncommitted: `packages/ui/src/components/ErrorBoundary.tsx`,
  `packages/art-canvas/src/App.tsx`, copied dirs, `codex/art-canvas/`.
- Suggested commits: `ui: add ErrorBoundary` → `art-canvas: copy sources from _TMP`
  → one commit per module (Step 3) → `art-canvas: wire mode switcher + shell` →
  `docs: art-canvas migration memory` (or split). Never commit `_TMP/`.

## 11. Open questions

Live in `DECISIONS.md` (D8–D11). Summaries: appStore removal (D8), mode-switcher
widget (D9), guilloche out of scope (D10), ErrorBoundary showcase (D11).
