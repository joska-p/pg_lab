[← Index](README.md)

# 2. TypeScript

## 2.1 Naming

Names should communicate the concept and intent.

A reader should usually understand what a function or value represents without reading its implementation.

Prefer:

```ts
advanceSimulation(...)
```

over:

```ts
process(...)
```

Prefer names that describe **what the value means**, not merely its implementation.

A good name reduces the amount of architecture that must exist in the reader's head.

Naming is part of the public shape of a module: a coherent vocabulary is worth more than a locally clever name. The rules below are defaults. When one makes the code harder to understand, prefer the clearer name and explain the exception where it lives.

### 2.1.1 One concept, one word

Pick the domain word once and use it everywhere: code, types, UI, tests, docs, file names.

Do not introduce a synonym for an existing concept:

```text
create / make / build / assemble   pick one per meaning (see the verb table)
draw / pick / sample / choose      draw and sample consume the PRNG; choose is a UI decision
get / read / load                  get is a pure lookup; read is a shape check; load crosses an I/O boundary
recipe / preset                    a recipe is a point in the quantized space; a preset is a named recipe
seed / baseSeed                    a seed is one image; baseSeed is the root of a sample draw
share / shareDepth                 share is the recipe choice; shareDepth is the resolved trunk depth
level / profile                    level is a point on the weight axis; profile is a point on the size axis
planche / sheet                    planche is the in-app grid; sheet is the dataset's contact sheet
```

Use the glossary in the package README as the source of truth for domain words. A new synonym is a new concept until proven otherwise.

### 2.1.2 Casing

| Kind                                                  | Convention               | Examples                                                |
| ----------------------------------------------------- | ------------------------ | ------------------------------------------------------- |
| Variables, parameters, properties, functions, methods | `camelCase`              | `shareDepth`, `drawOperator`, `renderSettings`          |
| Types, interfaces, classes, React components, brands  | `PascalCase`             | `Grammar`, `ChannelModel`, `RandomArtCanvas`, `Seed`    |
| Module-level constants, registries, config, id arrays | `SCREAMING_SNAKE_CASE`   | `MAX_DEPTH`, `DEFAULT_CHANNELS`, `CONFIG`, `FAMILY_IDS` |
| Module-level singletons and live instances            | `camelCase`              | `catalog`, `store`, `renderer`                          |
| Type parameters                                       | `PascalCase`             | `T`, `K`, `V`, `TSurface`                               |
| File names: modules                                   | `camelCase.ts`           | `randomGrammar.ts`, `appStore.ts`                       |
| File names: React components and classes              | `PascalCase.tsx` / `.ts` | `BenchPanel.tsx`, `ShaderError.ts`                      |

`SCREAMING_SNAKE_CASE` is for values fixed at module load: bounds, defaults, registries, config objects, id arrays. A local `const` stays `camelCase`. A singleton that owns state or a lifecycle (`catalog`, `store`) stays `camelCase` even when it is module-level.

No `_` prefix for private members: use module-local (non-exported) names. No `I` prefix for interfaces, no `T` prefix for types, no `Impl` suffix unless several implementations genuinely coexist.

### 2.1.3 Types and interfaces

Use `interface` for object shapes that are part of a contract or may be extended. Use `type` for unions, intersections, mapped types, tuples, function types, branded primitives, and aliases of another type.

```ts
interface Grammar { … }                 // object shape
type ColorSpaceId = 'srgb' | 'oklch';   // union
type Seed = Brand<number, 'Seed'>;       // branded primitive
type NodeVisitor = (node: Node) => void; // function type
```

Do not encode mutability or implementation in the name. `readonly` belongs in the type, not in a `ReadonlyFoo` name.

Role suffixes are part of the vocabulary:

