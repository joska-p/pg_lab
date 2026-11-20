import { Badge } from '@repo/ui/components/Badge';
import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';
import { TextInput } from '@repo/ui/components/TextInput';
import type { ShellBackground } from '@repo/ui/recipes/shellBackground';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';
import { useNavigate } from 'react-router';

import { setShellBackground, useShellBackground } from '../../stores/appStore';
import { EXPERIMENT_ITEMS, POPULAR_TAGS } from './data';
import { useHomeStore } from './homeStore';
import type { SortMode } from './homeStore';

const styles = stylex.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['5'],
    },
    tagCloud: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: space['1'],
    },
    tagButton: {
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    tagBadge: {
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        paddingBlock: '2px',
        paddingInline: space['2'],
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
    },
    hint: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeXs,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
        margin: 0,
    },
});

export function Controls() {
    const shellBackground = useShellBackground();
    const navigate = useNavigate();

    const searchQuery = useHomeStore((s) => s.searchQuery);
    const setSearchQuery = useHomeStore((s) => s.setSearchQuery);
    const sortBy = useHomeStore((s) => s.sortBy);
    const setSortBy = useHomeStore((s) => s.setSortBy);
    const selectedTag = useHomeStore((s) => s.selectedTag);
    const toggleTag = useHomeStore((s) => s.toggleTag);
    const resetFilters = useHomeStore((s) => s.resetFilters);

    const hasActiveFilters = searchQuery.trim().length > 0 || Boolean(selectedTag);

    const handleRandomJump = () => {
        const interactiveExperiments = EXPERIMENT_ITEMS.filter((item) => !item.isHome);
        const randomItem =
            interactiveExperiments[Math.floor(Math.random() * interactiveExperiments.length)];
        if (randomItem) {
            void navigate(randomItem.path);
        }
    };

    return (
        <div {...stylex.props(styles.container)}>
            <ControlSection title="Recherche">
                <TextInput
                    aria-label="Rechercher une expérience"
                    placeholder="Titre, tag, concept..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                />
            </ControlSection>

            <ControlSection title="Ordre des cartes">
                <Select<SortMode>
                    aria-label="Ordre d'affichage"
                    value={sortBy}
                    onValueChange={setSortBy}
                    options={[
                        {
                            label: 'Ordre du lab (défaut)',
                            value: 'registry',
                        },
                        {
                            label: 'Alphabétique (A-Z)',
                            value: 'alpha',
                        },
                        {
                            label: 'Spectre des teintes',
                            value: 'tint',
                        },
                    ]}
                />
            </ControlSection>

            <ControlSection title="Filtres par algorithme">
                <div {...stylex.props(styles.tagCloud)}>
                    {POPULAR_TAGS.map((tag) => {
                        const isSelected = selectedTag === tag;
                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                title={`Filtrer par #${tag}`}
                                {...stylex.props(styles.tagButton)}
                            >
                                <Badge
                                    color={isSelected ? 'aurora' : 'neutral'}
                                    background={isSelected ? 'solid' : 'soft'}
                                    border={isSelected ? 'strong' : 'subtle'}
                                    radius="full"
                                    style={styles.tagBadge}
                                >
                                    #{tag}
                                </Badge>
                            </button>
                        );
                    })}
                </div>
                {hasActiveFilters ? (
                    <Button
                        color="neutral"
                        background="soft"
                        border="subtle"
                        radius="md"
                        elevation="flat"
                        onClick={resetFilters}
                    >
                        Réinitialiser les filtres
                    </Button>
                ) : null}
            </ControlSection>

            <ControlSection title="Accélérateur créatif">
                <div {...stylex.props(styles.buttonGroup)}>
                    <Button
                        color="solder"
                        background="solid"
                        border="subtle"
                        radius="md"
                        elevation="raised"
                        onClick={handleRandomJump}
                    >
                        🎲 Expérience au hasard
                    </Button>
                    <p {...stylex.props(styles.hint)}>
                        Saute directement dans une des 13 expériences interactives.
                    </p>
                </div>
            </ControlSection>

            <ControlSection title="Arrière-plan">
                <Select<ShellBackground>
                    label="Ambiance visuelle du shell"
                    value={shellBackground}
                    onValueChange={setShellBackground}
                    options={[
                        {
                            label: 'auroral-fluid',
                            value: 'auroral-fluid',
                        },
                        {
                            label: 'thermal-magma',
                            value: 'thermal-magma',
                        },
                        {
                            label: 'lava-flow',
                            value: 'lava-flow',
                        },
                    ]}
                />
            </ControlSection>
        </div>
    );
}
