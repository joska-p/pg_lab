# Findings — branded types audit (glaze → randomart)

Status: **observations only — no code was changed.** Written 2026-10-16 during the session that
studied how `@repo/glaze` guarantees values with branded types and assessed whether the same
system applies to `@repo/randomart`.

Purpose: record every incoherence, smell and odd pattern noticed along the way, so a follow-up
session can implement without re-exploring. IDs (`F01`…) are stable: cite them in commits, tests
and new findings.

Language: English, per AGENTS.md ("English for code, docs, and specs").

---

## 1. The reference pattern (glaze)

| Piece                                       | Where                                                                       | What it does                                                                                                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Brand<T, B> = T & { readonly __brand: B }` | `glaze/src/core/brands.ts`                                                  | Nominal typing via string literal.                                                                                                                           |
| `assertFinite`, `assertStrictlyPositive`    | same file                                                                   | Shared validation helpers, every message prefixed `Glaze:`.                                                                                                  |
| Per-domain brands + `create*` factories     | `core/render.ts`, `core/time.ts`, `core/geometry.ts`, `core/cameraTypes.ts` | Validate → `return value as Brand`.                                                                                                                          |
| Refinement instead of stacking              | `core/time.ts:12`                                                           | `NonNegativeSeconds = Seconds & { readonly __nonNegative: true }` — two brands on the same `__brand` key would intersect to `never` (documented in-code).    |
| Capability token                            | `core/frameTypes.ts:3`                                                      | `FrameToken` via `declare const unique symbol` — proof a frame is being dispatched.                                                                          |
| Boundary adapter (clamp-then-brand)         | `core/cameraTypes.ts:36`                                                    | `ZoomClamp = (value: number) => ZoomFactor`; `CameraPatch` accepts raw numbers but routes them through the clamp, so no path injects an out-of-bounds value. |
| Branded struct                              | `core/geometry.ts`                                                          | `ScreenPoint`, `WorldPoint`, `NormalizedVec2`… same input shape, different meaning → brand distinguishes them.                                               |

Reusable exports for randomart (already a `workspace:*` dependency, exports map verified):
`@repo/glaze/core/render` → `CanvasDimension`, `DevicePixelRatio`, `createCanvasDimension`,
`createDevicePixelRatio`; `@repo/glaze/core/time` → `DurationSeconds` + friends (already used by
randomart in `renderer/contract.ts` and `stores/appStore.tsx`).

## 2. What randomart already has

- Its own `Brand` + `assertFinite` copy in `src/core/shared/index.ts` (no `assertStrictlyPositive`).
- Branded types with validating constructors: `Seed` (`createSeed`: integer in `[0, 2³²-1]`),
  `Node` / `Expression` (`createNode`: arity, param count, param range vs catalog),
  `Grammar` (`createGrammar`: 7 validation rules), `Artwork` (`createArtwork`).
- `parseDurationInput` (appStore:508) already implements clamp-then-brand on glaze's
  `DurationSeconds` — the ZoomClamp pattern exists in mini form.
- `fitConstraints` is conceptually the `ZoomClamp` analog for grammar constraints (but returns a
  plain type, see F11).

**Honest assessment:** the "an invalid X cannot exist, X is only reachable through its `create*`"
discipline is already in place for the big aggregates. The real gaps are (a) invariants carried by
_functions returning primitives_ (`calculatePhase`), (b) guarantees silently widened away at
boundaries (`RenderKey.dpr`), and (c) types used as **both** raw input and validated output.

---

## 3. Findings

### A. Type guarantees and boundary lies

| ID  | Where                                                                       | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F06 | `src/renderer/renderGate.ts:2-11`                                           | `RenderKey.phase/width/height/dpr` are raw `number`. The phase invariant ("Normalized loop phase in [0, 1)") exists only in a doc comment.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| F07 | `src/renderer/RandomArtCanvas.tsx:81`                                       | `RenderKey.dpr: number` **de-brands** `surface.dpr`, which is already `DevicePixelRatio` (`glaze/src/gpu/GpuSurface.ts:44`). An upstream guarantee is thrown away at the boundary — the exact opposite of the glaze system.                                                                                                                                                                                                                                                                                                                                                                                    |
| F08 | `src/renderer/contract.ts:29-33`                                            | `calculatePhase(progress: number): number` guarantees `[0, 1)` by implementation (wrapping + the `wrapped >= 1 ? 0 : wrapped` guard) but the signature cannot say it. Prime candidate for `Phase` brand + `createPhase`.                                                                                                                                                                                                                                                                                                                                                                                       |
| F09 | `glaze/src/gpu/GpuSurface.ts:42-43, 342-343`                                | `surface.width/height` are plain mutable `number` initialised to `0`, assigned only inside `#frameStep` (after `#resize()`). They are `0` between construction and the first frame; eager readers (`onMount`, effects) can see `0`, contradicting glaze's own `CanvasDimension >= 1`. Two sources of truth: `width/height` vs `#cssWidth/#cssHeight` (the latter is correct from the constructor on).                                                                                                                                                                                                          |
| F10 | `src/core/grammar/types.ts`, `src/core/artwork/serialize.ts:27, 101-105`    | `Constraints` is a plain interface used as **both** raw input and validated output. `deserializeGrammar` types raw JSON numbers as `Constraints` _before_ `createGrammar` validates them — the type claims a guarantee it does not yet have. Same shape of problem in `GrammarData.constraints`.                                                                                                                                                                                                                                                                                                               |
| F11 | `src/core/grammar/grammar.ts:45-72`                                         | `fitConstraints` contract is "always returns constraints that pass `createGrammar`" — but it returns a plain `Constraints`. The contract is only proven by a fuzz test (`fitConstraints.test.ts:67-87`), never expressed in a type. It is the direct analog of `ZoomClamp`.                                                                                                                                                                                                                                                                                                                                    |
| F13 | `src/core/artwork/types.ts:7-11`, `create.ts:27-43`, `serialize.ts:214-234` | `RenderSettings` carries `// integer, 1..MAX_RENDER_SIZE` comments instead of types, and doubles as raw input (`ArtworkInput.render?: Partial<RenderSettings>`) and validated output. Worst spot: `serialize.ts readRender` returns `RenderSettings` from **unvalidated casts** (`data.width as number`, only a `typeof` check) — a type lie; validation is deferred to `createArtwork`. Nuance: because `Artwork` is branded and is the only carrier of a `RenderSettings`, the invariant is already _transitively_ guaranteed — the defect is the input/output type conflation, not a missing runtime check. |
| F14 | `expression/expression.ts:45-61`, `artwork/create.ts:52-54`                 | `createExpression` / `createArtwork` "validate" a brand by duck-typing (`typeof r?.operatorName !== 'string'`). The brand means "built by `createNode`"; the guard checks one field (`params`, `inputs` unchecked) and cannot verify it. Contrast: `createNode` validates against the catalog.                                                                                                                                                                                                                                                                                                                 |
| F15 | `expression/expression.ts:63-72`                                            | `nodeCount` discriminates the `Node \| Expression` union by object shape (`'r' in target && 'g' in target && 'b' in target`), not by brand.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| F02 | `glaze/src/core/brands.ts:1`, `randomart/src/core/shared/index.ts:1`        | Both packages define `Brand` as `T & { readonly __brand: B }`. TypeScript is structural: brands are distinguished **only by their string literal**, not by origin. A `Brand<number, 'Phase'>` declared in randomart is mutually assignable with one declared in glaze. Duplicating `Brand` gives no cross-package isolation (F01 makes the duplication likely to drift).                                                                                                                                                                                                                                       |

