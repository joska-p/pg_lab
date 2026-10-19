# Session prompt — centralize hard-coded values into a config file

> Goal: the codebase (mainly `packages/randomart`) is full of hard-coded
> values and magic numbers. Introduce a single config file so we can iterate
> on the look/feel without writing code (or UI) for every small tweak — and
> spot recurring patterns worth promoting to real concepts.
> Working language for the session: French for discussion, English for code
> and docs.

Context first, in `codex/notes/randomart-time-in-xy.md` (read it before
starting). Read `codex/docs/conventions/README.md` and route to the relevant
convention files before designing anything.

## Known offenders (non-exhaustive — audit the package yourself)

- `core/catalog/operators/terminals.ts`: `amp: { min: 0, max: 0.7 }`,
  `phase: { min: -1, max: 1 }`, `cycles` mapping `1 + round(2 * cycles)`.
- `core/grammar/quantized.ts`: `SIZE_PROFILES`, `LEVEL_ODDS`,
  `LEVEL_WEIGHT`, `MIN_ACTIVE_FAMILIES`.
- `core/grammar/generator.ts` / `drawParams`: the 3-decimal rounding.
- `core/compiler/types.ts`: `MAX_SOURCE_LENGTH`.
- `core/grammar/types.ts`: `MAX_DEPTH`, `MAX_NODES`, `MAX_WEIGHT`.
- `stores/appStore.ts`: `HISTORY_LIMIT`, initial seed `42`.
- Renderer bounds (`MIN_LOOP_MS`, `MAX_LOOP_MS`, default render size).

## Framing questions

1. **Audit first**: list every constant that is a _taste_ knob (amp bounds,
   odds, profiles, history limit…) vs a _hard constraint_ (MAX_DEPTH as a
   guard against shader blow-up, MAX_SOURCE_LENGTH). The two categories
   deserve different treatment — do not dump guards into a tunable config.
2. **What shape?** A single typed TS module of exported consts? A JSON file
   loaded at startup? Consider: type-safety, the fact that some values feed
   the PRNG draw order (changing them silently changes every seed — see
   GENERATOR_VERSION in the note), and iteration speed (hot-reload?).
3. **Who consumes it?** Propose the minimal seam: core functions taking a
   config object (defaults from the config file) vs importing the file
   everywhere. Follow `codex/docs/conventions` §1–§2 for the abstraction
   level.
4. **Patterns**: as you group the constants, note which ones recur (bounds
   pairs `{min, max}`? per-family odds?) — those may deserve named
   constructs instead of raw config entries.
5. Deliverable: the config file + the wiring for the **clearest cases
   first** (probably the terminals' amp bounds and the quantized recipe
   odds), a short note in `codex/notes/` explaining the split
   constraints-vs-knobs, and a TODO list of the rest. Keep the diff
   reviewable; no big-bang refactor.

## Constraints

- No need for back compatibility. there is no old artwork or consumers.
- Bump `GENERATOR_VERSION` if — and only if — a change alters the numbers a
  given seed produces.
