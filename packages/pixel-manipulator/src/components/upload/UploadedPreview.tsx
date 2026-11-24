import { Button } from '@repo/ui/components/Button';
import { palette, radius, space, typography } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef } from 'react';

import type { OutputType } from '../../stores/manipulator/types';
import { CloseIcon } from '../shared/CloseIcon';

const border = `light-dark(${palette.light2}, ${palette.dark2})`;
const cardBg = `light-dark(${palette.light0}, ${palette.dark0})`;
const foreground = `light-dark(${palette.dark0}, ${palette.light0})`;
const muted = `light-dark(${palette.gray244}, ${palette.dark3})`;
const primary = `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`;

const styles = stylex.create({
    figure: {
        display: 'flex',
        alignItems: 'center',
        gap: space['3'],
        border: `1px solid ${border}`,
        borderRadius: radius.lg,
        backgroundColor: cardBg,
        padding: space['3'],
    },
    thumb: {
        width: space['12'],
        height: space['12'],
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: radius.md,
        backgroundColor: `color-mix(in srgb, ${primary} 10%, transparent)`,
    },
    canvas: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    caption: {
        flex: 1,
        minWidth: 0,
    },
    name: {
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
        color: foreground,
    },
    size: {
        fontSize: typography.fontSizeXs,
        color: muted,
    },
});

interface UploadedPreviewProps {
    imageSource: OutputType;
    fileName?: string;
    onClear: () => void;
}

function UploadedPreview({ imageSource, fileName, onClear }: UploadedPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (ctx) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            ctx.putImageData(imageSource.imageData, 0, 0);
        }
    }, [imageSource]);

    return (
        <figure {...stylex.props(styles.figure)}>
            <div {...stylex.props(styles.thumb)}>
                <canvas ref={canvasRef} {...stylex.props(styles.canvas)} />
            </div>
            <figcaption {...stylex.props(styles.caption)}>
                <p {...stylex.props(styles.name)}>{fileName ?? 'image'}</p>
                <p {...stylex.props(styles.size)}>
                    {imageSource.imageData.width} × {imageSource.imageData.height}
                </p>
            </figcaption>
            <Button onClick={onClear} aria-label="Remove image">
                <CloseIcon />
            </Button>
        </figure>
    );
}

export { UploadedPreview };