### B. Duplication

| ID  | Where                                                                                                  | Finding                                                                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 | `glaze/src/core/brands.ts` vs `randomart/src/core/shared/index.ts`                                     | Near-copy of the same module; randomart's copy lacks `assertStrictlyPositive`. Drift already happened. randomart depends on `@repo/glaze`, so one of the two should be the single source.               |
| F04 | `artwork/create.ts:14-24`, `random/seed.ts:11-18`, `random/rng.ts:22-27`, `grammar/grammar.ts:120-142` | Four hand-rolled variants of "integer, in range" validation with four different messages. No shared `assertInteger`.                                                                                    |
| F16 | `expression/expression.ts:35`, `generator/generator.ts:60`, `expression/key.ts:5`                      | `-0 → 0` normalisation implemented three times, three slightly different spellings. One helper should own it (it matters for determinism: `formatNumber`, node keys, PRNG inputs).                      |
| F25 | `glaze/src/core/render.ts:12-18, 56-62`                                                                | `createCanvasDimension` and `createBufferDimension` are byte-identical implementations; likewise `createPositiveNumber` / `createFontSize` (44-48, 50-54). Two brand names, one shared assert would do. |

### C. Messages, labels, style

| ID  | Where                                                        | Finding                                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F03 | everywhere                                                   | Prefix policy inconsistent: glaze prefixes **every** message `Glaze:`; randomart has no prefix and mixes heads anyway (`Generator error:…`, `weighted:…`, `Seed must be…`, `render.loopMs must be…`). No rule written down. |
| F05 | assert call sites                                            | Labels are ad-hoc: `'Seed'`, `'val'`, `'maxExclusive'`, `` `weight of item at index ${i}` ``. No convention for "label = field path" vs "label = concept".                                                                  |
| F30 | seed.ts, expression/_, artwork/_ vs grammar.ts, generator.ts | Module specifier style mixed inside one package: `../shared/index.ts` (with extension) in some folders, `../shared` (extensionless) in others; tests import `./grammar.ts` vs `./index.ts` vs `./types.ts`.                 |

