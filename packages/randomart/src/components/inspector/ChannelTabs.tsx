import { Button } from '@repo/ui/components/Button';
import { colorText } from '@repo/ui/recipes/tint';
import { heading } from '@repo/ui/recipes/typography';
import { borderWidth, radius, space } from '@repo/ui/tokens/const.stylex';
import { colors } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';

import { CHANNELS } from '../../core';
import { setActiveChannel } from '../../stores/randomart/actions';
import { useActiveChannel, useCorrelatedRGB } from '../../stores/randomart/selectors';

const styles = stylex.create({
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space['2'],
    },
    status: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: space['1'],
    },
    icon: {
        width: '12px',
        height: '12px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: space['2'],
    },
    linkedGrid: {
        padding: space['1'],
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: colors.amber,
        borderRadius: radius.md,
    },
    dot: {
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: radius.full,
    },
    dotRed: { backgroundColor: 'red' },
    dotGreen: { backgroundColor: 'green' },
    dotBlue: { backgroundColor: 'blue' },
});

const DOT_STYLES = {
    red: styles.dotRed,
    green: styles.dotGreen,
    blue: styles.dotBlue,
} as const;

function LinkIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...stylex.props(styles.icon)}
        >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    );
}

function SplitIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...stylex.props(styles.icon)}
        >
            <path d="M3 12h18" />
            <path d="M12 3v18" />
        </svg>
    );
}

export function ChannelTabs() {
    const activeChannel = useActiveChannel();
    const correlated = useCorrelatedRGB();

    return (
        <div {...stylex.props(styles.section)}>
            <div {...stylex.props(styles.header)}>
                <h4 {...stylex.props(heading.level3)}>Color Channels</h4>
                <span
                    {...stylex.props(
                        styles.status,
                        correlated ? colorText.amber : colorText.aurora,
                    )}
                >
                    {correlated ? (
                        <>
                            <LinkIcon /> Linked (RGB Sync)
                        </>
                    ) : (
                        <>
                            <SplitIcon /> Independent
                        </>
                    )}
                </span>
            </div>

            <div {...stylex.props(styles.grid, correlated && styles.linkedGrid)}>
                {CHANNELS.map((channel) => (
                    <Button
                        key={channel}
                        color={!correlated && activeChannel === channel ? 'aurora' : 'neutral'}
                        disabled={correlated}
                        onClick={() => {
                            setActiveChannel(channel);
                        }}
                    >
                        <span
                            {...stylex.props(styles.dot, DOT_STYLES[channel])}
                            aria-hidden="true"
                        />
                        {channel}
                    </Button>
                ))}
            </div>
        </div>
    );
}
