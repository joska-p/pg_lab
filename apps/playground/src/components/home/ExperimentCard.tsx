import { Badge } from '@repo/ui/components/Badge';
import { Button } from '@repo/ui/components/Button';
import { interactionStyles } from '@repo/ui/recipes/interactions';
import { surfaceStyle } from '@repo/ui/recipes/surface';
import { colorText } from '@repo/ui/recipes/tint';
import { layout, space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import { tintVars } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { experimentPath } from '../../experiments';
import type { Experiment } from '../../experiments';
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
    headerRow: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: space['2'],
    },
    slug: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        letterSpacing: typography.letterSpacingNormal,
    },
    statusBadge: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        paddingBlock: '1px',
        paddingInline: space['2'],
    },
    dimmed: {
        opacity: 0.5,
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
    tagRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: space['1'],
        marginTop: 'auto',
    },
    tagButton: {
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    tagText: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        paddingBlock: '1px',
        paddingInline: space['2'],
        color: `color-mix(in oklab, ${surface.foreground} 80%, transparent)`,
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
    readonly item: Experiment;
    readonly onSelectTag?: (tag: string) => void;
}

export function ExperimentCard({ item, onSelectTag }: ExperimentCardProps) {
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

    const handleTagClick = (event: MouseEvent, tag: string) => {
        event.stopPropagation();
        onSelectTag?.(tag);
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
            <ExperimentVisual mark={item.mark} />

            <div {...stylex.props(styles.body)}>
                <div {...stylex.props(styles.headerRow)}>
                    <span {...stylex.props(styles.slug, colorText[item.tint])}>
                        {path === '/' ? 'pg:/' : `pg:${path}`}
                    </span>
                    {item.isHome ? (
                        <Badge
                            color="neutral"
                            background="soft"
                            border="subtle"
                            radius="sm"
                            style={styles.statusBadge}
                        >
                            Hub
                        </Badge>
                    ) : (
                        <span {...stylex.props(styles.slug, styles.dimmed)}>exp</span>
                    )}
                </div>

                <h3 {...stylex.props(styles.title)}>{item.label}</h3>

                <p {...stylex.props(styles.summary)}>{item.summary}</p>

                <div {...stylex.props(styles.tagRow)}>
                    {item.tags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={(e) => handleTagClick(e, tag)}
                            title={`Filtrer par #${tag}`}
                            {...stylex.props(styles.tagButton)}
                        >
                            <Badge
                                color={item.tint}
                                background="none"
                                border="subtle"
                                radius="full"
                                style={styles.tagText}
                            >
                                #{tag}
                            </Badge>
                        </button>
                    ))}
                </div>
            </div>

            <div {...stylex.props(styles.footer)}>
                {item.isHome ? (
                    <Button
                        color="neutral"
                        background="soft"
                        border="subtle"
                        radius="md"
                        elevation="flat"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNavigate();
                        }}
                        style={styles.actionButton}
                    >
                        Accueil · Vue actuelle
                    </Button>
                ) : (
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
                )}
            </div>
        </article>
    );
}
