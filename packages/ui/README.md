# Architecture

This is a small personal UI toolkit for creative mini-apps.

The goal is to keep the system simple, composable, and focused on the few primitives actually needed.

## Stack

- **React** — builds the interactive interface.
- **StyleX** — handles component styling.
- **CSS variables** — provide semantic theme tokens.

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

---

# UI Guidelines

The UI should feel like a **creative instrument**, not a SaaS dashboard.

The Canvas is always the visual priority. The interface should support the creative process without competing with it.

## Visual Direction

**Dark · compact · tactile · technical · spatial · slightly luminous**

The visual language is inspired by tools used for creative coding, 3D, graphics and visual experimentation.

Think:

- dark surfaces
- subtle depth
- precise controls
- discreet borders
- small luminous accents
- restrained blur
- clear interaction feedback

Avoid making the interface look like a generic admin panel.

## Color

Use semantic CSS variables rather than hardcoded colors.

```css
--color-background --color-foreground
--color-card --color-card-foreground
--color-popover --color-popover-foreground

--color-primary --color-primary-foreground
--color-secondary --color-secondary-foreground
--color-muted --color-muted-foreground
--color-accent --color-accent-foreground
--color-destructive --color-destructive-foreground
--color-success --color-success-foreground
--color-warning --color-warning-foreground

--color-border
--color-input
--color-ring
```

Every functional color has an accompanying `<color>-foreground` pair.

The raw palette lives in `gruvbox-palette.stylex.ts` (Gruvbox, in oklch) — components depend only on semantic tokens, never raw values. Both light and dark variants are driven by `prefers-color-scheme`: `bright*` accents on dark, `faded*` on light. Avoid pure black; use the multiple dark layers (dark0→dark4) for depth.

Active / focus states use `ring` + primitives; disabled state is expressed via opacity, not a dedicated token.

## Surfaces

Surfaces should feel lightweight and spatial.

Use:

- subtle differences between background and surfaces
- thin, discreet borders
- moderate corner radius
- restrained shadows

Avoid:

- huge shadows
- thick borders
- excessive rounded corners
- excessive cards

Not everything needs to look like a card.

## Blur

Backdrop blur is part of the visual identity. It complements the shadows to express **depth**: the stronger the blur, the further the surface sits from what's behind it. It should still communicate **floating UI**.

Good uses:

- floating panels
- overlays
- toolbars
- menus
- controls above the Canvas

Avoid using blur everywhere.

## Glow

Glow is an accent, not a background effect.

Use it to communicate:

- active state
- selection
- interaction
- gizmos
- handles
- important lines

Inactive elements should remain subtle.

Glow should suggest **energy**, not replace contrast.

## Borders

Borders should be quiet by default.

```text
normal  → barely visible
hover   → visible
active  → luminous
```

The UI should not be built from strong rectangular outlines.

## Typography

Typography should be compact and highly readable.

- small labels
- clear hierarchy
- restrained font sizes
- compact spacing
- monospace where numeric or technical values benefit from it

Avoid oversized headings and decorative typography.

## Control Panel

The ControlPanel should feel like an **instrument panel**.

It should be:

- compact
- dense
- scannable
- easy to manipulate
- visually secondary to the Canvas

Controls should prioritize interaction over decoration.

Sliders, toggles, color inputs and numeric values should feel precise and tactile.

## Canvas & Gizmos

The Canvas is the star of the application.

UI surrounding it should occupy as little visual attention as possible.

Gizmos can be more expressive than the rest of the interface.

They may use:

- stronger accent colors
- brighter lines
- glow
- clear selection feedback
- direct manipulation states

This is where visual intensity is most appropriate.

## Responsive UI

Mobile does not require a separate design.

The same components should adapt to smaller screens.

### Portrait

```text
┌─────────────────────────┐
│                         │
│        Canvas           │
│                         │
├─────────────────────────┤
│      Control Panel      │
└─────────────────────────┘
```

### Landscape

```text
┌───────┬─────────────────┐
│       │                 │
│ Panel │      Canvas     │
│       │                 │
└───────┴─────────────────┘
```

