# Randomart — State (single entry point)

## Goal

Find good grammars by eye: judge one grammar at a time over many seeds, keep the good ones as
presets. Around that goal, keep the package coherent: one place for curated values (`CONFIG`), one
vocabulary for names (conventions §2.1), one direction for dependencies (§2.4), no dead code and no
duplication.

## How to run

```bash
cd packages/randomart && vp check --fix && vp test    # green gate before and after a change
vp run audit                                          # from the root: vocabulary, knip, jscpd (madge warns)
```

Generation stays byte-identical for a given `(grammar, seed)` unless a session decides otherwise, and
then the PRNG consequence (`GENERATOR_VERSION`) is named. Changing the sampler changes which points
are explored, not what `generate()` draws for a point.

## Where things live

| Topic                                               | Document                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| Naming / layers / type placement rules              | `codex/docs/conventions/02-typescript.md` §2.1, §2.6               |
| Audit tooling and what each gate covers             | `tools/lint/audit.mjs`, `tools/lint/banned-words.mjs`, `knip.json` |
| Audit history (A/B batches, per-commit detail)      | `randomart-audit-registry.md`                                      |
| Post-gate-repair follow-up and triage log           | `randomart-audit-followup.md`                                      |
| Config values vs hard guards, PRNG impact           | `randomart-config-knobs.md`                                        |
| Loose ends noticed, not yet scheduled               | `findings.md`                                                      |
| Colour pipeline (session note, dated)               | `randomart-colour-pipeline.md`                                     |
| Time in the `x`/`y` terminals (session note, dated) | `randomart-time-in-xy.md`                                          |

## State

- Core, compiler, renderer, lab, bench and history: done. Notebook (rated batches, IndexedDB, JSON
  import/export) works, format v1.
- **One quantized space** (`core/grammar/quantized.ts`): a `Grammar` = one **integer weight per
  operator** (same range `[0, CONFIG.grammar.maxWeight]`, `0` = off) + `size` profile + `shareDepth`
    - colour space. There is no `Recipe` and no weight-level indirection: the grammar _is_ the point.
      Constraints are derived from `size` (`constraintsOf`), never stored free-form; the only repair in
      `createGrammar` is `shareDepth`, an editing quantity clamped into `[0, maxDepth]`. It checks the
      rest as content (integer weights, known size/space, at least one active terminal **and** one active
      non-terminal) and throws otherwise. `drawGrammar` draws each operator independently in
      `[0..maxWeight]`, then the size/share/space axes; `stepGrammar` walks one integer notch (±1). Both
      restore the two viability invariants deterministically. Families (`terminal`,
      `arithmetic`, …) exist only as UI grouping (`operator.group`). `x`/`y` carry the time through
      their oscillator params (`amp`/`phase`/`cycles`).
- **One default grammar.** `defaultGrammar` is the `structure` preset: the 2026-10-17 calibration on
  the integer grid (medium profile, `x=y=4`, `min=max=2`, everything else `1`, `shareDepth=2`,
  OKLCH) — the app's start point and a preset like any other, no separate test/measurement fixture.
- **Bench** draws lots with `sampleGrammars`; focus view shows one grammar over its seeds, `planche`
  is the grid overview. Rating is still the 0-5 note (to be replaced, see T1).
- **Dataset pipeline** (`scripts/dataset`) surveys the same quantized space with the same
  `sampleGrammars` sampler (one sampler, not two): the caller may pin `size`, `shareDepth` or
  `space`, and seed derivation is shared with the bench.
- **Gates green.** `vp check --fix`, `vp test` and the audit pass after the 2026-10-20
  quantized-grammar refactor: the tests cover the integer weight grid, the per-profile constraints,
  the single `sampleGrammars` sampler and the new serialization. Cycles stay an informational
  warning (decision B-04). Lot A (naming) is done.

## Next

### T1 — tags and keep (replaces the 0-5 rating)

