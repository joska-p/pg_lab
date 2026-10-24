import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

import type { ColorSpacesKey } from '../../core/colorSpaces';
import { createColorSpaceCanvasPool } from './colorSpaceCanvasPool';

const styles = stylex.create({
    canvas: {
        display: 'block',
        cursor: 'crosshair',
        touchAction: 'none',
    },
});

interface ColorSpaceCanvasProps {
    ref: RefObject<HTMLCanvasElement | null>;
    spaceId: ColorSpacesKey;
    zValue: number;
    size?: number;
    onPick?: (event: React.PointerEvent<HTMLCanvasElement>) => void;
}

function ColorSpaceCanvas({ ref, spaceId, zValue, size = 200, onPick }: ColorSpaceCanvasProps) {
    const [pool] = useState(createColorSpaceCanvasPool);

    useEffect(() => {
        return () => {
            pool.teardown();
        };
    }, [pool]);

    useEffect(() => {
        let cancelled = false;

        void pool
            .run({ spaceId, zValue, size })
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
                    console.error('Color space canvas render failed', error);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [pool, ref, spaceId, size, zValue]);

    return (
        <canvas
            ref={ref}
            width={size}
            height={size}
            aria-label={`${spaceId} color space`}
            {...stylex.props(styles.canvas)}
            onPointerDown={onPick}
            onPointerMove={onPick}
        />
    );
}

export { ColorSpaceCanvas };
