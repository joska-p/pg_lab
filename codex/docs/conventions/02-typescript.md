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
draw / sample / choose             draw and sample consume the random source; choose is a decision
get / read / load                  get is a pure lookup; read is a shape check; load crosses an I/O boundary
name / id / key                    name is human-readable; id is opaque and stable; key is a lookup field
size / length / count              size is a capacity or dimension; length is the number of items;
                                   count is a tally
settings / config / state          settings are user-editable and persisted; config is construction-time;
                                   state is the current internal value
source / input / target / output   source is where data comes from; input is what a boundary accepts;
                                   target is what is written to; output is what a boundary returns
value / item / entry               value is the data itself; item is one element of a list;
                                   entry is one element of a keyed collection
```

Each project keeps a short glossary of its own overloaded domain words, next to that project's docs. A new synonym is a new concept until proven otherwise. §2.1.8 describes what that glossary must contain.

### 2.1.2 Casing

| Kind                                                  | Convention               | Examples                                                |
| ----------------------------------------------------- | ------------------------ | ------------------------------------------------------- |
| Variables, parameters, properties, functions, methods | `camelCase`              | `userName`, `drawFrame`, `renderSettings`               |
| Types, interfaces, classes, React components, brands  | `PascalCase`             | `Document`, `UserProfile`, `MainPanel`, `UserId`        |
| Module-level constants, registries, config, id arrays | `SCREAMING_SNAKE_CASE`   | `MAX_RETRIES`, `DEFAULT_TIMEOUT`, `CONFIG`, `COLOR_IDS` |
| Module-level singletons and live instances            | `camelCase`              | `catalog`, `store`, `renderer`                          |
| Type parameters                                       | `PascalCase`             | `T`, `K`, `V`, `TSurface`                               |
| File names: modules                                   | `camelCase.ts`           | `documentParser.ts`, `appStore.ts`                      |
| File names: React components and classes              | `PascalCase.tsx` / `.ts` | `MainPanel.tsx`, `ParseError.ts`                        |

`SCREAMING_SNAKE_CASE` is for values fixed at module load: bounds, defaults, registries, config objects, id arrays. A local `const` stays `camelCase`. A singleton that owns state or a lifecycle (`catalog`, `store`) stays `camelCase` even when it is module-level.

No `_` prefix for private members: use module-local (non-exported) names. No `I` prefix for interfaces, no `T` prefix for types, no `Impl` suffix unless several implementations genuinely coexist.

### 2.1.3 Types and interfaces

Use `interface` for object shapes that are part of a contract or may be extended. Use `type` for unions, intersections, mapped types, tuples, function types, branded primitives, and aliases of another type.

```ts
interface Document { … }                  // object shape
type LayoutId = 'grid' | 'list';          // union
type UserId = Brand<number, 'UserId'>;    // branded primitive
type NodeVisitor = (node: Node) => void;  // function type
```

Do not encode mutability or implementation in the name. `readonly` belongs in the type, not in a `ReadonlyFoo` name.

Role suffixes are part of the vocabulary:

| Suffix / prefix      | Meaning                                                               | Examples                            |
| -------------------- | --------------------------------------------------------------------- | ----------------------------------- |
| `*Input`             | Raw, untrusted shape accepted at a boundary, before validation/repair | `UserInput`, `FormInput`            |
| `*Data`              | Plain serializable shape (JSON-like), not a domain value              | `DocumentData`, `UserData`          |
| `*Options`           | Optional arguments of one call                                        | `FetchOptions`, `ParseOptions`      |
| `*Config`            | Required construction/environment configuration                       | `ServerConfig`, `SurfaceConfig`     |
| `*Settings`          | User-editable, persisted state                                        | `DisplaySettings`, `EditorSettings` |
| `*State`             | The internal state of a store                                         | `AppState`, `FormState`             |
| `*View`              | A display-oriented projection of domain data                          | `OrderView`, `RowView`              |
| `*Summary`           | A derived, human-readable description                                 | `ReportSummary`                     |
| `*Check` / `*Status` | The outcome of a check                                                | `HealthCheck`, `SyncStatus`         |
| `*Model`             | A domain interpretation of several values                             | `PriceModel`, `PricingModel`        |
| `*Id`                | An opaque key into a registry                                         | `LayoutId`, `PageId`, `GroupId`     |
| `*Entry`             | One element of a collection                                           | `HistoryEntry`                      |
| `*Cell`, `*Row`      | One part of a grid                                                    | `GridCell`, `TableRow`              |
| `*Props`             | React component props                                                 | `ButtonProps`, `PanelProps`         |

Named points of an ordered axis keep the axis noun rather than `Id`: `ViewMode`, `CellSize`, `GroupKind`. The `Id` suffix is for opaque registry keys, not for every string union.

Branded types are named after the concept they guarantee, with no suffix: `Email`, `Slug`, `UserId`. The raw shape is `XInput`, the throwing factory is `createX`, and the repairing entry point is `fitX` (§2.1.4). Do not brand a value merely to make a signature look precise; the brand must correspond to a boundary that actually establishes it.

### 2.1.4 Functions and prefixes

Functions are verb-first. The prefix states the contract, not just the implementation.

| Prefix                                         | Contract                                                                                    | Examples                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `createX`                                      | Establish a branded/invariant-carrying value; throws on invalid vouched input               | `createUser`, `createSession`                           |
| `fitX`                                         | Repair untrusted input into a valid value; clamps/defaults, no throw for editing quantities | `fitSettings`, `fitUrl`                                 |
| `parseX` / `parseXFile`                        | External text (or unknown) → domain; refuses malformed structure                            | `parseDocument`, `parseConfigFile`                      |
| `deserializeX`                                 | Plain data object → domain; refuses malformed structure                                     | `deserializeDocument`                                   |
| `serializeX`                                   | Domain → plain data object                                                                  | `serializeDocument`                                     |
| `serializeXFile`                               | Domain → text                                                                               | `serializeDocumentFile`                                 |
| `readX`                                        | Internal field-level shape check of unknown data; not exported                              | `readPayload`                                           |
| `assertX`                                      | Throw when an invariant does not hold; no meaningful return                                 | `assertFinite`, `assertIntegerInRange`                  |
| `checkX`                                       | Compute a status/boolean without throwing                                                   | `checkPermissions`, `checkStructure`                    |
| `isX` / `hasX` / `canX` / `shouldX` / `needsX` | Boolean predicate, no side effects                                                          | `isTerminal`, `hasSelection`, `canRetry`, `needsRender` |
| `getX`                                         | Pure lookup/read; no side effects                                                           | `getItem`, `getNode`, `getValue`                        |
| `xOf(y)`                                       | Pure projection/derivation (`get` would read awkwardly)                                     | `lengthOf`, `indexOf`, `idOf`, `totalOf`                |
| `xCount` / `xLength`                           | Numeric count or length                                                                     | `itemCount`, `bufferLength`                             |
| `setX` / `patchX` / `toggleX`                  | Replace a value / update part of it / flip a boolean                                        | `setDuration`, `patchSettings`, `toggleEnabled`         |
| `useX`                                         | React hook; follows the Rules of Hooks                                                      | `useDocument`, `useSelection`                           |
| `drawX`                                        | Consume the random source and return one value                                              | `drawNumber`, `drawItem`                                |
| `sampleX`                                      | Draw a point or a collection from a distribution                                            | `sampleItems`                                           |
| `stepX`                                        | Move a value by one notch/delta; consumes the random source                                 | `stepFrame`, `stepSelection`                            |
| `generateX`                                    | Deterministic domain construction from its inputs; may consume the random source            | `generateReport`                                        |
| `deriveX`                                      | Deterministic derivation from an input                                                      | `deriveKey`, `deriveSlug`                               |
| `buildX`                                       | Assemble a domain value from parts; no I/O                                                  | `buildTree`, `buildRequest`                             |
| `assembleX`                                    | Combine parts into one composite surface                                                    | `assemblePage`                                          |
| `computeX`                                     | Pure calculation from existing data                                                         | `computeTotals`                                         |
| `renderX`                                      | Produce pixels or GPU output; side effects allowed                                          | `renderFrame`                                           |
| `loadX` / `saveX`                              | Cross an I/O boundary (storage, files, assets)                                              | `loadDocument`, `saveDocument`                          |
| `initX`                                        | One-time setup with side effects                                                            | `initApp`                                               |
| `applyX`                                       | Apply a prepared value to the current state                                                 | `applyTheme`                                            |
| `publishX`                                     | Make a value the current app state                                                          | `publishResult`                                         |
| `openX`                                        | Reveal or navigate to a value                                                               | `openDocument`                                          |
| `selectX`                                      | Choose the current item                                                                     | `selectRow`, `selectTab`                                |
| `addXToY` / `removeXFromY`                     | Collection update                                                                           | `addItemToCart`, `removeItemFromCart`                   |
| `withX`                                        | Run a callback with a resource/context                                                      | `withTransaction`                                       |

`createX` and `fitX` are the two rungs of the throw-vs-repair policy: the prefix tells the caller which one they are calling. Do not use `make`, `new`, or `build` for a validating factory.

`serializeX` returns the plain data shape; `serializeXFile` returns text. A domain with only one text form may use `serializeX`/`parseX` as a symmetric pair, but it must not also export a second `serializeX` with a different return type. When both forms exist, use the four-name set: `serializeX` (data), `serializeXFile` (text), `deserializeX` (data → domain), `parseXFile` (text → domain).

Documented exceptions to verb-first naming:

- `defaultX` returns a canonical value (`defaultLayout`);
- `randomX` returns a random scalar (`randomId`);
- `xOf`, `xCount`, `xLength` are projections (see table);
- React event props use `onX`, and local handlers use `handleX`.

Async functions do not take an `Async` suffix; the `Promise` return type carries that. A `*Sync` suffix is reserved for a synchronous twin that genuinely coexists with an async version.

### 2.1.5 Booleans

Predicate functions start with `is`, `has`, `can`, `should`, or `needs`. Boolean properties read as an assertion or a state, not as a bare noun:

```ts
readonly allowsEditing: boolean; // not `edit`
readonly enabled: boolean;
readonly animated: boolean;
readonly failed: boolean;
```

Avoid double negatives (`isNotReady`) unless the negative is the domain concept (`disabled`, `failed`). Prefer `isReady` over `!isNotReady`.

### 2.1.6 Constants, suffixes, units

Module constants use meaningful prefixes and suffixes:

| Pattern                   | Meaning                                      | Examples                               |
| ------------------------- | -------------------------------------------- | -------------------------------------- |
| `MAX_*` / `MIN_*`         | Domain bounds enforced by validation         | `MAX_FILE_SIZE`, `MIN_ZOOM`            |
| `DEFAULT_*`               | Fallback/default value                       | `DEFAULT_PAGE_SIZE`, `DEFAULT_TIMEOUT` |
| `EMPTY_*`                 | Identity/empty value                         | `EMPTY_RESULT`                         |
| `RAW_*`                   | Unprocessed base model                       | `RAW_PAYLOAD`                          |
| `*_LIMIT`                 | Capacity or attempt cap (not a domain bound) | `HISTORY_LIMIT`                        |
| `*_VERSION`               | Format/generator version                     | `SCHEMA_VERSION`, `BUILD_VERSION`      |
| `*_FORMAT`                | File format identifier                       | `FILE_FORMAT`                          |
| `*_IDS`                   | Ids of a registry, in canonical order        | `PAGE_IDS`, `COLOR_IDS`                |
| `*_CHOICES`               | Allowed values of a user axis                | `LAYOUTS`, `PAGE_SIZES`                |
| `*_LEVELS` / `*_PROFILES` | Named points of an axis                      | `LOG_LEVELS`, `SIZE_PROFILES`          |
| `*_REGISTRY`              | Map of implementations                       | `PLUGIN_REGISTRY`, `OPCODE_REGISTRY`   |
| `*_TEMPLATE` / `*_SOURCE` | Embedded source text or contract snippet     | `EMAIL_TEMPLATE`, `SHADER_SOURCE`      |
| `*_MS`                    | Raw duration in milliseconds                 | `MIN_DELAY_MS`, `MAX_DELAY_MS`         |
| `*Count`                  | Numeric count                                | `itemCount`, `errorCount`              |

Plural nouns name collections (`rows`, `weights`, `COLOR_SPACES`); a number is a `*Count` (`cellCount`, not `cells`). A range is a `<quantity>Range` or the quantity itself when the type is a dedicated range (`amplitude`, `cycleCounts`); it is not a list.

Include a unit suffix on raw numbers when the unit is not obvious from the name or the nearby code (`loopMs`, `timeoutMs`). When the type carries the unit (`DurationSeconds`, `Milliseconds`), the name may omit it (`duration`, `timeout`).

### 2.1.7 Abbreviations and acronyms

Treat acronyms as words in `camelCase` and `PascalCase`: `Id`, `Url`, `Api`, `Http`, `Json`, `Html`, `Css`, `Svg`, `Pdf`, `Uuid`, `Ui`, `Db`, `Ms`. Never write `ID`, `URL`, `API`, `JSONParser`, or `UUID` in an identifier; keep all-caps only in `SCREAMING_SNAKE_CASE` constants (`HTTP_TIMEOUT`, `PDF_HEADER`).

Do not invent abbreviations for local convenience. Use a full word unless the abbreviation is the public domain name or appears in the approved list above.

### 2.1.8 Domain vocabulary

Overloaded domain words are expensive to rediscover. Each project therefore keeps a glossary, and that glossary is the source of truth for its vocabulary. The convention is about what the glossary must contain, not about any particular domain.

A useful glossary records:

- the canonical word for each concept, and the synonyms that are forbidden;
- the distinctions between near-synonyms that are genuinely different concepts;
- the unit or range carried by a numeric name when it is not obvious.

Example of the kind of distinction worth writing down:

```text
user / account        a user authenticates; an account owns billing and membership
document / file       a document is the editable value; a file is its serialized form on disk
session / connection  a session is an authenticated window; a connection is the transport
order / cart          an order is a commercial intent; a cart is the mutable pre-checkout collection
price / cost / total  price is what the customer pays; cost is what the seller paid; total is after adjustments
```

When a name could mean two of these, qualify it (`userAccount`, `filePath`, `sessionToken`) rather than relying on context.

### 2.1.9 Coherence and renames

A rename is a coherence change, not a cosmetic one:

- rename every layer in one change (core, store, component, tests, docs);
- do not keep an alias unless a migration window genuinely exists;
- update the glossary when the concept changes, not just the identifier;
- if two concepts are genuinely different, name the difference instead of merging the words.

Prefer an explicit, slightly longer name over a short ambiguous one. `data`, `info`, `manager`, `helper`, `util`, `common`, `base`, and `handle` are not names: they describe the absence of a concept.

### 2.1.10 Exceptions

External conventions win at their boundary:

- frameworks: `onX` props, `handleX` handlers, `useX` hooks;
- platform APIs: DOM, Canvas, and WebGL identifiers keep their native casing;
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
draw/sample/...  consume the random source
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

### Where a type lives

A type is the shape of a value, so it lives where that value is understood, not in a barrel that
happens to re-export it:

- one consumer → declare the type in that consumer's file, next to the code that reads the shape;
- several consumers → declare it in a `types.ts` in the **deepest directory common to those
  consumers**, and import it from there;
- the whole package → the package's own `types.ts`, or the module that owns the concept.

This keeps the mutual dependency graph local: a shared `types.ts` at the lowest common ancestor
cannot reach back into either consumer. Do not read this as "move every type to `types.ts`": a type
that one module owns stays with it, and a `types.ts` is a placement rule, not a dumping ground.

It is not a structure to create in advance.

---

## 2.7 Module Structure & Dependency DAG

### 2.7.1 Layered dependency direction

Dependencies flow in one direction (relaxed DAG):

```text
kernel (config, shared, utils)           ← no deps on domains
    │
    ▼
