# Architecture

This is a small personal UI toolkit for creative mini-apps.

The goal is to keep the system simple, composable, and focused on the few primitives actually needed.

## Stack

- **React** — builds the interactive interface.
- **StyleX** — handles component styling.
- **CSS variables** — provide semantic theme tokens.
- **Astro** — handles elements that do not need React.

## Structure generale des applications qui utilisent cette ui library

```text
App
├── Shell
│   ├── Canvas
│   └── ControlPanel
│
├── Canvas
│   ├── Gizmos
│   ├── Selection
│   └── Overlays
│
└── ControlPanel
    └── Controls
```

### Shell

The Shell owns the global layout:

- viewport sizing
- panel visibility
- panel placement
- orientation
- responsive behavior

The Canvas and ControlPanel should not know about the global layout.

### Canvas

The Canvas owns the creative surface and its interactions:

- rendering
- selection
- gizmos
- overlays
- direct manipulation

The Canvas should receive as much space as possible.

### Control Panel

The ControlPanel is a small declarative system for exposing creative parameters.

```ts
controls({
  camera: folder({
    fov: number(50),
    near: number(0.1),
    far: number(100),
  }),

  material: folder({
    color: color("#ff0000"),
    roughness: number(0.5),
  }),
});
```

This data-driven approach is intentionally limited to controls. It is not a universal UI architecture.

For unique or complex interfaces, use normal React composition.

### Responsive behavior

The application should remain functional on mobile without requiring a separate mobile UI.

The layout adapts to the viewport:

- **Portrait** → horizontal control panel
- **Landscape** → vertical control panel

The panel should remain secondary to the Canvas and be easy to show/hide.

Touch interaction is a first-class requirement. Controls must not depend on hover.

### Components

Create components only when they solve a real recurring problem.

Prefer:

```text
small components
+ composition
+ simple APIs
```

over a large generalized design system.

A component should be extracted when there is a real need for reuse, not because a pattern might exist later.
