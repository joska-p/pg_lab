import { palette } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

import { HEIGHT, MARGIN, WIDTH } from './constants';

const styles = stylex.create({
    axis: {
        color: surface.foreground,
    },
    muted: {
        color: palette.gray244,
    },
    label: {
        fontWeight: 500,
    },
});

function Xaxis({
    xTicks,
    xScale,
    xName = 'x',
}: {
    xTicks: number[];
    xScale: (value: number) => number;
    xName?: string;
}) {
    return (
        <g {...stylex.props(styles.muted)}>
            <line
                x1={MARGIN.left}
                y1={HEIGHT - MARGIN.bottom}
                x2={WIDTH - MARGIN.right}
                y2={HEIGHT - MARGIN.bottom}
                stroke="currentColor"
            />
            {xTicks.map((tick, i) => (
                <g key={i}>
                    <line
                        x1={xScale(tick)}
                        y1={HEIGHT - MARGIN.bottom}
                        x2={xScale(tick)}
                        y2={HEIGHT - MARGIN.bottom + 5}
                        stroke="currentColor"
                    />
                    <text
                        x={xScale(tick)}
                        y={HEIGHT - MARGIN.bottom + 8}
                        textAnchor="middle"
                        dominantBaseline="hanging"
                        fontSize={12}
                        fill="currentColor"
                    >
                        {tick.toFixed(1)}
                    </text>
                </g>
            ))}
            {xName && (
                <text
                    x={WIDTH - MARGIN.right}
                    y={HEIGHT - MARGIN.bottom + 32}
                    textAnchor="end"
                    fontSize={12}
                    fill="currentColor"
                    {...stylex.props(styles.label)}
                >
                    {xName}
                </text>
            )}
        </g>
    );
}

export { Xaxis };
