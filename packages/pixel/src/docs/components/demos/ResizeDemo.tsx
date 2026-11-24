import { Button } from '@repo/ui/components/Button';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { colors } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { usePixel } from '../../../react/usePixel';
import { imageDataToUrl } from '../../imageLoader';

const MODES = [
    { id: 'width', label: 'Width (100px)', options: { width: 100 } as const },
    { id: 'height', label: 'Height (100px)', options: { height: 100 } as const },
    {
        id: 'fill',
        label: 'Fill (100×100)',
        options: { width: 100, height: 100, fit: 'fill' as const },
    },
    {
        id: 'contain',
        label: 'Contain (100×100)',
        options: { width: 100, height: 100, fit: 'contain' as const },
    },
    {
        id: 'cover',
        label: 'Cover (100×100)',
        options: { width: 100, height: 100, fit: 'cover' as const },
    },
] as const;

type ModeId = (typeof MODES)[number]['id'];

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['4'],
    },
    modes: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: space['2'],
    },
    resultRow: {
        display: 'flex',
        alignItems: 'center',
        gap: space['4'],
    },
    imageWrapper: {
        width: '5rem',
        flexShrink: 0,
    },
    image: {
        width: '100%',
        borderRadius: '0.25rem',
        borderWidth: '1px',
        borderStyle: 'solid' as const,
        borderColor: `color-mix(in oklab, ${colors.neutral} 25%, transparent)`,
    },
    dimensions: {
        opacity: 0.6,
        fontSize: typography.fontSizeXs,
    },
});

function ResizeDemo({ sourceData }: { sourceData: ImageData | null }) {
    const [selected, setSelected] = useState<ModeId>('width');
    const mode = MODES.find((m) => m.id === selected) ?? MODES[0];
    const steps = [{ id: 'resize', options: mode.options }] as const;
    const result = usePixel(sourceData, steps);

    return (
        <div {...stylex.props(styles.root)}>
            <div {...stylex.props(styles.modes)}>
                {MODES.map((m) => (
                    <Button
                        key={m.id}
                        color={selected === m.id ? 'aurora' : 'neutral'}
                        background={selected === m.id ? 'solid' : 'soft'}
                        onClick={() => {
                            setSelected(m.id);
                        }}
                    >
                        {m.label}
                    </Button>
                ))}
            </div>

            <div {...stylex.props(styles.resultRow)}>
                <div {...stylex.props(styles.imageWrapper)}>
                    <img
                        src={result[0] ? (imageDataToUrl(result[0]) ?? '') : ''}
                        alt="resized"
                        style={{ imageRendering: 'pixelated' }}
                        {...stylex.props(styles.image)}
                    />
                </div>
                <div {...stylex.props(styles.dimensions)}>
                    {result[0]?.width}×{result[0]?.height}
                </div>
            </div>
        </div>
    );
}

export { ResizeDemo };
