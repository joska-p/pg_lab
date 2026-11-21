---
name: PG_LAB
description: A dark-first creative coding workbench with neon-tinted surfaces and tactile controls.
colors:
    dark-ground: 'oklch(0.277 0 0)'
    dark-ground-hard: 'oklch(0.241 0.005 219.672)'
    dark-ground-soft: 'oklch(0.311 0.003 48.619)'
    warm-parchment: 'oklch(0.956 0.055 96.155)'
    warm-parchment-hard: 'oklch(0.965 0.039 100.862)'
    neutral: 'oklch(0.411 0.012 51.866)'
    gray-mid: 'oklch(0.619 0.029 67.258)'
    aurora: 'oklch(0.693 0.042 169.768)'
    solder: 'oklch(0.765 0.158 110.835)'
    purple: 'oklch(0.705 0.098 2.189)'
    amber: 'oklch(0.832 0.159 82.987)'
    error: 'oklch(0.66 0.218 30.392)'
    aqua: 'oklch(0.756 0.108 137.676)'
    orange: 'oklch(0.731 0.182 51.693)'
typography:
    label:
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize: '0.875rem'
        fontWeight: 500
        lineHeight: 1.25
        letterSpacing: '-0.01em'
    heading:
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        fontSize: '1.125rem'
        fontWeight: 600
        lineHeight: 1.25
        letterSpacing: '0.02em'
    value:
        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
        fontSize: '0.875rem'
        fontWeight: 400
        lineHeight: 1.5
    section:
        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
        fontSize: '0.75rem'
        fontWeight: 500
        lineHeight: 1.25
        letterSpacing: '0.02em'
rounded:
    none: '0px'
    sm: '4px'
    md: '6px'
    lg: '8px'
    xl: '12px'
    full: '9999px'
spacing:
    '0': '0px'
    '1': '4px'
    '2': '8px'
    '3': '12px'
    '4': '16px'
    '5': '20px'
    '6': '24px'
    '8': '32px'
    '10': '40px'
    '12': '48px'
    '16': '64px'
components:
    button-primary:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.warm-parchment}'
        rounded: '{rounded.md}'
        padding: '8px 16px'
    button-primary-hover:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.warm-parchment}'
    badge-solid:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.warm-parchment}'
        rounded: '{rounded.full}'
        padding: '2px 8px'
    card-soft:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.warm-parchment}'
        rounded: '{rounded.md}'
        padding: '16px'
    input-well:
        backgroundColor: '{colors.neutral}'
        textColor: '{colors.warm-parchment}'
        rounded: '{rounded.sm}'
        padding: '8px 12px'
    toggle-track:
        backgroundColor: '{colors.neutral}'
        rounded: '{rounded.full}'
        width: '34px'
        height: '20px'
---

# Design System: PG_LAB

<!-- impeccable:design-map -->

Name: PG_LAB
Colors: primary: aurora oklch(0.693 0.042 169.768); secondary: solder oklch(0.765 0.158 110.835); neutral: dark-ground oklch(0.277 0 0); primary: error oklch(0.66 0.218 30.392) (+10 more in the sidecar)
Fonts: system-ui (label, heading); SFMono-Regular (value, section)
Spacing: 0 0px, 1 4px, 2 8px, 3 12px, 4 16px, 5 20px, 6 24px, 8 32px, 10 40px, 12 48px, 16 64px
Radius: none 0px, sm 4px, md 6px, lg 8px, xl 12px, full 9999px
North Star: "The Neon Workbench"
Rules:

- The Tint Inheritance Rule. Every colored surface sets `tintVars.color` and `tintVars.onColor` together.
- The Three-Register Rule. No hue exists as a single value.
- The Two-Voice Rule. Sans-serif names things; monospace measures things.
- The Glow-as-State Rule. Glow is never decorative.
- The Structural Shadow Rule. Shadows separate surfaces (stage from panel, well from panel).
  Elevation:
- Flat: none
- Raised: 0 1px 2px color-mix(in oklab, oklch(0.241 0.005 219.672) 18%, transparent), 0 0 12px -2px color-mix(in oklab, tintVars.color 18%, transparent)
- Sunken: inset 0 1px 2px color-mix(in oklab, oklch(0.241 0.005 219.672) 26%, transparent), inset 0 3px 8px color-mix(in oklab, tintVars.color 20%, color-mix(in oklab, oklch(0.241 0.005 219.672) 30%, transparent))
- Hover glow: 0 1px 3px color-mix(in oklab, oklch(0.241 0.005 219.672) 22%, transparent), 0 0 20px -2px color-mix(in oklab, tintVars.color 32%, transparent)
- Active glow: 0 1px 2px color-mix(in oklab, oklch(0.241 0.005 219.672) 20%, transparent), 0 0 28px -1px color-mix(in oklab, tintVars.color 48%, transparent)
  Don't:
- Don't apply a permanent glow or shadow as decoration.
- Don't use hardcoded color values inside `packages/ui` components.
- Don't mix sans-serif and monospace within a single text element.
- Don't introduce new hues outside the eight named tints (neutral, aurora, solder, purple, amber, error, aqua, orange).
- Don't add ad-hoc circular radii.
  Do:
- Do set `tintVars.color` and `tintVars.onColor` together on every tinted surface.
- Do use `color-mix(in oklab, ...)` for all tint-derived backgrounds, borders, and shadows.
- Do use `light-dark()` for every color that adapts to theme.
- Do respect `prefers-reduced-motion: reduce` on every transition.
- (+2 more)
  Map: packages/ui
  Full: .impeccable/design-full.md (read a section when you need its detail)