The orientation determines the **axis** of the panel:

```text
portrait  → horizontal
landscape → vertical
```

The exact position can remain a Shell/layout concern.

Touch targets should be comfortable enough for direct manipulation. No interaction should depend on hover.

## Animation

Animation should be fast and purposeful.

Use it for:

- state changes
- opening/closing panels
- hover/active transitions
- selection feedback
- direct manipulation

Avoid decorative or perpetual animations.

## Composition

Keep layout concerns separate from component concerns.

For example:

```tsx
<Shell>
  <Canvas />
  <ControlPanel />
</Shell>
```

If different panel containers are eventually needed:

```tsx
<FloatingPanel>
  <ControlPanel />
</FloatingPanel>
```

or:

```tsx
<DockedPanel>
  <ControlPanel />
</DockedPanel>
```

`ControlPanel` describes **what** is displayed.

The container describes **where and how** it is displayed.

Do not make `ControlPanel` responsible for positioning, docking, orientation or viewport logic.

## Design Decisions

Before adding a component or visual effect, ask:

1. Is this component actually necessary?
2. Can existing primitives compose it?
3. Does it fit the visual language?
4. Does this effect communicate something, or is it purely decorative?

The goal is not to build a complete design system.

The goal is to build a **small, coherent toolkit for creative interfaces**.

---

# StyleX

## Installation Guide

StyleX requires a build-time compiler to transform styles into optimized atomic CSS. The recommended approach depends on your build tool and framework.

### Quick start

#### 1. Install dependencies

For most projects, install the core package and the appropriate plugin:

```bash
# Core runtime (always needed)
npm install @stylexjs/stylex

# For Vite, Rollup, Webpack, esbuild, or Rspack
npm install --save-dev @stylexjs/unplugin

# For Next.js
npm install --save-dev @stylexjs/babel-plugin @stylexjs/postcss-plugin
```

#### 2. Configure your build tool

##### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import stylex from "@stylexjs/unplugin";

export default defineConfig({
  plugins: [
    stylex.vite({
      useCSSLayers: true,
    }),
    react(),
  ],
});
```

Keep the StyleX plugin before `@vitejs/plugin-react` to preserve Fast Refresh.

##### Next.js

Create or modify the `babel.config.js`:

```js
// babel.config.js
const path = require("path");
const dev = process.env.NODE_ENV !== "production";

module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "@stylexjs/babel-plugin",
      {
        dev,
        runtimeInjection: false,
        enableInlinedConditionalMerge: true,
        treeshakeCompensation: true,
        aliases: { "@/*": [path.join(__dirname, "*")] },
        unstable_moduleResolution: { type: "commonJS" },
      },
    ],
  ],
};
```

Create or modify the `postcss.config.js`:

```js
// postcss.config.js
const babelConfig = require("./babel.config");

module.exports = {
  plugins: {
    "@stylexjs/postcss-plugin": {
      include: [
        "src/**/*.{js,jsx,ts,tsx}",
        "app/**/*.{js,jsx,ts,tsx}",
        "pages/**/*.{js,jsx,ts,tsx}",
        "components/**/*.{js,jsx,ts,tsx}",
      ],
      babelConfig: {
        babelrc: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: babelConfig.plugins,
      },
      useCSSLayers: true,
    },
    autoprefixer: {},
  },
};
```

Add the `@stylex` directive to your CSS file:

```css
/* app/globals.css */
@stylex;
```

##### Webpack

```js
// webpack.config.js
const stylex = require("@stylexjs/unplugin");

module.exports = {
  plugins: [
    stylex.webpack({
      useCSSLayers: true,
    }),
  ],
};
```

##### Rspack

```js
// rspack.config.js
const stylex = require("@stylexjs/unplugin");

module.exports = {
  plugins: [
    stylex.rspack({
      useCSSLayers: true,
    }),
  ],
};
```

##### esbuild

```js
// build.js
const esbuild = require("esbuild");
const stylex = require("@stylexjs/unplugin");

