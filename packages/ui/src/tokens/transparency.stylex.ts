import * as stylex from '@stylexjs/stylex';

// Opacity knobs for glass surfaces. Each value is the share of the opaque
// color kept when mixed toward transparent with color-mix.
// Higher = more readable, lower = more background chaos shows through.
//
// Only usable inside template strings (stylex.create / defineVars).
// defineConsts requires static values, so fx keeps its own literals.
export const transparency = stylex.defineConsts({
    // Large glass veils (Stage, floating panel)
    veil: '45%',
    veilShadowA: '22%',
    veilShadowB: '15%',

    // Cards and popovers always sit inside a blurred veil, so they only need
    // translucency. No backdrop-filter of their own: stacked blurs would be
    // the real performance cost, color-mix itself resolves once and is static.
    surfaceLight: '80%',
    surfaceDark: '72%',

    popoverLight: '85%',
    popoverDark: '80%',

    mutedLight: '82%',
    mutedDark: '78%',

    inputLight: '85%',
    inputDark: '80%',

    edgeLight: '60%',
    edgeDark: '55%',
});
