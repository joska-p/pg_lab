import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useEffect, useRef } from 'react';

import { usePanelChrome } from '../hooks/usePanelChrome';
import { surfaceStyle } from '../recipes/surface';
import { layout, radius, space, motion } from '../tokens/const.stylex';
import { Button } from './Button';

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
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        minWidth: 0,
        minHeight: 0,
        borderRadius: radius.md,
        maxWidth: {
            default: '70%',
            '@media (orientation: portrait)': 'none',
        },
        maxHeight: {
            default: '100%',
            '@media (orientation: portrait)': layout.panelMaxMobileHeight,
        },
    },
    panelSize: (sizePx: number) => ({
        width: {
            default: `${sizePx}px`,
            '@media (orientation: portrait)': 'auto',
        },
        height: {
            default: null,
            '@media (orientation: portrait)': `${sizePx}px`,
        },
    }),
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
    lastPointer: number;
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
}

export function ExperimentShell({
    children,
    stageLabel = 'stage',
    stageProps,
    panel,
    style,
    ...props
}: ExperimentShellProps) {
    const { collapsed, sizePx, resize, toggle } = usePanelChrome();
    const dragRef = useRef<Drag | null>(null);
    const { style: stageStyle, ...stageSectionProps } = stageProps ?? {};
    const hasPanel = panel != null;

    useEffect(() => {
        if (!hasPanel) {
            return;
        }

        const handleShortcut = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== 'b' || !(event.metaKey || event.ctrlKey)) {
                return;
            }

            event.preventDefault();
            toggle();
        };

        document.addEventListener('keydown', handleShortcut);

        return () => {
            document.removeEventListener('keydown', handleShortcut);
        };
    }, [hasPanel, toggle]);

    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0) {
            return;
        }

        const vertical = window.matchMedia(PORTRAIT_QUERY).matches;
        dragRef.current = {
            vertical,
            lastPointer: vertical ? event.clientY : event.clientX,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        const drag = dragRef.current;
        if (!drag) {
            return;
        }

        const pointer = drag.vertical ? event.clientY : event.clientX;
        const deltaPx = drag.lastPointer - pointer;
        drag.lastPointer = pointer;
        resize(deltaPx);
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
            toggle();
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

            {hasPanel && (
                <div {...stylex.props(surface, styles.panel, styles.panelSize(sizePx))}>
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
