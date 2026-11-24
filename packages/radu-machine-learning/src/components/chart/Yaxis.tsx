import { palette } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { HEIGHT, MARGIN } from './constants';

const styles = stylex.create({
    muted: {
        color: palette.gray244,
    },
    label: {
        fontWeight: 500,
    },
});

function Yaxis({
    yTicks,
    yScale,
    yName = 'y',
}: {
    yTicks: number[];
    yScale: (value: number) => number;
    yName?: string;
}) {
    return (
        <g {...stylex.props(styles.muted)}>
            <line
                x1={MARGIN.left}
                y1={MARGIN.top}
                x2={MARGIN.left}
                y2={HEIGHT - MARGIN.bottom}
                stroke="currentColor"
            />
            {yTicks.map((tick, i) => (
                <g key={i}>
                    <line
                        x1={MARGIN.left - 5}
                        y1={yScale(tick)}
                        x2={MARGIN.left}
                        y2={yScale(tick)}
                        stroke="currentColor"
                    />
                    <text
                        x={MARGIN.left - 8}
                        y={yScale(tick)}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize={12}
                        fill="currentColor"
                    >
                        {tick.toFixed(1)}
                    </text>
                </g>
            ))}
            {yName && (
                <text
                    x={MARGIN.left}
                    y={MARGIN.top - 12}
                    textAnchor="start"
                    fontSize={12}
                    fill="currentColor"
                    {...stylex.props(styles.label)}
                >
                    {yName}
                </text>
            )}
        </g>
    );
}

export { Yaxis };
