import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef } from 'react';

import { putImageData } from '../../core/image-data';

interface OutputProps {
    imageData: ImageData;
}

const styles = stylex.create({
    canvas: {
        maxWidth: '100%',
        maxHeight: '100%',
    },
});

function Output({ imageData }: OutputProps) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!ref.current) {
            return;
        }

        putImageData(ref.current, imageData);
    }, [imageData]);

    const width = imageData.width;
    const height = imageData.height;

    return <canvas ref={ref} width={width} height={height} {...stylex.props(styles.canvas)} />;
}

export { Output };
export type { OutputProps };
