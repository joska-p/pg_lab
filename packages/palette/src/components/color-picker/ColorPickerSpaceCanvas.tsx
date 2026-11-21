import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

import type { ColorPickerSpaceId } from '../../core/colorPickerSpaces';
import { createColorPickerSpaceCanvasPool } from './colorPickerSpaceCanvasPool';

const styles = stylex.create({
    canvas: {
        display: 'block',
        cursor: 'crosshair',
        touchAction: 'none',
    },
});

interface ColorPickerSpaceCanvasProps {
    ref: RefObject<HTMLCanvasElement | null>;
    pickerSpaceId: ColorPickerSpaceId;
    zValue: number;
    size?: number;
    onPick?: (event: React.PointerEvent<HTMLCanvasElement>) => void;
}

function ColorPickerSpaceCanvas({
    ref,
    pickerSpaceId,
    zValue,
    size = 200,
    onPick,
}: ColorPickerSpaceCanvasProps) {
    const [pool] = useState(createColorPickerSpaceCanvasPool);

    useEffect(() => {
        return () => {
            pool.teardown();
        };
    }, [pool]);

    useEffect(() => {
        let cancelled = false;

        void pool
            .run({ pickerSpaceId, zValue, size })
            .then((bitmap) => {
                if (cancelled) {
                    bitmap.close();
                    return;
                }

                const context = ref.current?.getContext('2d');

                if (!context) {
                    bitmap.close();
                    return;
                }

                context.drawImage(bitmap, 0, 0);
                bitmap.close();
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    console.error('Color picker space canvas render failed', error);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [pool, ref, pickerSpaceId, size, zValue]);

    return (
        <canvas
            ref={ref}
            width={size}
            height={size}
            aria-label={`${pickerSpaceId} color picker`}
            {...stylex.props(styles.canvas)}
            onPointerDown={onPick}
            onPointerMove={onPick}
        />
    );
}

export { ColorPickerSpaceCanvas };
