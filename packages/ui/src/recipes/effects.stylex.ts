import * as stylex from '@stylexjs/stylex';

import { colors } from '../tokens/colors.stylex';
import { shadowColor, shadows } from '../tokens/shadows.stylex';

export const fx = stylex.defineConsts({
    glowSubtleBlur: '5px',
    glowBlur: '8px',
    glowStrongBlur: '12px',
    glowRing: '6px',
    glowRingCast: '55%',

    glassBlur: '24px',
    glassSaturate: '180%',
    glassTint: '45%',
    glassCastA: '22%',
    glassCastB: '15%',

    blurSm: '3px',
    blurMd: '8px',
    blurLg: '16px',
    blurFab: '8px saturate(1.4)',
});

export const elevation = stylex.create({
    flat: {
        boxShadow: 'none',
    },
    raised: {
        boxShadow: shadows.raised,
    },
    sunken: {
        boxShadow: shadows.sunken,
    },
    floating: {
        boxShadow: shadows.floating,
    },
});

export const glass = stylex.create({
    glass: {
        backgroundColor: `color-mix(in oklab, ${colors.background} ${fx.glassTint}, transparent)`,
        backdropFilter: `blur(${fx.glassBlur}) saturate(${fx.glassSaturate})`,
        boxShadow: `0 8px 28px color-mix(in oklab, ${shadowColor.color} ${fx.glassCastA}, transparent), 0 2px 8px color-mix(in oklab, ${shadowColor.color} ${fx.glassCastB}, transparent)`,
    },
    blurSm: {
        backdropFilter: `blur(${fx.blurSm})`,
        WebkitBackdropFilter: `blur(${fx.blurSm})`,
    },
    blurMd: {
        backdropFilter: `blur(${fx.blurMd})`,
        WebkitBackdropFilter: `blur(${fx.blurMd})`,
    },
    blurLg: {
        backdropFilter: `blur(${fx.blurLg})`,
        WebkitBackdropFilter: `blur(${fx.blurLg})`,
    },
    blurFab: {
        backdropFilter: fx.blurFab,
        WebkitBackdropFilter: fx.blurFab,
    },
});

export const glow = stylex.create({
    glow: {
        filter: `drop-shadow(0 0 ${fx.glowBlur} currentColor)`,
    },
    glowSubtle: {
        filter: `drop-shadow(0 0 ${fx.glowSubtleBlur} currentColor)`,
    },
    glowStrong: {
        filter: `drop-shadow(0 0 ${fx.glowStrongBlur} currentColor)`,
    },
    glowWithPress: {
        boxShadow: {
            default: `0 0 ${fx.glowRing} color-mix(in oklab, ${shadowColor.color} ${fx.glowRingCast}, transparent), ${shadows.rest}`,
            ':hover': `0 0 ${fx.glowRing} color-mix(in oklab, ${shadowColor.color} ${fx.glowRingCast}, transparent), ${shadows.hover}`,
            ':active': `0 0 ${fx.glowRing} color-mix(in oklab, ${shadowColor.color} ${fx.glowRingCast}, transparent), ${shadows.active}`,
            ':focus-visible': `0 0 ${fx.glowRing} color-mix(in oklab, ${shadowColor.color} ${fx.glowRingCast}, transparent), ${shadows.rest}, 0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
        },
    },
});