### D. Behavioural oddities

| ID   | Where                                                      | Finding                                                                                                                                                                                                                                                                                                                                                     |
| ---- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F12  | `grammar/grammar.ts:49-50`, `fitConstraints.test.ts:57-65` | `clampInt` silently coerces non-finite input to `min`: `maxDepth: NaN → 1`. Neither an error nor a sensible default (`8` would be); the only documentation is a test named "survives non-finite input". Silent semantic change on garbage input.                                                                                                            |
| F17  | `random/rng.ts:31-63`                                      | `weighted` invokes `weightOf` **twice** per item (validation+total pass at :38, accumulation pass at :56). The second pass is unvalidated; an impure/expensive callback breaks total-vs-accumulation consistency and silently falls through to `items[last]`. Determinism survives only while `weightOf` is stable — undocumented precondition of the API.  |
| F18  | `random/rng.ts:21-29`                                      | `int(maxExclusive)` re-validates its argument on every draw, inline, with a message style (`maxExclusive must be an integer > 0`) unrelated to the shared helpers.                                                                                                                                                                                          |
| F19  | `stores/appStore.tsx:507-513` vs `artwork/types.ts:39-40`  | **Two bounds for one concept**: UI duration clamps to `[1, 60]` s (fallback 8), while an artwork accepts `loopMs ∈ [500, 120000]` = `[0.5, 120]` s. The UI cannot represent 0.5 s or anything above 60 s.                                                                                                                                                   |
| F20  | `appStore.tsx:423-427, 461`                                | Loop duration is **lossy on import**: the file's `loopMs` is applied only when `round(loopMs/1000) ∈ [1, 60]`, i.e. silently ignored for `loopMs ≥ 60500`. A valid foreign `.randomart.json` with `loopMs = 120000` keeps the current duration with no signal. Export never produces > 60000, so the asymmetry is invisible in round-trips within this app. |
| F21  | `components/Controls.tsx:144, 155, 166`                    | UI pre-validates `Number.isFinite(value) ? value : 1` three times, then `setConstraints` runs `fitConstraints` anyway. Double validation, and the `1` fallback can silently change semantics (e.g. `maxDepth` collapsing to 1).                                                                                                                             |
| F22  | `stores/appStore.tsx:301-320`                              | One domain rule is split across layers: "raising `minDepth` past `maxDepth` drags `maxDepth` along" lives in the **store**, the opposite direction lives in `fitConstraints` (core). A core invariant enforced from the UI layer.                                                                                                                           |
| F09b | `RandomArtCanvas.tsx:74, 78`                               | `calculatePhase(surface.clock.progress)` is computed twice per frame (`uniforms` callback and `shouldRender` callback). Same tick, same value today — but two call sites that must stay in sync; also per-frame path, so a throw here would spam every frame.                                                                                               |

### E. Doc ↔ code incoherences

