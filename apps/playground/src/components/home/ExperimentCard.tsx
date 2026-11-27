import { Button } from '@repo/ui/components/Button';
import { interactionStyles } from '@repo/ui/recipes/interactions';
import { surfaceStyle } from '@repo/ui/recipes/surface';
import { layout, space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import { tintVars } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';

import { experimentPath } from '../../experiments';
import type { ExperimentEntry } from '../../experiments';
import { ExperimentVisual } from './ExperimentVisual';

const styles = stylex.create({
    card: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        outline: 'none',
        userSelect: 'none',
        minHeight: '280px',
        cursor: 'pointer',
    },
    body: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: space['4'],
        gap: space['3'],
    },
    title: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeLg,
        fontWeight: typography.fontWeightBold,
        lineHeight: typography.lineHeightTight,
        color: surface.foreground,
        margin: 0,
    },
    summary: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        lineHeight: typography.lineHeightNormal,
        color: `color-mix(in oklab, ${surface.foreground} 75%, transparent)`,
        margin: 0,
        flex: 1,
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: space['4'],
        paddingBottom: space['4'],
        paddingTop: space['2'],
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: `color-mix(in oklab, ${tintVars.color} 14%, transparent)`,
    },
    actionButton: {
        minHeight: layout.controlTouchTarget,
        paddingInline: space['3'],
        width: '100%',
        justifyContent: 'center',
    },
});

interface ExperimentCardProps {
    readonly item: ExperimentEntry;
}

export function ExperimentCard({ item }: ExperimentCardProps) {
    const navigate = useNavigate();
    const path = experimentPath(item);

    const handleNavigate = () => {
        void navigate(path);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleNavigate();
        }
    };

    return (
        <article
            tabIndex={0}
            role="button"
            aria-label={`Ouvrir l'expérience ${item.label}`}
            onClick={handleNavigate}
            onKeyDown={handleKeyDown}
            {...stylex.props(
                surfaceStyle({
                    color: item.tint,
                    background: 'soft',
                    border: 'subtle',
                    radius: 'lg',
                    elevation: 'raised',
                }),
                styles.card,
                interactionStyles(),
            )}
        >
            <ExperimentVisual mark={item.mark} seed={item.id} color={item.tint} />

            <div {...stylex.props(styles.body)}>
                <h3 {...stylex.props(styles.title)}>{item.label}</h3>
                <p {...stylex.props(styles.summary)}>{item.summary}</p>
            </div>

            <div {...stylex.props(styles.footer)}>
                <Button
                    color={item.tint}
                    background="solid"
                    border="subtle"
                    radius="md"
                    elevation="raised"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate();
                    }}
                    style={styles.actionButton}
                >
                    Explorer {item.label} →
                </Button>
            </div>
        </article>
    );
}