| Suffix / prefix      | Meaning                                                               | Examples                                    |
| -------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| `*Input`             | Raw, untrusted shape accepted at a boundary, before validation/repair | `ArtworkInput`, `RenderSettingsInput`       |
| `*Data`              | Plain serializable shape (JSON-like), not a domain value              | `ArtworkData`, `GrammarData`                |
| `*Options`           | Optional arguments of one call                                        | `CompileOptions`, `SampleOptions`           |
| `*Config`            | Required construction/environment configuration                       | `GpuSurfaceConfig`                          |
| `*Settings`          | User-editable, persisted state                                        | `BenchSettings`, `RenderSettings`           |
| `*State`             | The internal state of a store                                         | `AppStoreState`, `BenchState`               |
| `*View`              | A display-oriented projection of domain data                          | `LotView`                                   |
| `*Summary`           | A derived, human-readable description                                 | `GrammarSummary`                            |
| `*Check` / `*Status` | The outcome of a check                                                | `ProvenanceCheck`                           |
| `*Model`             | A domain interpretation of several values                             | `ChannelModel`                              |
| `*Id`                | An opaque key into a registry                                         | `ColorSpaceId`, `FamilyId`, `SizeProfileId` |
| `*Entry`             | One element of a collection                                           | `HistoryEntry`                              |
| `*Cell`, `*Row`      | One part of a grid                                                    | `PlancheCell`, `PlancheRow`                 |
| `*Props`             | React component props                                                 | `RandomArtCanvasProps`                      |

Named points of an ordered axis keep the axis noun rather than `Id`: `WeightLevel`, `ShareChoice`, `BenchView`, `CellSize`. The `Id` suffix is for opaque registry keys, not for every string union.

Branded types are named after the concept they guarantee, with no suffix: `Seed`, `Grammar`, `Expression`, `Artwork`, `Constraints`, `Phase`. The raw shape is `XInput`, the throwing factory is `createX`, and the repairing entry point is `fitX` (§2.1.4). Do not brand a value merely to make a signature look precise; the brand must correspond to a boundary that actually establishes it.

### 2.1.4 Functions and prefixes

Functions are verb-first. The prefix states the contract, not just the implementation.

| Prefix                                         | Contract                                                                                    | Examples                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `createX`                                      | Establish a branded/invariant-carrying value; throws on invalid vouched input               | `createGrammar`, `createSeed`, `createArtwork`          |
| `fitX`                                         | Repair untrusted input into a valid value; clamps/defaults, no throw for editing quantities | `fitConstraints`, `fitRenderSettings`                   |
| `parseX` / `parseXFile`                        | External text (or unknown) → domain; refuses malformed structure                            | `parseArtwork`, `parseNotebook`, `parseGrammarFile`     |
| `deserializeX`                                 | Plain data object → domain; refuses malformed structure                                     | `deserializeGrammar`, `deserialize`                     |
| `serializeX`                                   | Domain → plain data object                                                                  | `serializeGrammar`                                      |
| `serializeXFile`                               | Domain → text                                                                               | `serializeGrammarFile`                                  |
| `readX`                                        | Internal field-level shape check of unknown data; not exported                              | `readChannels`, `readRender`                            |
| `assertX`                                      | Throw when an invariant does not hold; no meaningful return                                 | `assertFinite`, `assertIntegerInRange`                  |
| `checkX`                                       | Compute a status/boolean without throwing                                                   | `checkProvenance`, `checkShaderStructure`               |
| `isX` / `hasX` / `canX` / `shouldX` / `needsX` | Boolean predicate, no side effects                                                          | `isTerminalOperator`, `hasClockStore`, `needsRender`    |
| `getX`                                         | Pure lookup/read; no side effects                                                           | `getVocabulary`, `getNode`, `getIsPlaying`              |
| `xOf(y)`                                       | Pure projection/derivation (`get` would read awkwardly)                                     | `weightOf`, `recipeOf`, `presetIdOf`, `flatShareOf`     |
| `xCount` / `xLength`                           | Numeric count or length                                                                     | `nodeCount`, `sourceLength`                             |
| `setX` / `patchX` / `toggleX`                  | Replace a value / update part of it / flip a boolean                                        | `setDuration`, `patchSettings`, `toggleCandidateRating` |
| `useX`                                         | React hook; follows the Rules of Hooks                                                      | `useGrammar`, `useBenchLot`                             |
| `drawX`                                        | Consume the PRNG and return one value                                                       | `drawOperator`, `drawParams`, `drawLevel`               |
| `sampleX`                                      | Draw a point or a collection from a distribution                                            | `sampleRecipes`, `sampleGrammars`                       |
| `randomizeX`                                   | Return a randomized variant; consumes the PRNG                                              | `randomizeWeights`                                      |
| `generateX`                                    | Deterministic domain construction from its inputs; may consume the PRNG                     | `generate`                                              |
| `deriveX`                                      | Deterministic derivation from an input                                                      | `deriveSeed`                                            |
| `buildX`                                       | Assemble a domain value from parts; no I/O                                                  | `buildLotView`, `buildPreamble`                         |
| `assembleX`                                    | Combine visual parts into one composite surface                                             | `assemblePlanche`                                       |
| `computeX`                                     | Pure calculation from existing data                                                         | `computeFeatures`                                       |
| `renderX`                                      | Produce pixels or GPU output; side effects allowed                                          | `renderGrammar`                                         |
| `loadX` / `saveX`                              | Cross an I/O boundary (storage, files, assets)                                              | `loadNotebookFromDb`, `saveNotebookToDb`                |
| `initX`                                        | One-time setup with side effects                                                            | `initBenchNotebook`                                     |
| `applyX`                                       | Apply a prepared value to the current state                                                 | `applyRecipe`                                           |
| `publishX`                                     | Make a value the current app state                                                          | `publishArtwork`                                        |
| `openX`                                        | Reveal or navigate to a value                                                               | `openCellInLab`                                         |
| `selectX` / `stepX`                            | Choose the current item / move by a delta                                                   | `selectRow`, `stepCell`                                 |
| `addXToY` / `removeXFromY`                     | Collection update                                                                           | `addBatchToNotebook`, `removeBatchFromNotebook`         |
| `withX`                                        | Run a callback with a resource/context                                                      | `withDevServer`                                         |

