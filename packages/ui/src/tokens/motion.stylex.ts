import * as stylex from '@stylexjs/stylex';

export const motion = stylex.defineConsts({
    durationFast: '120ms',
    durationNormal: '200ms',
    durationSlow: '320ms',
    easingOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easingInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    easingLinear: 'linear',
    iterationInfinite: 'infinite',
});
