import type { Background, Elevation } from '../ui/surface.stylex';
import type { ColorNames } from '../ui/tint.stylex';

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

// `bg` (solid/soft) n'a d'effet que quand tintBackground est true, donc pas
// de variante "accented" x bg : elle rendrait deux fois la meme chose (voir
// surface.stylex.ts, surfaceStyles() n'applique `backgrounds[bg]` que si
// `background` est true).
export const surfaceVariants = [
    { label: 'accented', tintBackground: false, tintBorder: true, tintShadow: true, bg: 'solid' },
    {
        label: 'tinted solid',
        tintBackground: true,
        tintBorder: true,
        tintShadow: true,
        bg: 'solid',
    },
    { label: 'tinted soft', tintBackground: true, tintBorder: true, tintShadow: true, bg: 'soft' },
] as const satisfies ReadonlyArray<{
    label: string;
    tintBackground: boolean;
    tintBorder: boolean;
    tintShadow: boolean;
    bg: Background;
}>;