| ID  | Where                                                               | Finding                                                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F29 | `docs/README.md:32` vs `random/seed.ts:22-30`                       | README states "le cœur n'appelle jamais `Math.random` (D19)", but `randomSeed()` is **defined in core** and falls back to `Math.random()` when `crypto.getRandomValues` is missing. Only the _call site_ is UI-side; the claim as written is false. |
| F28 | `packages/randomart/docs/*.md`                                      | All existing randomart docs (README, revue, specs) are French while AGENTS.md prescribes "English for code, docs, and specs". Unresolved; `findings.md` deliberately follows AGENTS.md (English). Decision needed on which rule wins for docs.      |
| F27 | `glaze/src/react/GpuCanvas.tsx` (~96-97, 140-156, 164-165, 186-187) | Comments in French inside glaze code, rest of glaze is English. Violates AGENTS.md "English for code".                                                                                                                                              |
| F24 | `renderer/contract.ts:43-63`                                        | `validateShaderContract` matches exact substrings (`includes('in vec2 vUv;')`): whitespace/comment variants pass or fail arbitrarily, and the error text says "at beginning of main" while the check accepts the string **anywhere** in the file.   |
| F23 | `renderer/RandomArtCanvas.tsx:44`, `contract.ts:72`                 | `HANDWRITTEN_TEST_SHADER` — named and documented as a test fixture — is the **default** value of the production `fragmentShader` prop. Test artifact doubles as product default.                                                                    |
| F26 | `glaze/src/core/Clock.ts:115-121`                                   | `Clock.progress` returns a raw `number` over `[0, 1]` **inclusive of 1.0**; `calculatePhase` compensates. glaze itself lacks a `Progress`/`Phase` brand — the gap is upstream too.                                                                  |

### F. Not a defect, but worth knowing

- `export * from './shared/index.ts'` in `src/core/index.ts` puts `Brand` and `assertFinite` on
  randomart's public surface.
- `createGrammar` re-validates all 7 rules on every randomization/edit (`randomize.ts:219`,
  `setConstraints`) — cheap, and it means the brand is re-checked at every entry.
- `FrameLoop` re-schedules **before** dispatch (`glaze/src/core/FrameLoop.ts:110`): a throwing
  subscriber cannot kill the animation chain, but it will throw once per frame (relevant if a
  `createPhase` ever throws in `shouldRender`).

---

## 4. Direction agreed before the session was closed

