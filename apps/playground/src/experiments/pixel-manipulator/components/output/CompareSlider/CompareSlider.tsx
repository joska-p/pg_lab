import { radius } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { useCompareSlider } from './useCompareSlider';

interface CompareSliderProps {
    source: ImageData;
    result: ImageData;
}

const styles = stylex.create({
    container: {
        position: 'relative',
        marginInline: 'auto',
        overflow: 'hidden',
        borderRadius: radius.lg,
        userSelect: 'none',
    },
    canvas: {
        width: '100%',
        height: '100%',
    },
});

function CompareSlider({ source, result }: CompareSliderProps) {
    const {
        containerRef,
        canvasRef,
        width,
        height,
        handleMouseDown,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
    } = useCompareSlider({ source, result });

    return (
        <div
            ref={containerRef}
            {...stylex.props(styles.container)}
            style={{
                width: '100%',
                maxWidth: width,
                aspectRatio: `${String(width)} / ${String(height)}`,
                cursor: 'ew-resize',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <canvas ref={canvasRef} {...stylex.props(styles.canvas)} />
        </div>
    );
}

export { CompareSlider };
