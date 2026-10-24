# @repo/oeis-signal

> A personal composable signal + visualization package for integer sequences — sequences are lazy, on-demand streams of numbers, rendered through pluggable viz layers.

---

## Intention & Concept

A sequence (Recamán, Collatz, naturals…) is treated as a **signal**: a lazy, pull-based stream of numbers. You `next()` to pull the next term, `take(n)` to materialize up to `n` terms, and `produced` tells you how many have been pulled so far. This makes even infinite sequences safe to consume in an interactive app — nothing is materialized until asked.

Everything is a black-box **Module** (`id`, `name`, `description`, `createSignal(budget)`), so new sequences plug in without the engine knowing their internals. Modules live in a typed registry; a **Budget** (`maxTerms`) is a hard limit so a stateful or infinite module can't explode memory or frame time. Viz layers and middle transforms can be attached to any signal.

Generators and viz live in the **same package** because they are tightly related, but they stay in separate TypeScript projects: `core` + `modules` are DOM-free and testable in Node, while `viz` has its own tsconfig with canvas/DOM libs.

## Brainstorming, Inspirations & Credits

- **Visual Inspo:** waveform/oscilloscope-style plots of integer sequences (polyline viz).
- **Math / Papers:** OEIS — the On-Line Encyclopedia of Integer Sequences; classic sequences (natural numbers, Recamán, Collatz).
- **Borrowed Code & Algorithms:** the iterator protocol (`IteratorResult`), lazy pull-based streams, `@repo/glaze` `CpuSurface` for rendering.

## Patterns & Gotchas

- **Pull, don't push:** a signal is pull-based (`next()`/`take()`), which keeps the consumer in control of pace and lets a viz pull exactly as many terms as it can draw.
- **Budget is a hard cap, not a hint:** `next()` returns `{ done: true }` once `produced` reaches `budget.maxTerms`, and `take(count)` clamps to the budget remaining.
- **Viz pulls what it needs:** a viz's `render(signal, surface)` is called every frame and is free to `signal.take(maxTerms)` — the signal is stateless between pulls beyond the counter.
- **DOM-free core:** `core`/`modules` never touch the browser, so the generation logic runs in Node tests (`pnpm --filter @repo/oeis-signal test`).

## 📚 References

- [OEIS — On-Line Encyclopedia of Integer Sequences](https://oeis.org/)
- [Iterators and generators — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)

---

_Part of the [Creative Playground](https://joska-p.github.io/playground). Technical API reference generated at `/docs/api/oeis-signal/`._
