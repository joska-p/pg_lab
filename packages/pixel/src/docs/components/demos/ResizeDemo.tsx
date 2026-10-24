import { Button } from '@repo/ui/components/Button';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { usePixel } from '../../../react/usePixel';
import { imageDataToUrl } from '../helpers';

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
    result: {
        display: 'flex',
        alignItems: 'center',
        gap: space['4'],
    },
    image: {
        width: '80px',
        height: '80px',
        flexShrink: 0,
        borderRadius: '6px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        imageRendering: 'pixelated',
        display: 'block',
    },
    size: {
        margin: 0,
        fontSize: typography.fontSizeXs,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
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
                        border="subtle"
                        onClick={() => {
                            setSelected(m.id);
                        }}
                    >
                        {m.label}
                    </Button>
                ))}
            </div>

            <div {...stylex.props(styles.result)}>
                <div>
                    <img
                        src={result[0] ? (imageDataToUrl(result[0]) ?? '') : ''}
                        alt="resized"
                        {...stylex.props(styles.image)}
                    />
                </div>
                <p {...stylex.props(styles.size)}>
                    {result[0]?.width}×{result[0]?.height}
                </p>
            </div>
        </div>
    );
}

export { ResizeDemo };
