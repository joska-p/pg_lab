import { Button } from '@repo/ui/components/Button';
import { Select } from '@repo/ui/components/Select';
import { ThemeToggle } from '@repo/ui/components/ThemeToggle';
import { surfaceStyle } from '@repo/ui/recipes/surface';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';
import { useNavigate } from 'react-router';

import { experimentOptions, experimentPath, getExperiment } from '../experiments';
import type { PageMeta } from '../experiments';
import { RandomJumpButton } from './RandomJumpButton';

const styles = stylex.create({
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: space['2'],
        paddingBlock: space['1'],
        gap: space['2'],
        flexShrink: 0,
        zIndex: 10,
        '@media (min-width: 1024px)': {
            gap: space['4'],
            paddingInline: space['4'],
        },
    },
    brandGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: space['3'],
        minWidth: 0,
        flex: 1,
    },
    brand: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightBold,
        letterSpacing: typography.letterSpacingWide,
        textTransform: typography.textCaseUppercase,
        color: surface.foreground,
        whiteSpace: 'nowrap',
    },
    divider: {
        width: '1px',
        height: '1.2rem',
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 18%, transparent)`,
        flexShrink: 0,
    },
    selectWrap: {
        minWidth: '160px',
        maxWidth: '320px',
        flex: 1,
    },
    headerActions: {
        display: 'none',
        alignItems: 'center',
        gap: space['2'],
        flexShrink: 0,
        '@media (min-width: 640px)': {
            display: 'flex',
        },
    },
});

interface StudioHeaderProps {
    readonly currentPage: PageMeta;
}

export function StudioHeader({ currentPage }: StudioHeaderProps) {
    const navigate = useNavigate();

    const navigateToExperiment = (id: string) => {
        if (id === 'home') {
            void navigate('/');
            return;
        }

        const experiment = getExperiment(id);
        if (experiment) {
            void navigate(experimentPath(experiment));
        }
    };

    return (
        <header
            {...stylex.props(
                surfaceStyle({
                    background: 'soft',
                    border: 'none',
                    elevation: 'raised',
                }),
                styles.header,
            )}
        >
            <div {...stylex.props(styles.brandGroup)}>
                <ThemeToggle />

                <span {...stylex.props(styles.brand)}>PG_LAB</span>
                <span {...stylex.props(styles.divider)} aria-hidden="true" />
                <div {...stylex.props(styles.selectWrap)}>
                    <Select
                        aria-label="Sélectionner une expérience"
                        font="sans"
                        value={currentPage.id}
                        onValueChange={navigateToExperiment}
                        options={[{ value: 'home', label: 'Maison' }, ...experimentOptions]}
                    />
                </div>
            </div>

            <div {...stylex.props(styles.headerActions)}>
                <RandomJumpButton />
                <Button
                    color="orange"
                    background="solid"
                    border="subtle"
                    radius="md"
                    elevation="flat"
                    onClick={() => void navigate('/')}
                    title="Revenir à l'accueil"
                >
                    maison
                </Button>
            </div>
        </header>
    );
}