domains (…)
    │           ↑              ↑
    │           └──────────────┘  cross-domain allowed if clear ownership
    ▼
stores                                  ← import from domains + kernel
    │
    ▼
components / app                        ← import from stores + domains + kernel
```

**Rules:**

- **Kernel** (`core/config`, `core/shared`, `core/utils`) — no imports from domains, stores, or app.
- **Domains** — may import from kernel and from other domains **only when there is a clear owner** (e.g., an `order` module imports `Customer` from `customer` because `customer` owns the customer concept). No cycles.
- **Stores** — import from domains and kernel. Do not import from other stores (use domain types as the contract).
- **Components** — import from stores (for state/actions), domains (for types/constants), and kernel.
- **Cycles are forbidden.** If a cycle appears, the ownership is wrong — move the shared type to the owner or to kernel.

### 2.7.2 File roles within a domain module

Each domain directory follows this pattern:

```
core/<domain>/
├── types.ts          # Domain types ONLY (brands, interfaces, type aliases, *Id, *Data)
├── constants.ts      # Runtime constants ONLY (MAX_*, DEFAULT_*, *_IDS, *_VERSION, *_FORMAT, *_REGISTRY)
├── index.ts          # (optional) internal barrel for same-domain imports only
├── <implementation>.ts
└── ...
```

**`types.ts` exports:**

- Branded types: `Email`, `Slug`, `UserId`
- Interface shapes: `Document`, `UserProfile`, `ColorSpace`, `PluginSpec`
- Type aliases: `LayoutId`, `PageId`, `GroupId`, `PriceModel`
- Serialization DTOs (`*Data`): `DocumentData`, `UserData`, `NodeData`, `OrderData` — these are part of the domain's public contract
- **No runtime values** (no `const`, no `export const`)

**`constants.ts` exports:**

- All `SCREAMING_SNAKE_CASE` module constants: `MAX_PAGE_SIZE`, `FILE_FORMAT`, `PAGE_IDS`, `COLOR_IDS`, `PLUGIN_REGISTRY` (camelCase for registries), `SCHEMA_VERSION`
- Configuration objects: `CONFIG` (camelCase — it's a live singleton)
- **No types**

**Implementation files (`serialize.ts`, `document.ts`, `validation.ts`, etc.):**

- Export functions, not types (except truly local types used only in that file)
- Import types from `./types`, constants from `./constants`

### 2.7.3 Serialization DTOs (*Data types)

Types suffixed with `*Data` (`DocumentData`, `UserData`, `NodeData`, `OrderData`, `WorkspaceData`) are **plain serializable shapes** — they belong in the **domain's `types.ts`** because:

- They are part of the domain's public contract (file format, IPC, storage)
- Multiple consumers need them (serialize, stores, components, dataset)
- They are not implementation details of the serializer

The serializer imports `*Data` from `./types` and exports only `serializeX`, `deserializeX`, `parseXFile`, `serializeXFile`.

### 2.7.4 Import patterns

- **No barrel exports (`index.ts`)** for cross-module imports. Import from the source file:
    ```ts
    import { PAGE_IDS } from '../document/constants';
    import { createDocument } from '../document/document';
    import type { Document } from '../document/types';
    ```
- **Within the same domain**, relative imports from the actual file are fine. An `index.ts` may re-export for internal convenience but is not required.
- **Kernel modules** (`config`, `shared`, `utils`) are imported directly:
    ```ts
    import { CONFIG } from '../config/config';
    import type { ColorSpaceId } from '../config/types';
    import { assertFinite } from '../shared/guards';
    ```
- **Do not create `types.ts` barrels** that re-export from other domains' `types.ts`. Each domain owns its types.

### 2.7.5 Naming: registries vs constants

- `SCREAMING_SNAKE_CASE` = **immutable values fixed at module load**: bounds, defaults, id arrays, format strings, version numbers.
- `camelCase` = **registries, maps, live singletons, config objects**: `pluginRegistry`, `dependencyRegistry`, `catalog`, `store`, `renderer`, `CONFIG`.

`PLUGIN_SPECS` → `pluginRegistry` (it's a registry array, not a constant spec).

### 2.7.5.1 Registry key types (`*Id`)

Types like `PluginId`, `DependencyId`, `ColorSpaceId`, `LayoutId` that are **keys of a runtime registry** are exported **from the file that defines the registry**, not from `types.ts`. This allows `keyof typeof registry` to work without import cycles.

```ts
// plugins/registry.ts
export const pluginRegistry = { ... } satisfies Record<string, PluginSpec>;
export type PluginId = keyof typeof pluginRegistry;  // ✅ inferred from registry

