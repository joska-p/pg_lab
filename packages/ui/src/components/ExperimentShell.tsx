import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { surfaceStyles } from '../recipes/surface';
import { layout, radius, space, motion, typography } from '../tokens/const.stylex';
import { Button } from './Button';

const styles = stylex.create({
    base: {
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: {
            default: 'row',
            '@media (orientation: portrait)': 'column',
        },
        gap: space['3'],
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        containerType: 'inline-size',
        padding: space['2'],
        '@media (min-width: 1024px)': {
            padding: space['4'],
        },
    },

    stageSlot: {
        position: 'relative',
        flex: 1,
        display: 'flex',
        minWidth: 0,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarGutter: 'stable',
    },

    panel: {
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'row',
        width: layout.panelWidth,
        flexShrink: 0,
        minWidth: 0,
        minHeight: 0,
        maxHeight: '100%',
        overflow: 'visible',
        borderRadius: radius.md,
        transitionProperty: 'width, max-height',
        transitionDuration: '180ms',
        transitionTimingFunction: 'ease',
        '@media (orientation: portrait)': {
            flexDirection: 'column',
            width: 'auto',
            height: 'auto',
            maxHeight: layout.panelMaxMobileHeight,
            transitionProperty: 'max-height',
        },
        '@media (prefers-reduced-motion: reduce)': {
            transitionDuration: '0ms',
        },
    },

    panelCollapsed: {
        width: '1rem',
        '@media (orientation: portrait)': {
            width: 'auto',
            height: '1rem',
            maxHeight: layout.controlTouchTarget,
        },
    },

    panelContent: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        overflow: 'auto',
        padding: space['4'],
    },

    panelContentHidden: {
        display: 'none',
    },

    handle: {
        position: 'absolute',
        top: '50%',
        left: '-0.5rem',
        aspectRatio: '1 / 1',
        fontSize: typography.fontSize2xl,
        fontWeight: typography.fontWeightBold,
        minWidth: layout.controlTouchTarget,
        minHeight: layout.controlTouchTarget,
        paddingBlock: 0,
        paddingInline: 0,
        zIndex: 2,
        opacity: {
            default: 0.5,
            ':hover': 1,
        },
        transitionProperty: 'opacity',
        transitionDuration: motion.durationNormal,
        transitionTimingFunction: motion.easingInOut,
        borderRadius: radius.full,
        transform: 'translate(-50%, -50%)',
        '@media (orientation: portrait)': {
            top: '-0.5rem',
            left: '50%',
        },
    },
});

interface ExperimentShellProps extends Omit<React.ComponentProps<'div'>, 'style' | 'className'> {
    children: React.ReactNode;
    panel?: React.ReactNode;
    style?: StyleXStyles;
}

export function ExperimentShell({ children, panel, style, ...props }: ExperimentShellProps) {
    const panelId = useId();
    const [panelExpanded, setPanelExpanded] = useState(true);

    return (
        <div {...props} {...stylex.props(styles.base, style)}>
            <div
                {...stylex.props(
                    surfaceStyles({ background: 'soft', border: 'subtle', elevation: 'raised' }),
                    styles.stageSlot,
                )}
            >
                {children}
            </div>

            {panel != null && (
                <div
                    {...stylex.props(
                        surfaceStyles({
                            background: 'soft',
                            border: 'subtle',
                            elevation: 'raised',
                        }),
                        styles.panel,
                        !panelExpanded && styles.panelCollapsed,
                    )}
                >
                    <Button
                        title={panelExpanded ? 'Collapse control panel' : 'Expand control panel'}
                        color="aurora"
                        background="solid"
                        style={styles.handle}
                        aria-expanded={panelExpanded}
                        aria-controls={panelId}
                        aria-label={
                            panelExpanded ? 'Collapse control panel' : 'Expand control panel'
                        }
                        onClick={() => setPanelExpanded((expanded) => !expanded)}
                    >
                        ≶
                    </Button>

                    <div
                        id={panelId}
                        {...stylex.props(
                            styles.panelContent,
                            !panelExpanded && styles.panelContentHidden,
                        )}
                        aria-hidden={!panelExpanded}
                    >
                        {panel}
                    </div>
                </div>
            )}
        </div>
    );
}
