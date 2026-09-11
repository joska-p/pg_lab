---
title: Graphics Architecture
description: Rendering-lifecycle and invariant patterns specific to graphics/animation code. Extends conventions/typescript.md — read that first.
---

# Graphics Architecture

Domain-specific extension of the general TypeScript conventions, for code that touches Canvas, WebGL, or a render loop. Everything in `typescript.md` still applies (purity, one level of abstraction, branded types); this doc adds patterns that only make sense once you have a lifecycle to protect.

## Proof tokens for lifecycle guarantees

Branded types (see `typescript.md`) prove a _value_ is valid. Proof tokens extend the same idea to prove a _moment in time_ is valid — e.g. that a draw call is happening inside an active frame, or that a texture is bound before you use it.

```typescript
class ActiveFrameToken {
  private constructor(
    public readonly timestamp: number,
    public readonly dt: number,
  ) {}

  static createInternal(timestamp: number, dt: number): ActiveFrameToken {
    return new ActiveFrameToken(timestamp, dt);
  }
}

class Canvas2DRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("2D Context not supported");
    this.ctx = context;
  }

  // Draw calls demand the token as proof of lifecycle execution
  drawCircle(token: ActiveFrameToken, center: Vec2, radius: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

class AppRunner {
  private renderer: Canvas2DRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Canvas2DRenderer(canvas);
  }

  renderFrame(time: number, dt: number) {
    const frameToken = ActiveFrameToken.createInternal(time, dt);
    this.renderer.drawCircle(frameToken, { x: 100, y: 100 }, 20, "red");
  }
}
```

### What this actually guarantees — and what it doesn't

A private constructor stops a caller from writing `new ActiveFrameToken(...)` casually — that's the whole value of the pattern: it makes the _intended_ call path the only convenient one. It is **not** a runtime guarantee. TypeScript's types are erased at compile time, so `{ timestamp: 0, dt: 0 } as unknown as ActiveFrameToken` produces a working fake token, and nothing stops a token from being stashed and reused after its frame has ended — there's no consumption/invalidation step here.

Treat proof tokens as a convention the compiler nudges people toward, not a security boundary. If you need a real single-use guarantee (e.g. a resource that must not survive its frame), you need an explicit runtime check — a `consumed` flag, a `WeakRef`, or similar — which does re-introduce the runtime cost the pattern is otherwise trying to avoid. Reach for that only when a misuse would actually cause a bug that's expensive to track down, not by default.

## Honest core, impure shell

This is the graphics-specific application of the purity rule in `typescript.md`. In a render loop specifically:

- **Core (honest):** physics, transforms, geometry. Takes `dt`, `randomSeed`, and current state as parameters; returns new state. No `performance.now()`, no `Math.random()`, no mutation of `this`.
- **Shell (impure, application-level only):** the `requestAnimationFrame` loop, DOM/Canvas/WebGL context calls, `Date.now()`. Gathers real values, calls the honest core, applies the result as a side effect.

```typescript
interface Vec2 {
  readonly x: number;
  readonly y: number;
}

interface ParticleState {
  readonly position: Vec2;
  readonly velocity: Vec2;
}

// Honest core
function updateParticle(particle: ParticleState, dt: number, randomSeed: number): ParticleState {
  const noise = (randomSeed - 0.5) * 10;
  return {
    position: {
      x: particle.position.x + (particle.velocity.x + noise) * dt,
      y: particle.position.y + particle.velocity.y * dt,
    },
    velocity: particle.velocity,
  };
}

// Impure shell
class GraphicsEngine {
  private state: ParticleState = { position: { x: 0, y: 0 }, velocity: { x: 1, y: 0 } };
  private lastTime = performance.now();

  start() {
    const frame = (now: number) => {
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      const seed = Math.random();
      this.state = updateParticle(this.state, dt, seed);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}
```

## Checklist

1. Does the core take `dt` / `randomSeed` / state as parameters instead of reaching for global time or randomness?
2. Are invalid vectors/values excluded by a branded type, validated once at construction (see `typescript.md`)?
3. Does a lifecycle-sensitive call (draw, bind, dispose) require a proof token — and have you accepted that this is a compile-time nudge, not a runtime lock?
4. Is any function mixing raw loops or Canvas/WebGL calls with scene-level orchestration? If so, extract a named helper.