// constants.ts
export const dependencies = defineDependencies({ ... });
export type DependencyId = keyof typeof dependencies;    // ✅ inferred from registry
```

Consumers import directly from the source:

```ts
import type { DependencyId } from '../dependencies/constants';
import type { PluginId } from '../plugins/registry';
```

`types.ts` does **not** re-export these — it only owns domain types that don't depend on runtime values.

### 2.7.6 Applying the rules to a domain

The split is a shape, not an inventory. A domain applies it like this:

| Module role      | `types.ts` owns                             | `constants.ts` / registry owns                            | Implementation exports                                              |
| ---------------- | ------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------- |
| Domain module    | Branded types, interfaces, aliases, `*Data` | `MAX_*`, `DEFAULT_*`, `*_IDS`, registries and their `*Id` | `createX`, `fitX`, `serializeX`, `parseXFile`, `checkX`, predicates |
| Store module     | `*State`, `*Settings`, view projections     | Axis choices (`*_CHOICES`, `*_VIEWS`), limits             | Store instances, actions, selectors                                 |
| Component module | `*Props`, display-only projections          | Display constants (`*_SIZE`, `*_COLORS`)                  | Components, hooks                                                   |

The concrete contents of each domain belong to that project's architecture docs, not to this convention. Two rules keep the shape honest:

**`types.ts` stays exhaustive.** A domain type belongs in `types.ts` even when a value shares its
name: `OrderView` lives in `order/types.ts` while `EMPTY_ORDER` lives in `order/view.ts`, and
`Rating` lives in `review/types.ts` while `isRating` lives in `review/rating.ts`. The type module is
the single place a reader looks for shapes; splitting a type out to sit next to its companion value
costs a second import path and buys nothing.

**Single-`const` modules may be collapsed.** When a module owns exactly one runtime constant, it may
stay flat in `<module>.ts` rather than split into a `constants.ts` of its own.

**No gratuitous directories.** A subdirectory that holds a single file with no sibling is flattened:
`user/profile/profile.ts` → `user/profileLoader.ts`, `api/client/client.ts` → `api/client.ts`,
`renderer/batch/batch.ts` → `renderer/batchRenderer.ts`.

### 2.7.7 Checklist for a new domain module

When creating or reorganizing a domain:

- [ ] `types.ts` exists and exports **only types** (no `const`, no functions)
- [ ] `constants.ts` exists and exports **only runtime values** (no types) — **except** registry key types (`*Id`) exported from the registry/constants file itself
- [ ] Implementation files import types from `./types`, constants from `./constants`
- [ ] No implementation file exports types (except truly local ones)
- [ ] No `constants.ts` imports from implementation files
- [ ] Cross-domain imports follow the DAG (kernel → domain → store → component)
- [ ] No import cycles (run the project's check command and verify)
- [ ] Registries use `camelCase` (`pluginRegistry`), constants use `SCREAMING_SNAKE_CASE`
- [ ] `*Data` DTOs are in `types.ts`
- [ ] Registry key types (`PluginId`, `DependencyId`, etc.) are exported from the file defining the registry (allows `keyof typeof`)
