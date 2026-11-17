# Design system — pg_lab

This folder holds the shared CSS layer for all experiments:

- `tokens.css` — design tokens (`--pg-*`), translated from the StyleX theme.
- `reset.css` — minimal reset + document base (`color-scheme`, focus-visible, inherited fonts).
- `shell.css` — shell layout (stage/panel, resizable handle, radial backgrounds).
- `controls.css` — shared building blocks (intro, status, native controls, canvas viewport,
  cards, sections, badges, empty/error/loading states, status pills).

## Tokens (`--pg-*`)

All tokens live in `tokens.css` and are overridden per theme via `[data-theme='dark']` on `<html>`.

| Category | Token                                     | Role                                       |
| -------- | ----------------------------------------- | ------------------------------------------ |
| Surface  | `--pg-surface-background`                 | Page, panel and stage background           |
| Surface  | `--pg-surface-foreground`                 | Primary text, titles                       |
| Text     | `--pg-color-neutral`                      | Fine borders only (not body text)          |
| Text     | `--pg-text-muted`                         | Secondary text, hints, labels              |
| Accent   | `--pg-color-aurora`                       | Primary buttons, active links, focus rings |
| Accent   | `--pg-color-solder`                       | Success / validation                       |
| Accent   | `--pg-color-amber`                        | Warning / loading                          |
| Accent   | `--pg-color-error`                        | Errors, deletion, alerts                   |
| Border   | `--pg-border-hairline` (1px)              | Component borders                          |
| Radius   | `--pg-radius-sm` / `--pg-radius-md`       | Rounded corners                            |
| Space    | `--pg-space-0` … `--pg-space-16`          | Margins and padding                        |
| Touch    | `--pg-layout-control-touch-target` (44px) | Min height of buttons / inputs             |
| Font     | `--pg-font-sans`                          | Interface text                             |
| Font     | `--pg-font-mono`                          | Code, stats, metadata                      |
| Motion   | `--pg-motion-duration-fast/normal/slow`   | Transition durations                       |
| Motion   | `--pg-motion-easing-out/in-out/linear`    | Easing curves                              |
| Layout   | `--pg-layout-text-max-width` (62ch)       | Max width for readable text                |
| Layout   | `--pg-layout-panel-width` (320px)         | Default panel width                        |

`--pg-text-muted` is the semantic token for secondary text. It is defined per theme and was
verified with WCAG 2.1 contrast against `--pg-surface-background`:

| Theme | Value         | Contrast | Result           |
| ----- | ------------- | -------- | ---------------- |
| Light | `--pg-dark3`  | 5.75:1   | AA (normal text) |
| Dark  | `--pg-light4` | 5.30:1   | AA (normal text) |

Use it instead of `--pg-color-neutral` for any text; the neutral token is reserved for borders.

**Rule**: never use hard-coded colors, spacing or sizes in experiment `styles.css`. Use only `--pg-*` tokens. Palette data colors (e.g. mosaic tile swatches) are the exception — they are data, not UI tokens.

## Shared components (`controls.css`)

| Class                                             | Role                                                         |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `.pg-intro` / `.pg-intro h1` / `.pg-lead`         | Experiment header block                                      |
| `.pg-status`                                      | Mono status line                                             |
| `.pg-shell__content button` / `.pg-button`        | Panel and standalone buttons (touch target, hover, disabled) |
| `.pg-control` / `.pg-control--inline`             | Label + native control row                                   |
| `.pg-control--stacked`                            | Full-width text input / textarea (long values)               |
| `.pg-control select/range/textarea/text/checkbox` | Styled native inputs                                         |
| `.pg-control output`                              | Mono readout for slider values                               |
| `[hidden]`                                        | Forces `display: none` over local `display: flex`            |
| `.pg-card`                                        | Container: border, radius, padding, surface background       |
| `.pg-section`                                     | Grouped controls with heading and top separator              |
| `.pg-badge`                                       | Small rounded label, mono text                               |
| `.pg-empty`                                       | Empty state: centered, muted text                            |
| `.pg-error`                                       | Error state: error border + muted error background           |
| `.pg-loading`                                     | Loading indicator (respects `prefers-reduced-motion`)        |
| `.pg-status-ok / -error / -pending`               | Status pills                                                 |
| `.pg-canvas-viewport` / `.pg-canvas`              | Shared canvas viewport (2D / WebGL)                          |
| `.pg-canvas--error` / `.pg-canvas__error`         | Canvas error overlay                                         |

`.pg-button` is the standalone form of the panel button style: both selectors share the same
rules, so existing panel buttons are unchanged. Use `.pg-button` for a button placed in a stage
or on a light page (homepage, art-canvas index), where `.pg-shell__content` is not an ancestor.

`[hidden]` uses `!important` because experiment-local rules such as `display: flex` on
`.pg-section` variants would otherwise override the user-agent `[hidden]` rule. This also covers
`.pg-section[hidden]` and any other hidden control group.

**Rule**: shared classes take precedence over experiment-local styles. Extend rather than duplicate.

## Page pattern

Every experiment page follows this skeleton:

```html
<pg-shell class="pg-shell" data-background="...">
    <section class="pg-shell__stage pg-bg--..." aria-label="...">
        <div class="pg-intro">
            <h1>Title</h1>
            <p class="pg-lead">One-line description.</p>
        </div>
        <!-- Experiment-specific content -->
        <p class="pg-status" data-status aria-live="polite">Initial state.</p>
    </section>
    <aside class="pg-shell__panel" aria-label="Controls">
        <button type="button" class="pg-shell__handle" aria-hidden="true" tabindex="-1">≶</button>
        <div class="pg-shell__content">
            <h2>Controls</h2>
            <!-- Native controls via ui/controls.ts -->
            <button type="button" data-theme-toggle>Thème</button>
        </div>
    </aside>
</pg-shell>
```

## Interaction & accessibility

- All buttons use `type="button"`.
- `:focus-visible` is styled in `reset.css`: `button`, `a`, `summary`, `[role='button']` and
  `[tabindex]` use a `--pg-color-aurora` outline; `input`, `select` and `textarea` keep their
  existing `currentColor` outline.
- `:disabled` buttons are styled in `controls.css` (opacity 0.5, `cursor: not-allowed`).
- All animations and transitions are disabled under `prefers-reduced-motion`.
- Controls carry ARIA attributes (`aria-label`, `aria-pressed`, `role="group"`, `role="radiogroup"`) where needed.
- No Shadow DOM. Light DOM only.

## Shell handle and portrait layout (`shell.css`)

The resize handle offsets are tokenized with `--pg-layout-control-touch-target` instead of hard-coded
`0.5rem`: `left: calc(-0.25 * …)` in landscape and `top: calc(-0.25 * …)` in portrait. In portrait,
`.pg-shell__panel` gets `max-width: 100%` so the stacked panel can use the full width. The panel no
longer has its own `overflow-y: auto`: scrolling belongs to `.pg-shell__content`.

## Theme

`ui/theme.ts` toggles `data-theme` on `<html>` (`light` / `dark`). CSS `color-scheme` and `--pg-*` overrides handle the rest without JS.