esbuild.build({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outdir: "dist",
  plugins: [
    stylex.esbuild({
      useCSSLayers: true,
    }),
  ],
});
```

##### Rollup

```js
// rollup.config.js
import stylex from "@stylexjs/unplugin";

export default {
  plugins: [
    stylex.rollup({
      useCSSLayers: true,
    }),
  ],
};
```

#### 3. Create a CSS entrypoint

Import a CSS file from your app root. During build, the StyleX plugin appends its aggregated output to that CSS file:

```css
/* src/index.css */
@stylex;
```

Import this CSS file in your app entry:

```tsx
import "./index.css";
```

### Common configuration options

#### Babel plugin options

| Option                      | Type    | Default                | Description                                                                                                         |
| --------------------------- | ------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `dev`                       | boolean | false                  | Enable development mode with readable class names                                                                   |
| `runtimeInjection`          | boolean | false                  | Inject styles at runtime (not recommended for production)                                                           |
| `treeshakeCompensation`     | boolean | false                  | Prevent tree-shaking from removing styles                                                                           |
| `aliases`                   | object  | {}                     | Path aliases matching your bundler config                                                                           |
| `unstable_moduleResolution` | object  | undefined              | Module resolution strategy for theming APIs                                                                         |
| `classNamePrefix`           | string  | 'x'                    | Prefix for generated class names                                                                                    |
| `importSources`             | array   | ['@stylexjs/stylex']   | Custom import sources for StyleX                                                                                    |
| `styleResolution`           | string  | 'property-specificity' | Style merge strategy: 'application-order' (last style wins) or 'property-specificity' (more specific property wins) |

#### Unplugin and PostCSS options

These options are available for unplugin (Vite, Webpack, Rspack, esbuild, Rollup) and the PostCSS plugin:

| Option         | Type     | Default                  | Description                                        |
| -------------- | -------- | ------------------------ | -------------------------------------------------- |
| `useCSSLayers` | boolean  | false                    | Wrap output in `@layer` for better cascade control |
| `include`      | string[] | ['**/*.{js,jsx,ts,tsx}'] | Files to process                                   |
| `exclude`      | string[] | ['node_modules/**']      | Files to exclude                                   |

### TypeScript setup

StyleX packages include TypeScript definitions. No additional configuration is needed.

For strict typing of style props, use the exported types:

```tsx
import type { StyleXStyles } from "@stylexjs/stylex";

type Props = {
  style?: StyleXStyles<{
    color?: string;
    backgroundColor?: string;
  }>;
};
```

### ESLint setup

Install the ESLint plugin:

```bash
npm install --save-dev @stylexjs/eslint-plugin
```

Configure ESLint:

```js
// .eslintrc.js
module.exports = {
  plugins: ["@stylexjs"],
  rules: {
    "@stylexjs/valid-styles": "error",
    "@stylexjs/no-unused": "error",
    "@stylexjs/valid-shorthands": "warn",
    "@stylexjs/sort-keys": "warn",
  },
};
```

Or for flat config:

```js
// eslint.config.js
import stylexPlugin from "@stylexjs/eslint-plugin";

export default [
  {
    plugins: {
      "@stylexjs": stylexPlugin,
    },
    rules: {
      "@stylexjs/valid-styles": "error",
      "@stylexjs/no-unused": "error",
      "@stylexjs/valid-shorthands": "warn",
      "@stylexjs/sort-keys": "warn",
    },
  },
];
```

Available rules:

- `@stylexjs/valid-styles` - Validates style definitions
- `@stylexjs/no-unused` - Flags unused style definitions
- `@stylexjs/valid-shorthands` - Warns about shorthand property usage
- `@stylexjs/sort-keys` - Enforces sorted style keys
- `@stylexjs/enforce-extension` - Enforces `.stylex.js` extension for theme files

### CLI tool

StyleX provides a CLI for processing files outside of a bundler:

```bash
npm install --save-dev @stylexjs/cli

