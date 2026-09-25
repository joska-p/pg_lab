import * as stylex from '@stylexjs/stylex';
import { useId, useState } from 'react';

import { space, layout, radius, zIndex } from '../const.stylex';
import { borders, surface, elevations } from '../styles.stylex';
import { Button } from './Button';

const styles = stylex.create({
    base: {
        position: 'relative',
        display: 'flex',
        flexDirection: {
            default: 'row',
            '@media (max-width: 720px)': 'column',
            '@media (orientation: portrait)': 'column',
        },
        gap: space['3'],
        width: '100%',
        height: '100%',
        padding: 0,
        overflow: 'hidden',
    },

    stageSlot: {
        position: 'relative',
        flex: 1,
        display: 'flex',
        minWidth: 0,
        minHeight: 0,
        overflowY: 'auto',
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
        backgroundColor: surface.bg,
        color: surface.fg,

        '@media (max-width: 720px)': {
            width: 'auto',
            maxHeight: layout.panelMaxMobileHeight,
        },

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

        '@media (max-width: 720px)': {
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
        top: `calc(${space['3']} + calc(${layout.panelGap}))`,
        right: `calc(${space['3']} + calc(${layout.panelGap}))`,

        '@media (max-width: 720px)': {
            right: space['3'],
        },

        '@media (orientation: portrait)': {
            right: space['3'],
        },
    },
});

interface ExperimentShellProps {
    children: React.ReactNode;
    panel?: React.ReactNode;
    panelPlacement?: 'docked' | 'floating';
}

export function ExperimentShell({
    children,
    panel,
    panelPlacement = 'docked',
}: ExperimentShellProps) {
    const panelId = useId();
    const [panelVisible, setPanelVisible] = useState(true);

    const isFloating = panelPlacement === 'floating';

    const compoundPanelStyle = stylex.props(
        styles.panel,
        elevations.raised,
        borders.subtle,
        borders.rounded,
        isFloating && styles.panelFloating,
        !panelVisible && styles.hidden,
    );

    const compoundExperimentStyle = stylex.props(
        styles.base,
        elevations.raised,
        borders.subtle,
        borders.rounded,
    );

    const compoundToggleStyle = stylex.props(
        styles.toggle,
        isFloating && panelVisible && styles.toggleClearOfFloatingPanel,
    );

    return (
        <div {...compoundExperimentStyle}>
            <div {...stylex.props(styles.stageSlot)}>{children}</div>

            {panel && (
                <>
                    <div id={panelId} {...compoundPanelStyle}>
                        {panel}
                    </div>

                    <div {...compoundToggleStyle}>
                        <Button
                            aria-expanded={panelVisible}
                            aria-controls={panelId}
                            onClick={() => setPanelVisible((visible) => !visible)}
                        >
                            {panelVisible ? 'hide panel' : 'show panel'}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
