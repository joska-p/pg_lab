import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { serializeLchCss } from '../core/color';
import type { Color } from '../core/types';
import { usePaletteBaseColor, usePalettePalettes } from '../stores/paletteStore';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: space['8'],
    },
    palette: {
        display: 'flex',
        gap: space['2'],
    },
    swatch: {
        width: space['10'],
        height: space['10'],
        flexShrink: 0,
    },
});

function colorCss(color: Color): string {
    return serializeLchCss(color, 3);
}

function Scene() {
    const palettes = usePalettePalettes();
    const baseColor = usePaletteBaseColor();

    return (
        <div {...stylex.props(styles.base)}>
            <div
                title={colorCss(baseColor)}
                {...stylex.props(styles.swatch)}
                style={{ backgroundColor: colorCss(baseColor) }}
            />

            {palettes.map((palette, paletteIndex) => (
                <div
                    key={`${palette.colors.map((color): string => colorCss(color)).join(',')}-${paletteIndex}`}
                    {...stylex.props(styles.palette)}
                >
                    {palette.colors.map((color, colorIndex) => (
                        <div
                            key={`${colorCss(color)}-${colorIndex}`}
                            title={colorCss(color)}
                            {...stylex.props(styles.swatch)}
                            style={{ backgroundColor: colorCss(color) }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export { Scene };