npx stylex --input ./src --output ./dist
```

### Troubleshooting

#### Styles not appearing

1. Ensure the CSS file with `@stylex` is imported
2. Check that files are included in the `include` pattern
3. Verify the plugin runs before other transforms

#### StyleX precedence

When adding StyleX to an app with existing CSS, use the `useCSSLayers` config to determine style precedence. For StyleX to override existing styles, `useCSSLayers: false`. Otherwise, use `useCSSLayers: true` for all other cases.

#### Build performance

- Use `include`/`exclude` options to limit processed files
- Set `treeshakeCompensation: true` if styles are being removed

### More resources

- Official documentation: https://stylexjs.com
- Example projects: https://github.com/facebook/stylex/tree/main/examples

---

## Authoring Guide

This document provides guidance on authoring styles with StyleX.

### Writing styles

Styles must be created using `stylex.create()`. Define styles as an object with namespaces containing CSS properties.

```tsx
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  container: {
    display: "flex",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "navy",
  },
});
```

**IMPORTANT**

- Use longhand properties and single-value shorthands over multi-value shorthands.
- Use `null` to unset properties.
- Length properties are in pixels by default.

---

### Applying styles

Convert StyleX style objects to props using `stylex.props()`:

```tsx
function Component() {
  return (
    <div {...stylex.props(styles.container)}>
      <h1 {...stylex.props(styles.title)}>Hello</h1>
    </div>
  );
}
```

#### Merging styles

Pass multiple styles to merge them. The last style wins for conflicting properties:

```tsx
// styles.highlighted overrides conflicting properties from styles.base
<div {...stylex.props(styles.base, styles.highlighted)} />

// Or passed in as arrays
<div {...stylex.props([styles.base, styles.highlighted])} />
```

#### Conditional styles

Use JavaScript expressions for conditional styling:

```tsx
<div
  {...stylex.props(
    styles.base,
    isActive && styles.active,
    isDisabled && styles.disabled,
    variant === "primary" ? styles.primary : styles.secondary,
  )}
/>
```

#### Passing styles as props

Accept styles from parent components:

```tsx
import type { StyleXStyles } from "@stylexjs/stylex";

type Props = {
  children: React.ReactNode;
  style?: StyleXStyles;
};

const styles = stylex.create({
  card: {
    padding: 16,
    borderRadius: 8,
  },
});

function Card({ children, style }: Props) {
  // Local styles first, then prop styles (so props can override)
  return <div {...stylex.props(styles.card, style)}>{children}</div>;
}
```

#### Unsetting styles

Use `null` to remove a style property:

```tsx
const styles = stylex.create({
  base: { margin: 16, padding: 16 },
  reset: { margin: null, padding: null }, // Removes margin and padding
});

<div {...stylex.props(styles.base, styles.reset)} />;
```

---

### Pseudo-classes

Nest pseudo-classes within property values using an object with `default` and pseudo-class keys:

```tsx
const styles = stylex.create({
  button: {
    backgroundColor: {
      default: "lightblue",
      ":hover": "blue",
      ":active": "darkblue",
      ":focus-visible": "royalblue",
      ":disabled": "gray",
    },
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
  },
});
```

Recommended pseudo-classes include:

- `:hover`, `:active`, `:focus`, `:focus-visible`, `:focus-within`

**IMPORTANT: Prefer JS changes over `:first-child` and `:nth-child` pseudo-elements. This reduces CSS bundle size.**

---

### Pseudo-elements

Define pseudo-elements as top-level keys within a style namespace:

```tsx
const styles = stylex.create({
  input: {
    color: "black",
    "::placeholder": {
      color: "gray",
      fontStyle: "italic",
    },
    "::selection": {
      backgroundColor: "yellow",
    },
  },
});
```

**IMPORTANT: Prefer actual HTML elements over `::before` and `::after` pseudo-elements. This reduces CSS bundle size and improves accessibility.**

---

### Media queries and @-rules

Nest media queries within property values:

```tsx
const styles = stylex.create({
  container: {
    flexDirection: {
      default: "column",
      "@media (min-width: 768px)": "row",
    },
    padding: {
      default: 8,
      "@media (min-width: 768px)": 16,
      "@media (min-width: 1024px)": 24,
    },
  },
});
```

**For app-wide breakpoints, use `stylex.defineConsts()` to define shareable media query constants:**

Other supported @-rules include `@supports` and `@container` queries.

**IMPORTANT: The `default` key is required when using nested conditions. Use `null` when no style should apply for the default case.**

---

### Dynamic styles

Use arrow functions for runtime values:

```tsx
const styles = stylex.create({
  bar: (width: number) => ({
    width,
  }),
  positioned: (x: number, y: number) => ({
    transform: `translate(${x}px, ${y}px)`,
  }),
});

