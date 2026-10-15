[← Index](README.md)

# 6. Core and rendering

## 6.1 Rendering follows core / shell

Rendering is an application of the same core/shell rule (see §1.2).

### Core

The core contains things such as:

- physics;
- transforms;
- geometry;
- simulation;
- deterministic calculations.

It receives explicit inputs and produces results.

### Shell

The shell owns:

- `requestAnimationFrame`;
- real time;
- Canvas / WebGL / DOM APIs;
- event listeners;
- applying results;
- notifying observers.

Do not hide lifecycle dependencies inside otherwise pure logic.

The rendering shell may be imperative.

That is not a problem.

The problem is allowing imperative environmental concerns to become invisible dependencies of logic that is supposed to be deterministic.

Inside the shell, keep rendering orchestration separate from raw Canvas / DOM operations (see §2.3).

---

## 6.2 Simulation truth

Simulation state belongs to the simulation/core.

Do not copy simulation truth into application state merely to expose it to React.

The core should remain deterministic where practical so that:

- replay is possible;
- seed-based variation is possible;
- behavior can be tested independently;
- rendering and UI concerns do not become part of the simulation.

React does not need to own the simulation merely because React displays its results.
