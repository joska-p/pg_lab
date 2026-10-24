import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { useImageSource, useOutputs } from '../../stores/manipulator/selectors';
import { EmptyState } from '../shared/EmptyState';
import { CompareSlider } from './CompareSlider';
import { CompareToggle } from './CompareToggle';
import { OutputCard } from './OutputCard';
import { ProcessingOverlay } from './ProcessingOverlay';

const styles = stylex.create({
    root: {
        position: 'relative',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: space['4'],
        paddingBottom: space['0'] ?? space['0'],
    },
    compare: {
        paddingInline: space['4'],
        paddingTop: space['4'],
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: space['4'],
        padding: space['4'],
    },
    sourceItem: {
        listStyle: 'none',
    },
    atWide: {
        '@media (min-width: 1024px)': {
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        },
    },
});

function Outputs() {
    const imageSource = useImageSource();
    const outputs = useOutputs();
    const [mode, setMode] = useState<'grid' | 'compare'>('grid');
    const [selectedOutputId, setSelectedOutputId] = useState<string | undefined>(undefined);

    const hasComparableContent = imageSource && outputs.length > 0;

    const activeOutputId =
        selectedOutputId && outputs.some((o) => o.id === selectedOutputId)
            ? selectedOutputId
            : outputs[0]?.id;

    const selectedOutput = outputs.find((o) => o.id === activeOutputId);

    if (!imageSource || outputs.length === 0) {
        return <EmptyState message="Upload an image to begin" />;
    }

    return (
        <div {...stylex.props(styles.root)}>
            {hasComparableContent && (
                <div {...stylex.props(styles.toolbar)}>
                    <CompareToggle mode={mode} onChange={setMode} />
                </div>
            )}

            {mode === 'compare' && selectedOutput && (
                <div {...stylex.props(styles.compare)}>
                    <CompareSlider
                        source={imageSource.imageData}
                        result={selectedOutput.imageData}
                    />
                </div>
            )}

            <ul {...stylex.props(styles.list, styles.atWide)}>
                <li style={{ listStyle: 'none' }} key={imageSource.id}>
                    <OutputCard output={imageSource} index={0} isSource />
                </li>
                {outputs.map((output, index) => (
                    <li style={{ listStyle: 'none' }} key={output.id}>
                        <OutputCard
                            output={output}
                            index={index + 1}
                            isSelected={mode === 'compare' && activeOutputId === output.id}
                            {...(mode === 'compare' && {
                                onSelect: () => {
                                    setSelectedOutputId(output.id);
                                },
                            })}
                        />
                    </li>
                ))}
            </ul>

            <ProcessingOverlay />
        </div>
    );
}

export { Outputs };
