import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { labelToColorMap } from '../../constants';
import type { Label } from '../../core/types';
import { setScrollTarget, useSelectedDrawingId } from '../../stores/selection';
import type { ChartPoint } from './types';

const styles = stylex.create({
    group: {
        cursor: 'pointer',
    },
    dot: {
        opacity: 0.25,
        transitionProperty: 'r, opacity',
        transitionDuration: '200ms',
        ':hover': {
            opacity: 1,
            r: 8,
        },
    },
    selected: {
        opacity: 1,
        r: 8,
    },
    tooltip: {
        position: 'absolute',
        pointerEvents: 'none',
        background: 'rgba(20, 20, 24, 0.92)',
        color: '#ffffff',
        borderRadius: '4px',
        padding: '8px',
        fontSize: '12px',
        whiteSpace: 'nowrap',
        transform: 'translate(-50%, -110%)',
    },
});

interface ScatterDotProps {
    data: ChartPoint[];
    xScale: (value: number) => number;
    yScale: (value: number) => number;
}

function ScatterDot({ data, xScale, yScale }: ScatterDotProps) {
    const selectedDrawingId = useSelectedDrawingId();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <g>
            {data.map((point, index) => {
                const drawingId = point.drawingId;
                const cx = xScale(point.x);
                const cy = yScale(point.y);
                const isSelected = selectedDrawingId === drawingId;
                const isHovered = hoveredIndex === index;

                return (
                    <g
                        key={index}
                        {...stylex.props(styles.group)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => {
                            if (!drawingId) {
                                return;
                            }

                            setScrollTarget(drawingId);
                        }}
                    >
                        <circle
                            data-drawing-id-point={point.drawingId}
                            cx={cx}
                            cy={cy}
                            r="4"
                            fill={
                                point.label === 'current'
                                    ? 'oklch(0.66 0.218 30.392)'
                                    : labelToColorMap[point.label as Label]
                            }
                            {...stylex.props(styles.dot, isSelected && styles.selected)}
                        />
                        {(isHovered || isSelected) && (
                            <foreignObject x={cx - 40} y={cy - 70} width={80} height={70}>
                                <div {...stylex.props(styles.tooltip)}>
                                    <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                                        {point.label}
                                    </div>
                                    <div>x: {point.x.toFixed()}</div>
                                    <div>y: {point.y.toFixed()}</div>
                                </div>
                            </foreignObject>
                        )}
                    </g>
                );
            })}
        </g>
    );
}

export { ScatterDot };
