import { space, typography } from '@repo/ui/tokens/const.stylex';
import { colors } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';

import { usePixel } from '../../../react/usePixel';
import { imageDataToUrl } from '../../imageLoader';

const STEPS = [
    { id: 'brightness', options: { value: 1.2 } },
    { id: 'contrast', options: { value: 1.3 } },
    { id: 'sharpen', options: { strength: 1.5 } },
] as const;

const STEP_LABELS = ['brightness', 'contrast', 'sharpen'] as const;

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
    },
    description: {
        opacity: 0.6,
        fontSize: typography.fontSizeXs,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: space['3'],
    },
    cell: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
    },
    label: {
        fontSize: '0.625rem',
        fontWeight: typography.fontWeightMedium,
        textTransform: 'uppercase' as const,
        letterSpacing: typography.letterSpacingWide,
        opacity: 0.6,
    },
    image: {
        width: '100%',
        borderRadius: '0.25rem',
        borderWidth: '1px',
        borderStyle: 'solid' as const,
        borderColor: `color-mix(in oklab, ${colors.neutral} 25%, transparent)`,
    },
    dimensions: {
        fontSize: '0.625rem',
        opacity: 0.5,
    },
});

function ChainDemo({ sourceData }: { sourceData: ImageData | null }) {
    const result = usePixel(sourceData, STEPS);

    return (
        <div {...stylex.props(styles.root)}>
            <p {...stylex.props(styles.description)}>
                Runs brightness → contrast → sharpen in a single off-thread invocation. All three
                pixel ops are fused into one pass.
            </p>
            <div {...stylex.props(styles.grid)}>
                {result.map((imageData, index) => (
                    <div key={index} {...stylex.props(styles.cell)}>
                        <p {...stylex.props(styles.label)}>
                            {index === 0 ? 'Source' : (STEP_LABELS[index - 1] ?? '')}
                        </p>
                        <img
                            src={imageDataToUrl(imageData) ?? ''}
                            alt={`step ${String(index)}`}
                            style={{ imageRendering: 'pixelated' }}
                            {...stylex.props(styles.image)}
                        />
                        <p {...stylex.props(styles.dimensions)}>
                            {imageData.width}×{imageData.height}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export { ChainDemo };
