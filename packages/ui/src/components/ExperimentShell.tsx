import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { surfaceStyles } from '../recipes/surface';
import { layout, radius, space, zIndex } from '../tokens/const.stylex';
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
        overflow: 'hidden',
        padding: space['4'],
        '@container (max-width: 720px)': {
            paddingTop: `calc(${space['3']} + ${space['10']})`,
        },
    },

    panel: {
        display: 'flex',
        flexDirection: 'column',
        width: layout.panelWidth,
        flexShrink: 0,
        minHeight: 0,
        maxHeight: '100%',
        overflowY: 'auto',
        borderRadius: { default: radius.none, '@media (min-width: 1024px)': radius.md },

        '@media (orientation: portrait)': {
            width: 'auto',
            maxHeight: layout.panelMaxMobileHeight,
        },
    },

    panelFloating: {
        position: 'absolute',
        top: space['3'],
        right: space['3'],
        bottom: space['3'],
        zIndex: zIndex.panel,
        width: layout.panelWidth,
        maxHeight: 'none',
        borderRadius: radius.md,

        '@container (max-width: 720px)': {
            left: space['3'],
            top: 'auto',
            bottom: space['3'],
            width: 'auto',
            maxHeight: layout.panelMaxMobileHeight,
        },
    },

    hidden: {
        display: 'none',
    },

    toggle: {
        position: 'absolute',
        top: space['3'],
        right: space['3'],
        zIndex: zIndex.overlay,
    },

    toggleClearOfFloatingPanel: {
        top: `calc(${space['3']} + ${layout.panelGap})`,
        right: `calc(${space['3']} + ${layout.panelGap})`,

        '@media (orientation: portrait)': {
            right: space['3'],
        },
    },
});

interface ExperimentShellProps extends Omit<React.ComponentProps<'div'>, 'style' | 'className'> {
    children: React.ReactNode;
    panel?: React.ReactNode;
    panelPlacement?: 'docked' | 'floating';
    style?: StyleXStyles;
}

export function ExperimentShell({
    children,
    panel,
    panelPlacement = 'docked',
    style,
    ...props
}: ExperimentShellProps) {
    const panelId = useId();
    const [panelVisible, setPanelVisible] = useState(true);

    const isFloating = panelPlacement === 'floating';

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

            {panel && (
                <>
                    <div
                        id={panelId}
                        {...stylex.props(
                            surfaceStyles({
                                background: 'soft',
                                border: 'subtle',
                                elevation: 'raised',
                            }),
                            styles.panel,
                            isFloating && styles.panelFloating,
                            !panelVisible && styles.hidden,
                        )}
                    >
                        {panel}
                    </div>

                    <div
                        {...stylex.props(
                            styles.toggle,
                            isFloating && panelVisible && styles.toggleClearOfFloatingPanel,
                        )}
                    >
                        <Button
                            background="soft"
                            color="aqua"
                            aria-expanded={panelVisible}
                            aria-controls={panelId}
                            aria-label={panelVisible ? 'Hide control panel' : 'Show control panel'}
                            onClick={() => setPanelVisible((visible) => !visible)}
                        >
                            {panelVisible ? 'Hide panel' : 'Show panel'}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
