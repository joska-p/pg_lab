import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useRef, useState } from 'react';

import { surfaceStyle } from '../recipes/surface';
import { layout, radius, space, motion } from '../tokens/const.stylex';
import { Button } from './Button';

const COLLAPSED_SIZE = 16;
const COLLAPSE_BELOW = COLLAPSED_SIZE * 1.5;
const PORTRAIT_QUERY = '(orientation: portrait)';

const surface = surfaceStyle({
    background: 'soft',
    border: 'subtle',
    elevation: 'raised',
});

const styles = stylex.create({
    base: {
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: {
            default: 'row',
            '@media (orientation: portrait)': 'column',
        },
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        containerType: 'inline-size',
        padding: space['2'],
        gap: space['2'],
        '@media (min-width: 1024px)': {
            padding: space['4'],
            gap: space['4'],
        },
    },

    stage: {
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarGutter: 'stable',
        padding: space['2'],
        gap: space['2'],
        '@media (min-width: 1024px)': {
            padding: space['4'],
            gap: space['4'],
        },
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

    panelContent: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        overflow: 'auto',
        padding: space['2'],
        gap: space['2'],
        '@media (min-width: 1024px)': {
            padding: space['4'],
            gap: space['4'],
        },
    },

    contentHidden: {
        display: 'none',
    },

    handle: {
        position: 'absolute',
        top: '50%',
        left: '-0.5rem',
        aspectRatio: '1 / 1',
        minWidth: layout.controlTouchTarget,
        minHeight: layout.controlTouchTarget,
        paddingBlock: 0,
        paddingInline: 0,
        zIndex: 2,
        opacity: {
            default: 0.7,
            ':hover': 1,
            ':focus-visible': 1,
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
    hasMoved: boolean;
}

export interface StageProps extends Omit<
    React.ComponentProps<'section'>,
    'style' | 'children' | 'aria-label'
> {
    style?: StyleXStyles;
}

interface ExperimentShellProps extends Omit<React.ComponentProps<'div'>, 'style' | 'className'> {
    children: React.ReactNode;
    stageLabel?: string;
    stageProps?: StageProps;
    panel?: React.ReactNode;
    style?: StyleXStyles;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
}

export function ExperimentShell({
    children,
    stageLabel = 'stage',
    stageProps,
    panel,
    style,
    collapsed: controlledCollapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    ...props
}: ExperimentShellProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<Drag | null>(null);
    const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
    const { style: stageStyle, ...stageSectionProps } = stageProps ?? {};

    const isControlled = controlledCollapsed !== undefined;
    const collapsed = isControlled ? controlledCollapsed : uncontrolledCollapsed;

    const setCollapsedState = (next: boolean) => {
        if (!isControlled) {
            setUncontrolledCollapsed(next);
        }
        onCollapsedChange?.(next);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        const panelEl = panelRef.current;
        if (!panelEl || event.button !== 0) {
            return;
        }

        const vertical = window.matchMedia(PORTRAIT_QUERY).matches;
        const rect = panelEl.getBoundingClientRect();
        dragRef.current = {
            vertical,
            pointerStart: vertical ? event.clientY : event.clientX,
            sizeStart: vertical ? rect.height : rect.width,
            hasMoved: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        const drag = dragRef.current;
        const panelEl = panelRef.current;
        if (!drag || !panelEl) {
            return;
        }

        const pointer = drag.vertical ? event.clientY : event.clientX;
        if (Math.abs(pointer - drag.pointerStart) > 4) {
            drag.hasMoved = true;
        }

        const size = Math.max(0, drag.sizeStart + drag.pointerStart - pointer);

        panelEl.style.setProperty(drag.vertical ? '--panel-height' : '--panel-width', `${size}px`);
        setCollapsedState(size <= COLLAPSE_BELOW);
    };

    const handlePointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        dragRef.current = null;
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setCollapsedState(!collapsed);
        }
    };

    return (
        <div {...props} {...stylex.props(styles.base, style)}>
            <section
                aria-label={stageLabel}
                {...stageSectionProps}
                {...stylex.props(surface, styles.stage, stageStyle)}
            >
                {children}
            </section>

            {panel != null && (
                <div
                    ref={panelRef}
                    {...stylex.props(surface, styles.panel, collapsed && styles.panelCollapsed)}
                >
                    <Button
                        color="aurora"
                        background="solid"
                        style={styles.handle}
                        aria-label={
                            collapsed
                                ? 'Agrandir le panneau de contrôles'
                                : 'Réduire le panneau de contrôles'
                        }
                        aria-expanded={!collapsed}
                        onKeyDown={handleKeyDown}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerEnd}
                        onPointerCancel={handlePointerEnd}
                        onLostPointerCapture={handlePointerEnd}
                    >
                        ≶
                    </Button>

                    <div {...stylex.props(styles.panelContent, collapsed && styles.contentHidden)}>
                        {panel}
                    </div>
                </div>
            )}
        </div>
    );
}
