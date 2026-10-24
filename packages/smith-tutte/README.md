# @repo/smith-tutte

> Dual visualizer: squared-square tiling ↔ its electrical network.
> Current Status: 🧪 WIP

This README acts as the local concept spec — focusing on the "why", the mathematical inspirations, and the design decisions. The full framing is split across [`docs/`](./docs): `architecture.md` (the how), `decisions.md` (ADRs), `journal.md` (the narrative), and `roadmap.md` (execution strategy). API inventory is automatically handled by TypeDoc.

---

## 🎯 Intention & Concept

An interactive side-by-side visualizer observing two faces of the same object in real time: the **geometric tiling** (a square filled with smaller squares) and its **dual electrical network** (nodes as potential lines, edges as resistors).

The pivotal model is a single source of truth — an enriched planar directed graph:

- **Nodes** are equipotential lines $V$ (the horizontal demarcation segments in the square).
- **Edges** are $1\,\Omega$ dipoles; geometrically they are the squares themselves. Current through an edge = side length of the square ($V = R \cdot I$, $R = 1\,\Omega$).
- The **primal graph** dictates the vertical ordering $Y$ (potential levels); the **dual graph** dictates the horizontal accumulation $X$. Every edge keeps a direct reference to its twin square (`worldToPavage()` / `pavageToNode()`).

Rendering follows a decoupled pipeline: business logic produces abstract primitives in **World Space** → viewport matrix (pan/zoom) → concrete surface adapter (Canvas/GPU). Primitives carry entity IDs so both views can highlight synchronously.

Entry point is a textual DSL describing the system without any GUI input (netlist-style topology vs slicing-tree layout vs hybrid syntax — grammar still to be frozen).

## 🥷 Brainstorming, Inspirations & Credits

- **Visual Inspo:**
    - [10 PRINT](https://10print.org)
- **Math / Papers:**
    - Brooks, Smith, Stone & Tutte (1930s): solving the squaring of the square via an exact electrical-network analogy — perfect network currents yield perfect squared squares.
    - Smith diagram: RF impedance matching via iso-resistance / iso-reactance circles.
- **Borrowed Code & Algorithms:**
    - Kirchhoff resolution over the dual planar graph (topological solver producing $(X, Y, W, H)$ + potentials).

## ⚠️ Patterns & Gotchas

- Never keep two models (one per view) — desync is guaranteed. One SSOT graph, two derived projections.
- Business logic must stay renderer-agnostic (no Canvas/SVG/WebGL knowledge); only the surface adapter touches pixels.
- A pure slicing-tree DSL only expresses guillotine layouts, which excludes some complex non-slicing perfect squares.

## 📚 References

- [The story of the squared square](https://www.youtube.com/watch?v=0fH80JF2mDM)
- [The Stanford Bunny](https://en.wikipedia.org/wiki/Stanford_bunny)
- [`docs/archittheBrain.md`](./docs/theBrain.md) - The system as designed today (pipeline, core model, folder structure).

---

_Part of the [Creative Playground](https://joska-p.github.io/playground). Technical API reference generated at `/docs/api/smith-tutte/`._
