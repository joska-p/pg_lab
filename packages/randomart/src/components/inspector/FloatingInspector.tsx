import { Button } from '@repo/ui/components/Button';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { heading } from '@repo/ui/recipes/typography';
import { borderWidth, layout, space, zIndex } from '@repo/ui/tokens/const.stylex';
import { colors } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { InspectorPanel } from './InspectorPanel';

const styles = stylex.create({
    toggle: {
        position: 'absolute',
        top: space['3'],
        left: space['3'],
        zIndex: zIndex.overlay,
    },
    icon: {
        display: 'block',
        width: '16px',
        height: '16px',
    },
    panel: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: layout.panelWidth,
        display: 'flex',
        flexDirection: 'column',
        gap: space['4'],
        overflowY: 'auto',
        padding: space['4'],
        zIndex: zIndex.panel,
        backdropFilter: 'blur(8px)',
        borderRightWidth: borderWidth.hairline,
        borderRightStyle: 'solid',
        borderRightColor: colors.neutral,
    },
    title: {
        marginTop: space['8'],
        paddingBottom: space['2'],
        borderBottomWidth: borderWidth.hairline,
        borderBottomStyle: 'solid',
        borderBottomColor: colors.neutral,
    },
});

function CloseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...stylex.props(styles.icon)}
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function InspectIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...stylex.props(styles.icon)}
        >
            <path d="M6 18h8" />
            <path d="M3 22h18" />
            <path d="M14 22a7 7 0 1 0 0-14h-1" />
            <path d="M9 14h2" />
            <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
            <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
        </svg>
    );
}

export function FloatingInspector() {
    const [open, setOpen] = useState(false);

    const label = open ? 'Close inspector' : 'Open inspector';

    return (
        <>
            <div {...stylex.props(styles.toggle)}>
                <Button
                    background="soft"
                    aria-label={label}
                    aria-expanded={open}
                    title={label}
                    onClick={() => {
                        setOpen((value) => !value);
                    }}
                >
                    {open ? <CloseIcon /> : <InspectIcon />}
                </Button>
            </div>

            {open && (
                <div
                    {...stylex.props(
                        surfaceStyles({
                            background: 'soft',
                            border: 'none',
                            radius: 'none',
                            elevation: 'raised',
                        }),
                        styles.panel,
                    )}
                >
                    <h3 {...stylex.props(heading.level2, styles.title)}>Engine Diagnostics</h3>
                    <InspectorPanel />
                </div>
            )}
        </>
    );
}