`createX` and `fitX` are the two rungs of the throw-vs-repair policy (`shared/index.ts`): the prefix tells the caller which one they are calling. Do not use `make`, `new`, or `build` for a validating factory.

`serializeX` returns the plain data shape; `serializeXFile` returns text. A domain with only one text form may use `serializeX`/`parseX` as a symmetric pair, but it must not also export a second `serializeX` with a different return type. When both forms exist, use the four-name set: `serializeX` (data), `serializeXFile` (text), `deserializeX` (data → domain), `parseXFile` (text → domain).

Documented exceptions to verb-first naming:

- `defaultX` returns a canonical value (`defaultGrammar`);
- `randomX` returns a random scalar (`randomSeed`);
- `xOf`, `xCount`, `xLength` are projections (see table);
- React event props use `onX`, and local handlers use `handleX`.

Async functions do not take an `Async` suffix; the `Promise` return type carries that. A `*Sync` suffix is reserved for a synchronous twin that genuinely coexists with an async version.

### 2.1.5 Booleans

Predicate functions start with `is`, `has`, `can`, `should`, or `needs`. Boolean properties read as an assertion or a state, not as a bare noun:

```ts
readonly allowsAnchors: boolean; // not `anchor`
readonly enabled: boolean;
readonly animated: boolean;
readonly failed: boolean;
```

Avoid double negatives (`isNotReady`) unless the negative is the domain concept (`disabled`, `failed`). Prefer `isReady` over `!isNotReady`.

### 2.1.6 Constants, suffixes, units

Module constants use meaningful prefixes and suffixes:

| Pattern                   | Meaning                                      | Examples                                    |
| ------------------------- | -------------------------------------------- | ------------------------------------------- |
| `MAX_*` / `MIN_*`         | Domain bounds enforced by validation         | `MAX_DEPTH`, `MIN_LOOP_MS`                  |
| `DEFAULT_*`               | Fallback/default value                       | `DEFAULT_CHANNELS`, `DEFAULT_CONSTRAINTS`   |
| `EMPTY_*`                 | Identity/empty value                         | `EMPTY_LOT`                                 |
| `RAW_*`                   | Unprocessed base model                       | `RAW_CHANNELS`                              |
| `*_LIMIT`                 | Capacity or attempt cap (not a domain bound) | `HISTORY_LIMIT`                             |
| `*_VERSION`               | Format/generator version                     | `GENERATOR_VERSION`, `ARTWORK_FILE_VERSION` |
| `*_FORMAT`                | File format identifier                       | `ARTWORK_FILE_FORMAT`                       |
| `*_IDS`                   | Ids of a registry, in canonical/draw order   | `FAMILY_IDS`, `SIZE_PROFILE_IDS`            |
| `*_CHOICES`               | Allowed values of a user/recipe axis         | `SHARE_CHOICES`                             |
| `*_LEVELS` / `*_PROFILES` | Named points of an axis                      | `WEIGHT_LEVELS`, `SIZE_PROFILES`            |
| `*_REGISTRY`              | Map of implementations                       | `PREAMBLE_REGISTRY`, `SPACE_REGISTRY`       |
| `*_GLSL` / `GLSL_*`       | GLSL source or contract snippet              | `OKLCH_GLSL`, `GLSL_IN_UV`                  |
| `*_MS`                    | Raw duration in milliseconds                 | `MIN_LOOP_MS`, `MAX_LOOP_MS`                |
| `*Count`                  | Numeric count                                | `nodeCount`, `failedCount`                  |

