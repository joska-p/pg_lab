# Glaze — Decisions Log (append-only)

> Format: `D#` — date — status (decided / delegated / open / closed) — decision —
> rationale. Append at the bottom; never rewrite history.

## Recorded 2026-09-19

- **D1 — decided** — No barrel file. `src/index.ts` forbidden; plain modules with
  direct deep imports. Rationale: treeshaking; per-module `exports` to come later.
- **D2 — decided** — `exports` added to `package.json` **only after** the reorg,
  progressively per-file. Rationale: monorepo-only, no consumers waiting; doing it
  after gives accurate module boundaries.
- **D3 — decided** — Scope is **cleanup/reorg**, not API hygiene. Rationale:
  monorepo-only, zero consumers (`@repo/glaze` referenced nowhere else in the repo).
  Consequences: sealing is light (Step 4), no migration paths needed.
- **D4 — decided** — `rectangle` vocabulary, object-only call form.
  - World shape: `Rectangle { x, y, width, height }` in `core/shapes.ts`
    (replaces `cpu/shapes/types.ts:5` `Rect{x,y,w,h}`); method `rect(...)` → `rectangle(...)`.
  - DOM viewport: `core/types.ts:377` `Rect{left,top,width,height}` → `ViewBounds`
    (matches `getBoundingClientRect` vocabulary).
  - Single canonical form `rectangle(rectangle: Rectangle, style?: DrawStyle)`;
    drop positional overloads. If needed later: factory `rectangleFrom(x,y,width,height)`
    in `core/shapes.ts`, not overloads. Same object-only rule for `circle`/`line`/`text`/`path`.
- **D5 — decided** — Shared shape types → `core/shapes.ts` (no barrel, plain module +
  direct `exports` entry).
- **D6 — decided** — Composition principle: `CpuSurface`/`GpuSurface` compose from
  `core/` primitives (camera, clock, frameloop, input, shapes). **No god-surface**,
  no shared draw base, no merged Cpu/Gpu class. Max 2 surface types; one-off
  duplication preferred over premature abstraction when simpler/readable.
- **D7 — delegated to agent** — Raw `gl`/`canvas`/`context` exposure: strict-by-default
  (private/opaque, read-only views where needed). Rationale: zero consumers,
  no escape hatch required yet; documented escape hatch only if a real need appears.
- **D8 — delegated to agent** — `UniformValue` / raw `WebGLTexture`:
  `TextureHandle` opaque, no raw `WebGLTexture` in v1. Rationale: zero consumers,
  no migration needed.
- **D9 — decided** — Old tests deleted (2026-09-19); tests are reintroduced
  **per module during the reorg** (defect fixes + moved/changed modules), not in a
  separate test phase.
- **D10 — decided** — Per-package docs live in `codex/glaze/`
  (STATUS/AUDIT/DECISIONS/SESSIONS). Old single working doc retired.
- **D11 — decided** — Roadmap order: baseline (`vp check`) → defects A/B/F (with tests)
  → structural reorg → light sealing → exports last. Rationale: reorg gives the
  accurate module boundaries that make exports trivial; bugs first for value.

- **D12 — decided** — Unrecognized colors **throw** (`parseColor`); the stale docstring
  ("resolve to magenta") was fixed to match. Rationale: fail-loud beats a silent magenta
  typo render in a toolkit; zero consumers, no migration.
- **D13 — decided** — HSL `s`/`l` unitless values are treated as percentages (/100, legacy
  CSS syntax), never as 0..255 channels. Rationale: fixes the ÷255 bug where
  `hsl(120, 100, 50)` rendered near-black instead of green.

## Recorded 2026-09-19 (Step 3 — structural reorg)

- **D14 — decided** — `core/types.ts` god-file split into focused modules, one domain each:
  `brands` (Brand + asserts), `time` (Seconds/Milliseconds/Duration/TimeSpeed),
  `render` (CssColor/PositiveNumber/FontSize/CanvasDimension/BufferDimension/
  DevicePixelRatio/StateData), `geometry` (Point2D/Screen/World + NormalizedVec2/
  LineSegment), `cameraTypes` (ZoomFactor/ZoomBounds/ZoomClamp/CameraPatch/
  CameraControls), `clockTypes`, `frameTypes`, `inputTypes` (`Rect` → `ViewBounds`),
  `gestureTypes` (WheelSpeed + gestures), plus `shapes` (D4/D5) and `surfaceTypes`
  (D16). Old `core/types.ts` deleted; no re-export shim (no-barrel rule, D1).
  Rationale: imports name the domain they use; split follows existing class
  boundaries (Camera/Clock/FrameLoop/InputStore/gestures).
