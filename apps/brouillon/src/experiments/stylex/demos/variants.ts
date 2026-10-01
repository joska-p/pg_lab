import type { Background, Elevation, Borders } from '@repo/ui-next/recipes/surface';
import type { ColorNames } from '@repo/ui-next/tokens/tint.stylex';

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
export const backgroundVariants = ['none', 'soft', 'solid'] as Background[];
export const borderVariants = ['none', 'subtle', 'strong'] as Borders[];

export interface SurfaceVariant {
    readonly label: string;
    readonly color: ColorNames;
    readonly elevation: Elevation;
    readonly background: Background;
    readonly border: Borders;
}

export function buildSurfaceVariants(filter: VariantFilter): SurfaceVariant[] {
    const variants: SurfaceVariant[] = [];

    for (const color of filter.colors) {
        for (const background of filter.backgrounds) {
            for (const elevation of filter.elevations) {
                for (const border of filter.borders) {
                    variants.push({
                        label: `${color}-${elevation}-${background}-${border}`,
                        color,
                        elevation,
                        background,
                        border,
                    });
                }
            }
        }
    }

    return variants;
}

export interface VariantFilter {
    readonly colors: ColorNames[];
    readonly elevations: Elevation[];
    readonly backgrounds: Background[];
    readonly borders: Borders[];
}

export const VARIANT_PROPERTY_OPTIONS = {
    colors: colorVariants,
    elevations: elevationVariants,
    backgrounds: backgroundVariants,
    borders: borderVariants,
} as const satisfies { [K in keyof VariantFilter]: readonly VariantFilter[K][number][] };

export const VARIANT_PROPERTIES = [
    { property: 'colors', label: 'Color' },
    { property: 'elevations', label: 'Elevation' },
    { property: 'backgrounds', label: 'Background' },
    { property: 'borders', label: 'Border' },
] as const satisfies readonly { property: keyof VariantFilter; label: string }[];

export const DEFAULT_CARD_FILTER: VariantFilter = {
    colors: ['neutral', 'aurora'],
    elevations: ['flat'],
    backgrounds: ['soft'],
    borders: ['subtle'],
};

export const DEFAULT_COMPONENT_FILTER: VariantFilter = {
    colors: ['aurora', 'neutral'],
    elevations: ['raised'],
    backgrounds: ['solid'],
    borders: ['subtle'],
};