Plural nouns name collections (`rows`, `weights`, `COLOR_SPACES`); a number is a `*Count` (`cellCount`, not `cells`). A range is a `<quantity>Range` or the quantity itself when the type is `ParamRange` (`amp`, `cycleCounts`); it is not a list.

Include a unit suffix on raw numbers when the unit is not obvious from the name or the nearby code (`loopMs`, `timeoutMs`). When the type carries the unit (`DurationSeconds`, `Milliseconds`), the name may omit it (`duration`, `timeout`).

### 2.1.7 Abbreviations and acronyms

Treat acronyms as words in `camelCase` and `PascalCase`: `Id`, `Url`, `Api`, `Glsl`, `Gpu`, `Cpu`, `Uv`, `Rgb`, `Rgba`, `Oklab`, `Oklch`, `Hsl`, `Rng`, `Pca`, `Ms`, `Db`, `Ui`. Never write `ID`, `URL`, `API`, `GLSLSource`, or `RNG` in an identifier; keep all-caps only in `SCREAMING_SNAKE_CASE` constants (`GLSL_IN_UV`, `XRAY_LUT`).

Do not invent abbreviations for local convenience. Use a full word unless the abbreviation is the public domain name or appears in the approved list above.

### 2.1.8 Domain vocabulary

These distinctions are easy to lose and expensive to rediscover:

- **grammar** — weights + constraints + channels. **vocabulary** — the operators with a positive weight.
- **seed** — one expression inside a grammar. **baseSeed** — the root of a deterministic sample draw.
- **expression** — three trees (r, g, b). **node** — a tree element. **vertex** — a compiler DAG entry.
- **recipe** — a point in the quantized space. **preset** — a named recipe. **level** / **profile** — points on the weight / size axes.
- **artwork** — expression + optional provenance + render settings. **provenance** — informative origin; the expression is the reference.
- **batch** — one drawn lot. **candidate** — one grammar with its seeds. **planche** — the grid of a lot. **sheet** — the dataset's contact sheet.
- **channel** — one scalar tree / one component of colour. **space** — how the triplet is read. **shareDepth** — how deep the channels share structure.
- **phase** — normalized loop position in `[0, 1)`. **duration** — loop length in seconds (`DurationSeconds`).

When a name could mean two of these, qualify it (`colorSpace`, `sizeProfile`, `shareDepth`) rather than relying on context.

### 2.1.9 Coherence and renames

A rename is a coherence change, not a cosmetic one:

- rename every layer in one change (core, store, component, tests, docs);
- do not keep an alias unless a migration window genuinely exists;
- update the glossary/note when the concept changes, not just the identifier;
- if two concepts are genuinely different, name the difference instead of merging the words.

Prefer an explicit, slightly longer name over a short ambiguous one. `data`, `info`, `manager`, `helper`, `util`, `common`, `base`, and `handle` are not names: they describe the absence of a concept.

### 2.1.10 Exceptions

External conventions win at their boundary:

- React: `onX` props, `handleX` handlers, `useX` hooks;
- GLSL: uniforms `u_*`, varyings/contract locals `v_*`, entry points `ra_*`;
- DOM/WebGL: `vUv`, `o_color`, `canvas`, `context`;
- external libraries: keep their names when re-exporting them.

Math-heavy local code may use short names (`x`, `y`, `r`, `g`, `b`, `k` for arity, `m` for minimum size, `u` for a uniform draw, `i`/`j` for indices). Keep the scope small enough that the meaning is obvious.

### 2.1.11 Quick reference

```text
camelCase        values, functions, properties, hooks, files
PascalCase       types, interfaces, classes, components, brands
SCREAMING_SNAKE  module constants, registries, config, id arrays

createX          establish a branded value; throws
fitX             repair untrusted input; clamps
parseX/File      text/unknown → domain; refuses
deserializeX     data → domain; refuses
serializeX       domain → data
serializeXFile   domain → text
readX            internal shape check
assertX          throw on invariant
checkX           status/boolean, no throw
is/has/can/...   predicate
getX             pure lookup
xOf/xCount       projection/count
set/patch/toggle write state
useX             React hook
draw/sample/...  consume the PRNG
build/assemble   construct / compose
load/save        I/O
```

