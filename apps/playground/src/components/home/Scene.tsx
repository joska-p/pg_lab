import { Badge } from '@repo/ui/components/Badge';
import { Button } from '@repo/ui/components/Button';
import { surfaceStyle } from '@repo/ui/recipes/surface';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

import { ExperimentCard } from './ExperimentCard';
import { useFilteredExperiments, useHomeStore } from './homeStore';

const styles = stylex.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100%',
        paddingInline: {
            default: space['4'],
            '@media (min-width: 768px)': space['6'],
            '@media (min-width: 1200px)': space['8'],
        },
        paddingBlock: {
            default: space['4'],
            '@media (min-width: 768px)': space['6'],
        },
        gap: space['6'],
    },
    hero: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
        maxWidth: '820px',
    },
    heading: {
        fontFamily: typography.fontFamilySans,
        fontSize: {
            default: typography.fontSize2xl,
            '@media (min-width: 768px)': typography.fontSize3xl,
        },
        fontWeight: typography.fontWeightBold,
        letterSpacing: typography.letterSpacingTight,
        lineHeight: typography.lineHeightTight,
        color: surface.foreground,
        margin: 0,
    },
    lead: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeMd,
        lineHeight: typography.lineHeightRelaxed,
        color: `color-mix(in oklab, ${surface.foreground} 80%, transparent)`,
        margin: 0,
    },
    metaRow: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: space['3'],
        marginTop: space['1'],
    },
    readout: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        letterSpacing: typography.letterSpacingNormal,
    },
    filterBar: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: space['2'],
    },
    clearButton: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        paddingBlock: space['1'],
        paddingInline: space['2'],
        cursor: 'pointer',
    },
    grid: {
        display: 'grid',
        gap: space['4'],
        gridTemplateColumns: {
            default: '1fr',
            '@media (min-width: 640px)': 'repeat(2, minmax(0, 1fr))',
            '@media (min-width: 1080px)': 'repeat(3, minmax(0, 1fr))',
            '@media (min-width: 1540px)': 'repeat(4, minmax(0, 1fr))',
        },
        width: '100%',
    },
    emptyContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: space['10'],
        gap: space['4'],
        textAlign: 'center',
    },
    emptyTitle: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeXl,
        fontWeight: typography.fontWeightSemibold,
        color: surface.foreground,
        margin: 0,
    },
    emptyText: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        lineHeight: typography.lineHeightNormal,
        color: `color-mix(in oklab, ${surface.foreground} 70%, transparent)`,
        maxWidth: '480px',
        margin: 0,
    },
});

export function Scene() {
    const { items, totalCount, matchingCount, hasActiveFilters } = useFilteredExperiments();
    const searchQuery = useHomeStore((s) => s.searchQuery);
    const selectedTag = useHomeStore((s) => s.selectedTag);
    const toggleTag = useHomeStore((s) => s.toggleTag);
    const resetFilters = useHomeStore((s) => s.resetFilters);

    return (
        <div {...stylex.props(styles.container)}>
            <header {...stylex.props(styles.hero)}>
                <h1 {...stylex.props(styles.heading)}>Creative Coding Laboratory</h1>
                <p {...stylex.props(styles.lead)}>
                    Quatorze environnements d'art procédural, de physique moléculaire, d'automates
                    cellulaires, de fractales profondes et de synthèse sonore.
                </p>

                <div {...stylex.props(styles.metaRow)}>
                    <Badge
                        color="aurora"
                        background="soft"
                        border="subtle"
                        radius="full"
                        style={styles.readout}
                    >
                        {hasActiveFilters
                            ? `[ ${matchingCount} / ${totalCount} expériences filtrées ]`
                            : `[ ${totalCount} expériences disponibles ]`}
                    </Badge>

                    {hasActiveFilters ? (
                        <div {...stylex.props(styles.filterBar)}>
                            {searchQuery ? (
                                <Badge color="amber" background="soft" border="subtle" radius="sm">
                                    recherche: &quot;{searchQuery}&quot;
                                </Badge>
                            ) : null}
                            {selectedTag ? (
                                <Badge color="purple" background="soft" border="subtle" radius="sm">
                                    tag: #{selectedTag}
                                </Badge>
                            ) : null}
                            <Button
                                color="neutral"
                                background="none"
                                border="subtle"
                                radius="md"
                                onClick={resetFilters}
                                style={styles.clearButton}
                            >
                                Effacer les filtres
                            </Button>
                        </div>
                    ) : null}
                </div>
            </header>

            {items.length === 0 ? (
                <div
                    {...stylex.props(
                        surfaceStyle({
                            color: 'neutral',
                            background: 'soft',
                            border: 'subtle',
                            radius: 'xl',
                            elevation: 'flat',
                        }),
                        styles.emptyContainer,
                    )}
                >
                    <h2 {...stylex.props(styles.emptyTitle)}>Aucune expérience trouvée</h2>
                    <p {...stylex.props(styles.emptyText)}>
                        Aucune expérience ne correspond à votre filtre{' '}
                        {searchQuery ? `"${searchQuery}"` : ''}
                        {selectedTag ? ` #${selectedTag}` : ''}. Essayez avec des termes comme «
                        webgl », « glsl », « automates », « oklch » ou « audio ».
                    </p>
                    <Button
                        color="aurora"
                        background="solid"
                        border="subtle"
                        radius="md"
                        elevation="raised"
                        onClick={resetFilters}
                    >
                        Réinitialiser tous les filtres
                    </Button>
                </div>
            ) : (
                <div {...stylex.props(styles.grid)}>
                    {items.map((item) => (
                        <ExperimentCard key={item.id} item={item} onSelectTag={toggleTag} />
                    ))}
                </div>
            )}
        </div>
    );
}