<div {...stylex.props(styles.bar(100))} />
<div {...stylex.props(styles.positioned(mouseX, mouseY))} />
```

---

### Defining constants

Use `stylex.defineConsts()` for shareable media queries and static values like animations, colors, and font sizes that aren't themed.

**IMPORTANT: Use `defineConsts` over `defineVars` when values don't need to be themed or overridden at runtime.**

```tsx
// constants.stylex.ts
import * as stylex from "@stylexjs/stylex";

export const breakpoints = stylex.defineConsts({
  small: "@media (max-width: 600px)",
  medium: "@media (min-width: 601px) and (max-width: 1024px)",
  large: "@media (min-width: 1025px)",
});

export const zIndices = stylex.defineConsts({
  modal: "1000",
  tooltip: "1100",
  toast: "1200",
});
```

---

### Defining variables

Use `stylex.defineVars()` when values need theming or runtime overrides. Must be in `.stylex.ts` files:

```tsx
// tokens.stylex.ts
import * as stylex from "@stylexjs/stylex";

export const colors = stylex.defineVars({
  primary: "blue",
  secondary: "gray",
  text: "black",
  background: "white",
});

export const spacing = stylex.defineVars({
  small: "8px",
  medium: "16px",
  large: "24px",
});
```

---

### Using variables and constants

Import and use variables and constants in your styles:

```tsx
import * as stylex from "@stylexjs/stylex";
import { colors, spacing } from "./tokens.stylex";

const styles = stylex.create({
  container: {
    backgroundColor: colors.background,
    color: colors.text,
    padding: spacing.medium,
  },
});
```

**IMPORTANT: For `defineConsts` and `defineVars`:**

- Must be in `.stylex.ts` or `.stylex.js` files
- Must be named exports (not default exports)
- No other exports allowed in the file

---

### Creating themes

Override variable values for DOM sub-trees using `stylex.createTheme()`:

```tsx
import * as stylex from "@stylexjs/stylex";
import { colors } from "./tokens.stylex";

export const darkTheme = stylex.createTheme(colors, {
  primary: "lightblue",
  text: "white",
  background: "#1a1a1a",
});

// Apply theme to a container
function App({ isDark, children }) {
  return (
    <div {...stylex.props(isDark && darkTheme)}>
      {children} {/* All descendants use theme values */}
    </div>
  );
}
```

Unlike `defineVars`, themes can be created anywhere and passed across files/components.

---

### Relational selectors

Style elements based on the state of ancestors, descendants, or siblings using `stylex.when.*` selectors: `stylex.when.ancestor()`, `stylex.when.descendant()`, `stylex.when.anySibling()`, `stylex.when.siblingBefore()`, `stylex.when.siblingAfter()`.

Mark the observed element with `stylex.defaultMarker()` or create custom markers using `stylex.defineMarker()`.

```tsx
const styles = stylex.create({
  card: {
    transform: {
      default: "translateX(0)",
      [stylex.when.ancestor(":hover")]: "translateX(10px)",
    },
  },
});

<div {...stylex.props(stylex.defaultMarker())}>
  <div {...stylex.props(styles.card)}>Hover the parent to move me</div>
</div>;
```

---

### Fallback styles

Use `stylex.firstThatWorks()` for browser compatibility fallbacks:

```tsx
const styles = stylex.create({
  header: {
    position: stylex.firstThatWorks("sticky", "-webkit-sticky", "fixed"),
    display: stylex.firstThatWorks("grid", "flex"),
  },
});
```

---

### Keyframe animations

Define animations with `stylex.keyframes()`:

```tsx
const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const slideIn = stylex.keyframes({
  "0%": { transform: "translateX(-100%)" },
  "100%": { transform: "translateX(0)" },
});

