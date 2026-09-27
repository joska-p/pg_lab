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

export function getSurfaceVariants(): SurfaceVariant[] {
    const variants: SurfaceVariant[] = [];

    for (const color of colorVariants) {
        for (const elevation of elevationVariants) {
            for (const bg of bgVariants) {
                for (const tintBackground of tintBackgroundVariants) {
                    for (const tintBorder of tintBorderVariants) {
                        for (const tintShadow of tintShadowVariants) {
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
