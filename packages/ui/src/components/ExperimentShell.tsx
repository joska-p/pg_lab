import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useRef, useState } from 'react';

import { surfaceStyles } from '../recipes/surface';
import { layout, radius, space, motion, typography } from '../tokens/const.stylex';
import { Button } from './Button';

const COLLAPSED_SIZE = 16;
const COLLAPSE_BELOW = COLLAPSED_SIZE * 1.5;
const PORTRAIT_QUERY = '(orientation: portrait)';

const surface = surfaceStyles({ background: 'soft', border: 'subtle', elevation: 'raised' });

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

    stage: {
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
        '--panel-width': layout.panelWidth,
        '--panel-height': 'auto',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        minWidth: 0,
        minHeight: 0,
        borderRadius: radius.md,
        width: {
            default: 'var(--panel-width)',
            '@media (orientation: portrait)': 'auto',
        },
        height: {
            default: null,
            '@media (orientation: portrait)': 'var(--panel-height)',
        },
        maxWidth: {
            default: '70%',
            '@media (orientation: portrait)': 'none',
        },
        maxHeight: {
            default: '100%',
            '@media (orientation: portrait)': layout.panelMaxMobileHeight,
        },
    },

    panelCollapsed: {
        width: {
            default: COLLAPSED_SIZE,
            '@media (orientation: portrait)': 'auto',
        },
        height: {
            default: null,
            '@media (orientation: portrait)': COLLAPSED_SIZE,
        },
    },

    content: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        overflow: 'auto',
        padding: space['4'],
    },

    contentHidden: {
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
        touchAction: 'none',
        cursor: {
            default: 'ew-resize',
            '@media (orientation: portrait)': 'ns-resize',
        },
        translate: '-50% -50%',
        '@media (orientation: portrait)': {
            top: '-0.5rem',
            left: '50%',
        },
    },
});

interface Drag {
    vertical: boolean;
    pointerStart: number;
    sizeStart: number;
}

interface ExperimentShellProps extends Omit<React.ComponentProps<'div'>, 'style' | 'className'> {
    children: React.ReactNode;
    panel?: React.ReactNode;
    style?: StyleXStyles;
}

export function ExperimentShell({ children, panel, style, ...props }: ExperimentShellProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<Drag | null>(null);
    const [collapsed, setCollapsed] = useState(false);

    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        const panel = panelRef.current;
        if (!panel || event.button !== 0) {
            return;
        }

        const vertical = window.matchMedia(PORTRAIT_QUERY).matches;
        const rect = panel.getBoundingClientRect();
        dragRef.current = {
            vertical,
            pointerStart: vertical ? event.clientY : event.clientX,
            sizeStart: vertical ? rect.height : rect.width,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        const drag = dragRef.current;
        const panel = panelRef.current;
        if (!drag || !panel) {
            return;
        }

        const pointer = drag.vertical ? event.clientY : event.clientX;
        const size = drag.sizeStart + drag.pointerStart - pointer;

        panel.style.setProperty(drag.vertical ? '--panel-height' : '--panel-width', `${size}px`);
        setCollapsed(size <= COLLAPSE_BELOW);
    };

    const handlePointerEnd = () => {
        dragRef.current = null;
    };

    return (
        <div {...props} {...stylex.props(styles.base, style)}>
            <div {...stylex.props(surface, styles.stage)}>{children}</div>

            {panel != null && (
                <div
                    ref={panelRef}
                    {...stylex.props(surface, styles.panel, collapsed && styles.panelCollapsed)}
                >
                    <Button
                        color="aurora"
                        background="solid"
                        style={styles.handle}
                        tabIndex={-1}
                        aria-hidden="true"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerEnd}
                        onPointerCancel={handlePointerEnd}
                        onClick={() => setCollapsed((prev) => !prev)}
                    >
                        ≶
                    </Button>

                    <div {...stylex.props(styles.content, collapsed && styles.contentHidden)}>
                        {panel}
                    </div>
                </div>
            )}
        </div>
    );
}
