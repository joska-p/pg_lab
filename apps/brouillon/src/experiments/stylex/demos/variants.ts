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
export const tintBackgroundVariants = [true, false];
export const tintBorderVariants = [true, false];
export const tintShadowVariants = [true, false];
export const bgVariants = ['soft', 'solid'] as Background[];

export interface SurfaceVariant {
    readonly label: string;
    readonly color: ColorNames;
    readonly elevation: Elevation;
    readonly tintBackground: boolean;
    readonly tintBorder: boolean;
    readonly tintShadow: boolean;
    readonly bg: Background;
}

export function buildSurfaceVariants(filter: VariantFilter): SurfaceVariant[] {
    const variants: SurfaceVariant[] = [];

    for (const color of filter.colors) {
        for (const elevation of filter.elevations) {
            for (const bg of filter.bgs) {
                for (const tintBackground of filter.tintBackground) {
                    for (const tintBorder of filter.tintBorder) {
                        for (const tintShadow of filter.tintShadow) {
                            variants.push({
                                label: `${color}-${elevation}-${bg}-bg:${tintBackground}-border:${tintBorder}-shadow:${tintShadow}`,
                                color,
                                elevation,
                                bg,
                                tintBackground,
                                tintBorder,
                                tintShadow,
                            });
                        }
                    }
                }
            }
        }
    }

    return variants;
}

export interface VariantFilter {
    readonly colors: ColorNames[];
    readonly elevations: Elevation[];
    readonly bgs: Background[];
    readonly tintBackground: boolean[];
    readonly tintBorder: boolean[];
    readonly tintShadow: boolean[];
}

export const VARIANT_PROPERTY_OPTIONS = {
    colors: colorVariants,
    elevations: elevationVariants,
    bgs: bgVariants,
    tintBackground: tintBackgroundVariants,
    tintBorder: tintBorderVariants,
    tintShadow: tintShadowVariants,
} as const satisfies { [K in keyof VariantFilter]: readonly VariantFilter[K][number][] };

export const VARIANT_PROPERTIES = [
    { property: 'colors', label: 'Color' },
    { property: 'elevations', label: 'Elevation' },
    { property: 'bgs', label: 'Background' },
    { property: 'tintBackground', label: 'Tint background' },
    { property: 'tintBorder', label: 'Tint border' },
    { property: 'tintShadow', label: 'Tint shadow' },
] as const satisfies readonly { property: keyof VariantFilter; label: string }[];

export const DEFAULT_CARD_FILTER: VariantFilter = {
    colors: ['neutral', 'aurora'],
    elevations: ['flat'],
    bgs: ['soft'],
    tintBackground: [true],
    tintBorder: [true],
    tintShadow: [true],
};

export const DEFAULT_COMPONENT_FILTER: VariantFilter = {
    colors: ['aurora', 'neutral'],
    elevations: ['raised'],
    bgs: ['solid'],
    tintBackground: [true],
    tintBorder: [true],
    tintShadow: [true],
};
