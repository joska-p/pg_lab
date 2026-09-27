import type { Background, ColorNames, Elevation, SurfaceTint } from '../styles.stylex';

export const colorVariants = [
    'neutral',
    'aurora',
    'solder',
    'purple',
    'amber',
    'error',
    'aqua',
    'orange',
] as ColorNames[];

export const elevationVariants = ['sunken', 'flat', 'raised'] as Elevation[];

export const staticVariants = [
    { bg: 'solid', tint: 'tinted', label: 'solid tinted' },
    { bg: 'solid', tint: 'accented', label: 'solid accented' },
    { bg: 'soft', tint: 'tinted', label: 'soft accented' },
    { bg: 'soft', tint: 'accented', label: 'soft accented' },
] as const satisfies ReadonlyArray<{ bg: Background; tint: SurfaceTint; label: string }>;
