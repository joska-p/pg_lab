import { focusRing, interactive } from '@repo/ui/recipes/interaction.stylex';
import { colors } from '@repo/ui/tokens/colors.stylex';
import { borderWidth, layout, radius, space } from '@repo/ui/tokens/layout.stylex';
import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';

import { applyPalette } from '../../stores/mosaic/actions';
import { useCurrentPalette, useCurrentPalettes } from '../../stores/mosaic/selectors';

const COLOR_KEYS = ['--color-0', '--color-1', '--color-2', '--color-3', '--color-4'] as const;

const styles = stylex.create({
    group: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: space['2'],
    },

    option: {
        appearance: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: layout.colorSwatchPad,
        margin: 0,
        padding: layout.colorSwatchPad,
        borderWidth: 0,
        borderRadius: radius.sm,
        backgroundColor: 'transparent',
    },

    ring: {
        boxShadow: `0 0 0 3px ${colors.ring}`,
    },

    strip: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: radius.sm,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: colors.border,
    },

    box: (color: string) => ({
        width: space['6'],
        height: space['6'],
        backgroundColor: color,
    }),
});

interface PalettePickerProps {
    style?: StyleXStyles;
}

function PalettePicker({ style }: PalettePickerProps) {
    const currentPalette = useCurrentPalette();
    const currentPalettes = useCurrentPalettes();

    return (
        <div role="radiogroup" aria-label="Color palettes" {...stylex.props(styles.group, style)}>
            {currentPalettes.map((palette, index) => {
                const selected = palette.id === currentPalette.id;

                return (
                    <button
                        key={palette.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={`Palette ${String(index + 1)} of ${String(currentPalettes.length)}`}
                        title={palette.id}
                        onClick={() => {
                            applyPalette(palette);
                        }}
                        {...stylex.props(
                            styles.option,
                            interactive.base,
                            focusRing.base,
                            selected ? styles.ring : null,
                        )}
                    >
                        <span aria-hidden {...stylex.props(styles.strip)}>
                            {COLOR_KEYS.map((colorKey) => (
                                <span
                                    key={colorKey}
                                    {...stylex.props(styles.box(palette[colorKey]))}
                                />
                            ))}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export { PalettePicker };