- **D15 — decided** — Object-only draw API, concrete form: `rectangle(rectangle:
Rectangle, style?)`, `circle(circle: Circle, style?)` with `Circle { center:
Point2D; radius: number }`, `line(segment: Segment, style?)` with `Segment { a;
b }`, `text(content, position: Point2D, style?)`, `path(points, style?, options?)`.
  Factories `rectangleFrom`/`circleFrom`/`segmentFrom` in `core/shapes.ts` (D4).
  Geometry params are plain `number` (PositiveNumber brand dropped at the draw
  boundary — it was bypassable per defect C); style brands (`lineWidth`,
  `fontSize`) kept. `ShapeBatcher` mirrors the vocabulary (`drawRectangle`,
  `drawCircle(Circle)`, `drawLine(Segment)`). Rationale: single canonical form per
  D4; plain geometry avoids brand friction with zero consumers to migrate.
- **D16 — decided** — Surface configs deduped via shared bases: `SurfaceBaseConfig
{ camera?, dpr? }` + `GpuClockMixin { clock?, clockOptions? }` in
  `core/surfaceTypes.ts` (`CpuSurfaceConfig`/`GpuSurfaceConfig` extend them);
  `SurfaceOptionsBase { camera?, cameraControls?, initialCamera?, dpr? }` in
  `react/types.ts` (`CpuSurfaceOptions`/`GpuSurfaceOptions` extend it).
  Rationale: one place for the shared camera/dpr/clock overlap flagged in
  AUDIT §3.4; React stack extras stay in the React layer (D6 composition).
- **D17 — decided** — React internals moved to `react/stackTypes.ts` next to
  `surfaceStack.ts`: `StackDisposable`, `InitialCamera`, `CpuStack`, `GpuStack`,
  `RoutableSurface`. `react/types.ts` keeps public surface: stores, interactions,
  `CpuSurfaceOptions`/`GpuSurfaceOptions`, canvas props. Rationale: AUDIT §3.5 —
  stack lifetime types no longer sit next to public props.

## Recorded 2026-09-19 (Step 4 — light sealing)

- **D18 — decided** — Sealing stays trivial/local: new `core/environment.ts` shell
  injector only (`defaultGetDevicePixelRatio`/`resolveDevicePixelRatio` with
  explicit-wins + fallback-to-1, `createDocumentCanvas` null-without-document);
  `frameLoopOptions?: FrameLoopOptions` added to `SurfaceBaseConfig` +
  `SurfaceOptionsBase` and forwarded through stacks (`compact`) into `FrameLoop`
  (defaults preserve the rAF chain); `GpuSurface.gl` → `#gl`,
  `CpuSurface.context` → `#context` (zero external uses verified by grep, internal
  `ShapeBatcher.#gl` unchanged via constructor param); `TextRasterizer` keeps its
  throw on null canvas, `color.parseViaCanvas` keeps its null→throw contract —
  both share the single document site. Rationale: kills the schedule/dpr SSR
  variance without touching loop dispatch or GL state; per-module test
  `core/environment.test.ts` (6 tests) covers resolver + injection plumbing.
- **D19 — decided (owner rename)** — `router` → `inputRouter` (`react/stackTypes.ts`
  `CpuStack`/`GpuStack`, `surfaceStack.ts` `createRouter` → `createInputRouter`).
  Rationale: names the concept (gesture/input routing), not the mechanism.
- **D20 — decided (owner rename)** — `controls` → `cameraControls`
  (`react/stackTypes.ts` `CpuStack`/`GpuStack`, `surfaceStack.ts`
  `resolveCameraLayer` result + resolved locals). Rationale: consistent with the
  `cameraControls` option/input vocabulary; no external consumers, stack-local.

## Recorded 2026-09-19 (Step 5 — exports)

- **D21 — decided** — Explicit per-file `exports` in `package.json` (42 entries,
  one per non-test source module, key without extension, `types`+`import` → same
  source file, `.tsx` kept for `CpuCanvas`/`GpuCanvas`); no root `.` entry
  (no-barrel, D1), no `*.test.ts` exposed. Rationale: owner chose explicit over
  wildcards; exact coverage verified (42/42, no missing/extra).

## Open questions

- **Q-SSR — closed 2026-09-19 (Step 4)** — `window`/`document` hard deps removed
  from the creation path: `surfaceStack` no longer reads `window.devicePixelRatio`
  directly, `TextRasterizer`/`color` share the guarded `createDocumentCanvas()`,
  `FrameLoop` `now`/`schedule` injectable end-to-end. Remaining `window` reads live
  only inside `defaultGetDevicePixelRatio` (guarded) and `InputStore.domEventSource`
  (attach-time, requires DOM by construction) — accepted.
- **Q-defects — closed for A/B/F (2026-09-19)** — A (hidpi), B (context-restore), F (HSL)
  confirmed as real bugs and fixed in Step 2 (see `SESSIONS.md`); C/D/E remain design
  decisions for Step 3/4.