- Manual binary tags on the grammar, judged over all its seeds: readable, harmonious, varied, too
  flat, too chaotic, dirty colours. Plus a `kept` boolean, the only decision that matters.
- Auto tags precomputed from `describeImage` (flat, saturated, symmetric, colourfulness...):
  displayed, never ticked by hand.
- Notebook format v2: `rating` becomes `tags` + `kept`, store the `Grammar`, migrate v1 files on read.
- One keyboard key per tag, one for keep.

### T2 — keep creates a preset

A kept grammar is promoted to a preset, persisted in the notebook, offered in the Lab select next to
the built-ins.

### T3 — neighbours ("More like this")

One-notch mutation of a kept grammar (one operator weight ±1, or size/shareDepth/space),
deduplicated with `grammarKey`. New lot made of the grammar and its neighbours.

### T4 — tags vs grammar statistics

Compare means and use `correlation` (0/1 target) between tags and weights/shareDepth/space. Needs
roughly 50-100 judged grammars to mean anything. Read-only report. PCA stays optional.

### T5 — options

- Diversified draw: sample ~40, drop flat ones, keep the 8 farthest apart in descriptor space.
- Controlled view: same grammar, one row per `shareDepth` (distributions are comparable, images are
  not).

### C batch — `appStore` SSOT, errors and lifecycle

- ~~`appStore` stores `grammar` and `recipe` while the grammar should be derived from the recipe.~~
  Done: `grammar` is the only representation, `HistoryEntry` stores it directly, and imports use the
  provenance grammar as-is (an invalid import is refused, never repaired into a different point).
  The shared generate → compile → publish block still exists (`commit` / `publishArtwork` /
  `restoreImportedEntry`).
- `downloadBlob` is duplicated with two behaviours (deferred revoke in `appStore`, immediate in
  `benchStore`); the active-batch lookup exists as `resolveActiveBatch` / `useBenchActiveBatch` /
  `removeActiveBatch`.
- Errors and async: `createSeed(Number(value))` throws in a handler; `setBenchCount` / `setBenchSeeds`
  do not bound their input; `importNotebookFile` awaits `file.text()` outside the `try`;
  `void saveNotebookToDb(...)` leaves rejections unhandled; `openDatabase()` never closes its
  connection; `initBenchNotebook` may overwrite a newer lot; `setCanvas` / `setClockStore` are never
  reset on unmount.

## Open decisions

1. **Loop bounds.** `MIN/MAX_LOOP_MS` (`core/artwork/types.ts`) are a UI slider range and a
   file-validation bound, not a safety guard. Knob or guard?
2. **Colour gamut mapping.** Replace the per-channel clamp in OKLCH/OKLab/HSL with a chroma-reducing
   gamut map. Changes images, so it is a shader change, not a `GENERATOR_VERSION` bump. See
   `randomart-colour-pipeline.md` §2.

## Open frictions

- Imported artworks carry a grammar, so `openCellInLab` and the inspector show the exact point;
  there is no `recipeOf` fallback and no continuous-weight case left. Invalid grammars are refused
  at the import boundary.
- Browser range and fuzz tests are not automated; `scripts/validate-glsl.sh` covers syntax only.
- Sub-expression preview ignores ancestor warps.
- Render size equals canvas size; the batch readback goes through canvas capture, not `readPixels`.
- A `.gitignore` pattern aimed at the package root must be anchored (`/dataset/`).
- The planche is one offscreen surface plus one display canvas (WebGL context limits forbid one
  canvas per cell).
- Ratings/tags are manual: descriptors only filter flat cells and explain, never score beauty.
- The playground mounts only `@repo/randomart/Scene`; the bench stage never appears there.
- `NotebookCandidate.note` exists in core but no UI uses it yet.

## End of session

1. `vp check --fix` and `vp test` green; `vp run audit` green.
2. Update State and Next here.
3. Commit one change per category.
