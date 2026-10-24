import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

import { usePixel } from '../../../react/usePixel';
import { imageDataToUrl } from '../helpers';

const STEPS = [
    { id: 'brightness', options: { value: 1.2 } },
    { id: 'contrast', options: { value: 1.3 } },
    { id: 'sharpen', options: { strength: 1.5 } },
] as const;

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
    },
    intro: {
        margin: 0,
        fontSize: typography.fontSizeXs,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
    grid: {
        display: 'grid',
        gap: space['3'],
        gridTemplateColumns: 'repeat(4, 1fr)',
    },
    cell: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
    },
    label: {
        margin: 0,
        fontSize: '10px',
        fontWeight: typography.fontWeightMedium,
        letterSpacing: typography.letterSpacingWide,
        textTransform: 'uppercase',
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
    image: {
        width: '100%',
        height: 'auto',
        borderRadius: '6px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        imageRendering: 'pixelated',
        display: 'block',
    },
    size: {
        margin: 0,
        marginTop: space['1'],
        fontSize: '10px',
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
});

function ChainDemo({ sourceData }: { sourceData: ImageData | null }) {
    const result = usePixel(sourceData, STEPS);

    return (
        <div {...stylex.props(styles.root)}>
            <p {...stylex.props(styles.intro)}>
                Runs brightness → contrast → sharpen in a single off-thread invocation. All three
                pixel ops are fused into one pass.
            </p>
            <div {...stylex.props(styles.grid)}>
                {result.map((imageData, index) => (
                    <div key={index} {...stylex.props(styles.cell)}>
                        <p {...stylex.props(styles.label)}>
                            {index === 0 ? 'Source' : (STEPS[index - 1]?.id ?? '')}
                        </p>
                        <img
                            src={imageDataToUrl(imageData) ?? ''}
                            alt={`step ${String(index)}`}
                            {...stylex.props(styles.image)}
                        />
                        <p {...stylex.props(styles.size)}>
                            {imageData.width}×{imageData.height}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export { ChainDemo };