User gave the green light ("c'est parti, tu as le feu vert"), then directed that **existing tests
are not a constraint — they will be rewritten** ("le but c'est pas de réessayer les tests. on les
réécrira"). So: design the system cleanly, then update tests to match; do not shape types around
existing assertions.

- **Phase 1** — centralise helpers in `src/core/shared/index.ts` (`assertStrictlyPositive`,
  `assertInteger`/`assertIntegerInRange`, one message convention — decide the prefix, F03);
  introduce `Phase` on `calculatePhase` (F08); type `RenderKey` with glaze's `CanvasDimension` /
  `DevicePixelRatio` instead of `number` (F06, F07).
- **Phase 2** — split raw-input types from validated types for `Constraints` (F10, F11) and
  `RenderSettings` (F13). Open design question: brand the struct (`Brand<{…}, 'Constraints'>` +
  a raw `*Input` type, mirroring `Grammar`) versus only introducing the input/output type split.
  `fitConstraints` should return whatever "validated" means here — that is the `ZoomClamp` slot.

Not in scope (decided): branding `rng.int`'s argument, `Channel`, `Address`, and other internal
one-shot values — ceremony without a boundary problem (checklist §14: "branded types … because
they solve a real boundary problem").

## 5. Traps for the implementer

1. `surface.width/height` are `0` until the first `#frameStep` (F09). `shouldRender` runs from
   inside `#frameStep` **after** the assignment (`GpuSurface.ts:342-346`), so
   `createCanvasDimension(surface.width)` is safe _there_ — but not in `onMount` or any eager read.
   If width/height get branded, guard explicitly (`Math.max(1, …)`) or keep raw + comment.
2. `Clock.progress` is `[0, 1]` **inclusive** (F26): `createPhase` must accept-and-normalise
   `1.0 → 0` the way `calculatePhase` does today, or keep wrapping inside `calculatePhase`.
3. Nothing may throw per frame without a decision: `shouldRender`/`uniforms` run every frame (F09b).
4. Cross-package brand assignability (F02): pick brand literals deliberately, ideally unique per
   concept across glaze+randomart.
5. If `Constraints`/`RenderSettings` become branded, every **input** site must switch to a raw
   type: `createGrammar` callers (grammar.test, generator.test, describe.test, randomize.ts:219,
   serialize.ts:101, appStore:315), `ArtworkInput.render`, `deserializeGrammar`, `readRender`.
   `Partial<Branded>` does not work — that is why a separate raw type is needed.

## 6. Key file map

- glaze: `src/core/{brands,render,time,geometry,cameraTypes,frameTypes,Clock,FrameLoop}.ts`,
  `src/gpu/GpuSurface.ts`, `src/react/GpuCanvas.tsx`.
- randomart: `src/core/shared/index.ts`, `src/renderer/{contract,renderGate,RandomArtCanvas}`,
  `src/core/grammar/{types,grammar}.ts`, `src/core/artwork/{types,create,serialize}.ts`,
  `src/stores/appStore.tsx` (`setConstraints`, `parseDurationInput`, `import/exportArtworkFile`),
  `src/components/Controls.tsx`.
- Conventions: `codex/docs/conventions/README.md` → §14 (checklist: branded types must solve a
  real boundary problem), §2.2/§2.3 (helper extraction, one abstraction level).
- Verification: `vp check --fix` (root), `vp -C packages/randomart test`.

---

## 7. Implementation record (2026-10-16, coded in the same session)

Phase 1 and Phase 2 are implemented. Decisions taken where findings left them open:

- **F03 — prefix convention: `Randomart:`.** Every validation message thrown from randomart's
  asserts and `create*` factories is prefixed `Randomart:` (mirroring glaze's `Glaze:`), applied in
  `shared`, `random/*`, `grammar/*`, `artwork/create.ts` and `renderer/contract.ts`.
  Note: file-format guards in `artwork/serialize.ts` keep their `${path}: …` shape on purpose (the
  path is the prefix that matters there); expression, catalog, compiler and generator internals are
  still unprefixed — normalizing them is a cheap follow-up if we want the policy to be
  package-wide.
- **F05 — label convention: dotted field path.** Labels are field paths (`render.loopMs`,
  `constraints.minDepth`, `clock progress`), with `… at index ${i}` for unnamed list items.
- **F01/F02 — `Brand` single source.** randomart no longer declares its own `Brand`: it re-exports
  glaze's from `src/core/shared/index.ts`. Asserts stay per-package (their messages differ by
  design). Brand literals are owned per concept across both packages — new literals from this
  session: `Phase`, `Constraints`, `RenderSettings`; no literal exists in glaze and randomart at
  once. The registry is documented in the header of `src/core/shared/index.ts`.
- **F04 — `assertInteger`/`assertIntegerInRange`** centralized in shared; `seed.ts`,
  `artwork/create.ts` and `rng.int` now use them.
- **F08 — `Phase` brand + `createPhase`.** `calculatePhase` was renamed `createPhase` (factory
  convention), now returns `Phase = Brand<number, 'Phase'>` and rejects non-finite progress (F08).
  The `[0, 1] → [0, 1)` boundary fold stays inside it (F26 trap).
- **F06/F07 — `RenderKey` is fully branded**: `phase: Phase`, `width/height: CanvasDimension`,
  `dpr: DevicePixelRatio`. In `RandomArtCanvas`'s `shouldRender` the dimensions go through
  `createCanvasDimension` — safe only inside the frame (glaze's `#resize()` runs first and clamps
  to ≥ 1), never in eager paths (F09). `surface.dpr` is carried un-de-branded.
- **F10/F11 — `Constraints` is now `Brand<ConstraintsInput, 'Constraints'>`.** `createConstraints`
  owns the shape rules (former grammar rules 4+6); `createGrammar` takes `ConstraintsInput` and
  calls it (vocabulary rules and feasibility stay grammar-level); `fitConstraints` is the
  `ZoomClamp` slot: raw in, validated brand out, proven at runtime by ending on `createConstraints`
  (design decision: branded struct, not a mere input/output split).
- **F13 — `RenderSettings` is now `Brand<RenderSettingsInput, 'RenderSettings'>`,** produced by
  `createRenderSettings` (ex-`readRender`, now public). `ArtworkInput.render` and the file
  serialization (`readRender`, `ArtworkData.render`, `GrammarData.constraints`,
  `deserializeGrammar`) speak raw input types; validation happens once, in the factories.
- Tests were rewritten, not patched (`shared`, `random`, `renderGate`, `renderer`, `grammar`,
  `fitConstraints`, `artwork`): factories and prefixed messages are asserted directly.

Not done on purpose (kept out of scope, see §4): F12 (`fitConstraints` NaN → min semantics), F16
(`-0 → 0` normalization sites), F17/F18 (`rng.weighted` double pass, `int`'s inline validation
kept — it now uses the shared helpers but stays unbranded), F19–F22 (UI bounds and store split),
F14/F15 (brand duck-typing in `createExpression`/`createArtwork`/`nodeCount`).

---

## 8. Throw-vs-repair policy (2026-10-16, coded in the same session)

Directive: audit every `create*` factory and entry point; classify each site **throw or repair**;
write the justification in the site comment, never in a separate design doc (doc dissolution —
`findings.md` is the last exception). The decision framework, now stated in the header of
`src/core/shared/index.ts`:

- **Identity / content / structure / type → repair would invent data → throw.** No canonical
  repair exists for "which terminal to switch back on", "which operator a mistyped name maps to",
  "which artwork a clamped seed replays".
- **Editing quantities with an order (bounds, `minDepth ≤ maxDepth`) → canonical repair exists →
  repair, never throw.** Untrusted sources (UI fields, JSON files) enter only through `fit*`
  repair functions; `create*` factories keep their throws as the last detector for callers that
  vouch for their values (the glaze `createZoomBounds` / `createZoomClamp` split).
- **Non-finite quantity input (F12 resolved): garbage, not intent → concept default**, never
  "NaN → min". Constraints: `DEFAULT_CONSTRAINTS` (`defaultGrammar`'s 3/8/60, now one shared
  constant); duration: 8 s; render: 1024²/8000 ms.
- **Per frame: never throw** (F09b unchanged; `createPhase` keeps its finite assert as a
  document-signal of glaze's `Clock.progress ∈ [0, 1]` precondition).

Decisions per site (all user-confirmed):

| ID                                                                                    | Site                                             | Decision                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F12, order rule                                                                       | `createConstraints`                              | **repair factory**: clamp + round per field, non-finite → `DEFAULT_CONSTRAINTS`, `minDepth > maxDepth` clamps minDepth down ("les rendre égales", maxDepth wins — conservative canonical rule shared with `fitConstraints`).                       |
| F12                                                                                   | `fitConstraints`                                 | now rungs 2–3 on top of `createConstraints` (vocabulary yields → minDepth 1; maxNodes rises to `minSize`, then minDepth yields) — single repair ladder.                                                                                            |
| rules 5/7                                                                             | `createGrammar`                                  | **repaired by construction**: raw constraints go through `fitConstraints` (aggregate constructor = where UI/file data arrives). A grammar can no longer reject on them.                                                                            |
| rule 3 (no terminal), weights (empty, unknown operator, bounds, NaN)                  | `createGrammar`                                  | **throw kept** — content/structure; clamping garbage weights into "off"/saturate would silently rewrite the vocabulary (user chose refusal over clamp for files too).                                                                              |
| Seed                                                                                  | `createSeed`                                     | **throw kept** — identity: a clamped seed is a different artwork; provenance must not lie.                                                                                                                                                         |
| F17                                                                                   | `rng.weighted`                                   | fixed: single validated pass, accumulated pass reuses the stored weights (no more total-vs-accumulation divergence; `weightOf` called once per item).                                                                                              |
| F18, empty/zero-total                                                                 | `rng.int`, `rng.weighted`                        | **throw kept** — internal callers vouch; "no card to draw" has no honest repair.                                                                                                                                                                   |
| F13                                                                                   | `createRenderSettings` / new `fitRenderSettings` | factory keeps throws for vouched callers; `fitRenderSettings` (ZoomClamp analog, exported) clamps render quantities / defaults non-finite fields; `parseArtwork` routes files through it.                                                          |
| title                                                                                 | `createArtwork`                                  | **repair**: empty → absent, overlong → truncated to `MAX_TITLE_LENGTH` (cosmetic metadata never refuses an artwork); non-string stays throw (type error).                                                                                          |
| F21                                                                                   | `Controls` NumberFields                          | fallback `? value : 1` removed — raw value through; the store treats a non-finite edit as "not an edit" (field keeps its value).                                                                                                                   |
| F22                                                                                   | `appStore.setConstraints`                        | drag-along kept, reclassified as an **intent gesture** (understood: raising minDepth drags maxDepth); the invariant now lives once in the core repair.                                                                                             |
| F19/F20                                                                               | duration bounds                                  | **one concept, one bound set = the artwork render bounds [0.5, 120] s**: `parseDurationInput` clamps to them, `publishArtwork` adopts the file's loopMs unconditionally (the ≥ 60500 silent drop is gone), the playback `<input>` bounds come from |
| `MIN_LOOP_MS`/`MAX_LOOP_MS` (the hard-coded 16/400 constants go away in the process). |

Tests rewritten, not patched: `grammar` (repairs asserted per site: bounds, conflict "rendre
égales", NaN defaults, rules 5/7 as repairs), `fitConstraints` (NaN → concept shape), `random`
(+ weightOf-called-once), `artwork` (title repair, `fitRenderSettings`, file render clamp),
`grammar-file` (constraint repair at import, weight corruption refused). F14/F15 still out of
scope; F16 (−0) still open.