Run through this section when a name feels "almost right": the missing word is usually the concept, the role, or the unit.

---

## 2.2 Functions

A function should represent one coherent operation.

It may contain several implementation steps when those steps form one understandable operation from the caller's point of view.

A function should generally read from top to bottom.

Extract a helper when doing so improves one of:

- readability;
- naming;
- isolation;
- reuse;
- testability;
- separation of abstraction levels (see §2.3).

Do not extract helpers merely to make functions shorter.

Avoid both extremes:

```text
one giant function containing unrelated responsibilities
```

and:

```text
one function per line of implementation
```

---

## 2.3 One level of abstraction per function

A function should operate at a single level of abstraction.

A line of code either says **what** happens (a named step of the operation) or **how** it happens (loops, arithmetic, raw API calls, string building). A function should not alternate between the two.

```text
orchestration   → reads as a sequence of named steps
implementation  → manipulates data and raw APIs
```

Mixing the levels forces the reader to keep switching between intent and mechanics, and buries the shape of the operation under its details.

**Mixed:**

```ts
function renderFrame(ctx: CanvasRenderingContext2D, simulation: Simulation) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const body of simulation.bodies) {
        ctx.beginPath();
        ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
        ctx.fillStyle = body.color;
        ctx.fill();
    }

    updateStatsPanel(simulation);
}
```

**One level:**

```ts
function renderFrame(ctx: CanvasRenderingContext2D, simulation: Simulation) {
    clearSurface(ctx);
    drawBodies(ctx, simulation.bodies);
    updateStatsPanel(simulation);
}

function drawBodies(ctx: CanvasRenderingContext2D, bodies: Iterable<Body>) {
    for (const body of bodies) {
        drawDisc(ctx, body);
    }
}
```

### How to tell

Describe each line of the function in a few words.

- If all lines have the same granularity ("clear", "draw bodies", "update stats"), the function is at one level.
- If one line says "draw the scene" and the next says "set the fill color and loop over the array", it mixes levels.

### Rules of thumb

- **Orchestrators** call named steps. They may contain simple control flow (`if`, `for`, `await`) over those steps, but not the mechanics of the steps themselves.
- **Leaf functions** are entirely low-level. That is fine: a function that is all mechanics is at one level.
- The criterion is the **level**, not the **size**. A long function that is a flat list of equivalent steps (or a table, or a `switch` over cases) is fine. A short function can still mix levels.
- Extract a helper when it separates levels. Do **not** extract a helper that sits at the same level as the code around it: that is the "one function per line" extreme from §2.2.
- When the extracted helper has no good name, that is a signal to reconsider the split, not to pick a vague name (§2.1).

This rule is the concrete form of §1.5 for functions: the identifiable problem that justifies the helper is the mixing of levels.

---

## 2.4 Dependencies

Dependencies flow in one direction:

```text
data → shared helpers → application/components
```

Lower-level code must not reach back into higher-level code.

Dependencies should be visible enough that the reader can understand where behavior comes from.

Prefer passing a dependency explicitly over obtaining it through hidden global access when the dependency is part of the core's behavior.

Keep alternative implementations of the same abstraction close enough that they remain easy to compare.

---

## 2.5 Comments

Comments explain **why**, not **what**.

If the code needs a comment to explain what it does, prefer improving the code or its naming first.

Keep comments when they explain:

- a non-obvious constraint;
- an intentional trade-off;
- a surprising implementation;
- why a seemingly simpler approach is incorrect;
- an external requirement that the code alone cannot communicate.

A comment should explain something that would otherwise be lost.

Avoid comments that merely restate the code.

---

## 2.6 Files

A single file is the default.

Split a file only when it becomes difficult to scan, understand, or modify as one coherent unit.

Do not split based on:

- line count alone;
- one-file-per-concept rules;
- anticipated future growth;
- the desire to make a directory structure look organized.

When a split becomes necessary, make the smallest useful change.

For example:

```text
store.ts
actions.ts
selectors.ts
```

is a reasonable evolution of a store that has become difficult to scan.

It is not a structure to create in advance.
