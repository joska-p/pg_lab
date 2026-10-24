import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';
import type Color from 'colorjs.io';

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
    return color.to('lch').toString({ precision: 3 });
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
                    key={`${palette.colors.join()}-${paletteIndex}`}
                    {...stylex.props(styles.palette)}
                >
                    {palette.colors.map((color, colorIndex) => (
                        <div
                            key={`${color.to('lch').toString()}-${colorIndex}`}
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
