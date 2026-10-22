import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useId, useRef, useState } from 'react';

import { surfaceStyles } from '../recipes/surface';
import { layout, radius, space, motion, typography } from '../tokens/const.stylex';
import { Button } from './Button';

const COLLAPSED_PANEL_HEIGHT = 16;
const DRAG_THRESHOLD = 5;
const COLLAPSE_THRESHOLD = COLLAPSED_PANEL_HEIGHT + 8;

const PORTRAIT_QUERY = '(orientation: portrait)';

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
        transitionProperty: 'width, height, max-height',
        transitionDuration: '180ms',
        transitionTimingFunction: 'ease',
        '@media (orientation: portrait)': {
            flexDirection: 'column',
            width: 'auto',
            height: 'var(--panel-height, auto)',
            maxHeight: layout.panelMaxMobileHeight,
            transitionProperty: 'height, max-height',
        },
        '@media (prefers-reduced-motion: reduce)': {
            transitionDuration: '0ms',
        },
    },

    panelCollapsed: {
        width: '1rem',
        '@media (orientation: portrait)': {
            width: 'auto',
        },
    },

    panelDragging: {
        transitionDuration: '0ms',
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
        touchAction: 'none',
        cursor: {
            default: 'pointer',
            '@media (orientation: portrait)': 'ns-resize',
        },
        transform: 'translate(-50%, -50%)',
        '@media (orientation: portrait)': {
            top: '-0.5rem',
            left: '50%',
        },
    },
});

function resolveMaxHeight(element: HTMLElement, fallback: number): number {
    const raw = window.getComputedStyle(element).maxHeight;
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) {
        return fallback;
    }
    if (raw.endsWith('%')) {
        return (fallback * value) / 100;
    }
    return value;
}

interface ExperimentShellProps extends Omit<React.ComponentProps<'div'>, 'style' | 'className'> {
    children: React.ReactNode;
    panel?: React.ReactNode;
    style?: StyleXStyles;
}

export function ExperimentShell({ children, panel, style, ...props }: ExperimentShellProps) {
    const panelId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef({ pointerY: 0, height: 0, maxHeight: 0 });
    const currentHeightRef = useRef(COLLAPSED_PANEL_HEIGHT);
    const draggingRef = useRef(false);
    const hasMovedRef = useRef(false);
    const suppressClickRef = useRef(false);

    // Source de vérité unique : null = hauteur naturelle (ouvert), 16 = replié, autre = hauteur choisie au drag.
    const [panelHeight, setPanelHeight] = useState<number | null>(null);
    // Sert uniquement à couper la transition pendant le drag.
    const [isDragging, setIsDragging] = useState(false);

    const panelExpanded = panelHeight !== COLLAPSED_PANEL_HEIGHT;

    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0 || !window.matchMedia(PORTRAIT_QUERY).matches) {
            return;
        }

        const panelElement = panelRef.current;
        if (!panelElement) {
            return;
        }

        const bounds = panelElement.getBoundingClientRect();
        const parentHeight =
            panelElement.parentElement?.getBoundingClientRect().height ?? bounds.height;
        const maxHeight = resolveMaxHeight(panelElement, parentHeight);

        dragStartRef.current = {
            pointerY: event.clientY,
            height: bounds.height,
            maxHeight: Math.max(COLLAPSED_PANEL_HEIGHT, maxHeight),
        };
        currentHeightRef.current = bounds.height;
        hasMovedRef.current = false;
        suppressClickRef.current = false;
        draggingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsDragging(true);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        // Ref (et non le state) : pas de closure périmé sur les premiers events.
        if (!draggingRef.current) {
            return;
        }

        const delta = dragStartRef.current.pointerY - event.clientY;
        if (Math.abs(delta) > DRAG_THRESHOLD) {
            hasMovedRef.current = true;
        }
        if (!hasMovedRef.current) {
            return;
        }

        const nextHeight = Math.min(
            dragStartRef.current.maxHeight,
            Math.max(COLLAPSED_PANEL_HEIGHT, dragStartRef.current.height + delta),
        );
        currentHeightRef.current = nextHeight;
        setPanelHeight(nextHeight);
    };

    const finishPointerDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (!draggingRef.current) {
            return;
        }
        draggingRef.current = false;

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        setIsDragging(false);
        if (!hasMovedRef.current) {
            return;
        }

        // Le click synthétique suit le pointerup dans la même tâche : on l'ignore,
        // puis on réarme le flag pour ne pas avaler un clic ultérieur.
        suppressClickRef.current = true;
        window.setTimeout(() => {
            suppressClickRef.current = false;
        }, 0);

        if (currentHeightRef.current <= COLLAPSE_THRESHOLD) {
            currentHeightRef.current = COLLAPSED_PANEL_HEIGHT;
            setPanelHeight(COLLAPSED_PANEL_HEIGHT);
        }
    };

    const handleClick = () => {
        if (suppressClickRef.current) {
            suppressClickRef.current = false;
            {
                return;
            }
        }

        if (panelExpanded) {
            currentHeightRef.current = COLLAPSED_PANEL_HEIGHT;
            setPanelHeight(COLLAPSED_PANEL_HEIGHT);
        } else {
            setPanelHeight(null);
        }
    };

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
                    ref={panelRef}
                    {...stylex.props(
                        surfaceStyles({
                            background: 'soft',
                            border: 'subtle',
                            elevation: 'raised',
                        }),
                        styles.panel,
                        !panelExpanded && styles.panelCollapsed,
                        isDragging && styles.panelDragging,
                    )}
                    style={
                        {
                            '--panel-height': panelHeight != null ? `${panelHeight}px` : undefined,
                        } as React.CSSProperties
                    }
                >
                    <Button
                        color="aurora"
                        background="solid"
                        style={styles.handle}
                        aria-expanded={panelExpanded}
                        aria-controls={panelId}
                        aria-label={
                            panelExpanded ? 'Collapse control panel' : 'Expand control panel'
                        }
                        onClick={handleClick}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={finishPointerDrag}
                        onPointerCancel={finishPointerDrag}
                    >
                        ≶
                    </Button>

                    <div
                        id={panelId}
                        {...stylex.props(
                            styles.panelContent,
                            !panelExpanded && styles.panelContentHidden,
                        )}
                    >
                        {panel}
                    </div>
                </div>
            )}
        </div>
    );
}