const styles = stylex.create({
  animated: {
    animationName: fadeIn,
    animationDuration: "0.3s",
    animationTimingFunction: "ease-out",
  },
});
```

---

### View transitions

Use `stylex.viewTransitionClass()` to customize View Transition API animations:

```tsx
import * as stylex from "@stylexjs/stylex";
import { unstable_ViewTransition as ViewTransition } from "react";

const fadeInUp = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(-30px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

const transitionClass = stylex.viewTransitionClass({
  group: {/* ::view-transition-group styles */},
  imagePair: {/* ::view-transition-image-pair styles */},
  old: { animationDuration: "2s" },
  new: { animationName: fadeInUp },
});

<ViewTransition default={transitionClass}>{/* ... */}</ViewTransition>;
```

---

### Anchor positioning

Use `stylex.positionTry()` to define CSS anchor positioning fallbacks:

```tsx
const fallback = stylex.positionTry({
  positionAnchor: "--anchor",
  top: "0",
  left: "0",
  width: "100px",
  height: "100px",
});

const styles = stylex.create({
  tooltip: {
    positionTryFallbacks: fallback,
  },
});
```

---

### TypeScript integration

Use `StyleXStyles` and `StyleXStylesWithout` over `StaticStyles` and `StaticStylesWithout` for type-safe style objects.

#### StyleXStyles

Accept any StyleX styles:

```tsx
import type { StyleXStyles } from "@stylexjs/stylex";

type Props = {
  style?: StyleXStyles;
};
```

Constrain to specific properties:

```tsx
type Props = {
  style?: StyleXStyles<{
    color?: string;
    backgroundColor?: string;
  }>;
};
```

#### StyleXStylesWithout

Exclude specific properties:

```tsx
import type { StyleXStylesWithout } from "@stylexjs/stylex";

type Props = {
  // Allow all styles except layout properties
  style?: StyleXStylesWithout<{
    margin: unknown;
    padding: unknown;
    width: unknown;
    height: unknown;
  }>;
};
```

#### VarGroup

Types for variable groups:

```tsx
import type { VarGroup } from "@stylexjs/stylex";
import { colors } from "./tokens.stylex";

function ThemeProvider({ theme }: { theme: VarGroup<typeof colors> }) {
  return <div {...stylex.props(theme)}>{children}</div>;
}
```

---

### Common antipatterns

**IMPORTANT: Avoid these common mistakes:**

#### Don't import non-StyleX values

```tsx
// invalid: imported non-StyleX variable
import { PADDING } from "./constants";
const styles = stylex.create({
  container: { padding: PADDING },
});

// valid: use StyleX constants or variables
import { spacing } from "./tokens.stylex";
const styles = stylex.create({
  container: { padding: spacing.medium },
});
```

#### Don't use `style` or `className` props

Do not apply `style` or `className` props on an element with a `stylex.props()` spread.

```tsx
// invalid: no `classname` and `style` prop usage
<div className="m-10" style={style} {...stylex.props(styles.container)} />

// valid
<div {...stylex.props(styles.container)} />
```

#### Don't use media queries or pseudo-classes at the top level

Media queries and pseudo-classes must be nested inside property values, not at the top level of a style object.

```tsx
// invalid: media query at top level
const styles = stylex.create({
  container: {
    "@media (min-width: 768px)": {
      padding: 16,
    },
  },
});

// invalid: pseudo-class at top level
const styles = stylex.create({
  button: {
    ":hover": {
      backgroundColor: "blue",
    },
  },
});

// valid: nest inside property values
const styles = stylex.create({
  container: {
    padding: {
      default: 8,
      "@media (min-width: 768px)": 16,
    },
  },
  button: {
    backgroundColor: {
      default: "lightblue",
      ":hover": "blue",
    },
  },
});
```

---

### More resources

- Official documentation: https://stylexjs.com
- API reference: https://stylexjs.com/docs/api
- GitHub repository: https://github.com/facebook/stylex
