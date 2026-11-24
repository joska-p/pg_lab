import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

import { EXPERIMENTS, experimentCount } from '../../shell/experiments';
import { ExperimentCard } from './ExperimentCard';

const styles = stylex.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100%',
        gap: space['2'],
        '@media (min-width: 1024px)': {
            gap: space['4'],
        },
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
});

export function Scene() {
    return (
        <div {...stylex.props(styles.container)}>
            <header {...stylex.props(styles.hero)}>
                <h1 {...stylex.props(styles.heading)}>Creative Coding Laboratory</h1>
                <p {...stylex.props(styles.lead)}>
                    {experimentCount} environnements d'art procédural, de physique moléculaire,
                    d'automates cellulaires, de fractales profondes et de synthèse sonore.
                </p>
            </header>

            <div {...stylex.props(styles.grid)}>
                {EXPERIMENTS.filter((experiment) => experiment.id != 'home').map((experiment) => (
                    <ExperimentCard key={experiment.id} item={experiment} />
                ))}
            </div>
        </div>
    );
}
