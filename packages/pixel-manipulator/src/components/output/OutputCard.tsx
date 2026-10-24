import { Badge } from '@repo/ui/components/Badge';
import { Button } from '@repo/ui/components/Button';
import { Card } from '@repo/ui/components/Card';
import { palette, space, typography } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';
import { useRef, useState } from 'react';

import type { OutputType } from '../../stores/manipulator/types';
import { downloadCanvas } from '../../utils/download';
import { ImageLightbox } from './ImageLightbox';
import { Output } from './Output';

const primary = `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`;

const styles = stylex.create({
    article: {
        cursor: 'pointer',
    },
    card: {
        flexDirection: 'column',
        gap: space['3'],
    },
    cardSelected: {
        boxShadow: `0 0 0 2px ${primary}`,
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'start',
        justifyContent: 'space-between',
        gap: space['2'],
        padding: space['3'],
        paddingBottom: '0px',
    },
    title: {
        fontSize: typography.fontSizeSm,
    },
    badges: {
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        gap: space['2'],
    },
    body: {
        padding: space['3'],
    },
    actions: {
        display: 'flex',
        gap: space['2'],
        padding: space['3'],
        paddingTop: '0px',
    },
});

interface OutputCardProps {
    output: OutputType;
    index: number;
    isSource?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
}

function OutputCard({
    output,
    index,
    isSource = false,
    isSelected = false,
    onSelect,
}: OutputCardProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    const cardRef = useRef<HTMLElement>(null);

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const canvas = cardRef.current?.querySelector('canvas');

        if (!canvas) {
            return;
        }

        downloadCanvas(canvas, `${output.name}.png`);
    };

    const handleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsZoomed(true);
    };

    return (
        <>
            <article ref={cardRef as React.RefObject<HTMLElement>} onClick={onSelect}>
                <Card style={[styles.card, isSelected ? styles.cardSelected : undefined]}>
                    <div {...stylex.props(styles.header)}>
                        <h3 {...stylex.props(styles.title)}>
                            {index}. {output.description}
                        </h3>
                        <div {...stylex.props(styles.badges)}>
                            {isSource && <Badge color="aurora">Original</Badge>}
                            <Badge>
                                {output.imageData.width}×{output.imageData.height}
                            </Badge>
                        </div>
                    </div>
                    <div {...stylex.props(styles.body)}>
                        <Output imageData={output.imageData} />
                    </div>
                    <div {...stylex.props(styles.actions)}>
                        <Button onClick={handleDownload}>Download</Button>
                        <Button onClick={handleZoom}>Zoom</Button>
                    </div>
                </Card>
            </article>

            {isZoomed && (
                <ImageLightbox
                    imageData={output.imageData}
                    onClose={() => {
                        setIsZoomed(false);
                    }}
                />
            )}
        </>
    );
}

export { OutputCard };
export type { OutputCardProps };
