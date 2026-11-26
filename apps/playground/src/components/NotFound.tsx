import { Button } from '@repo/ui/components/Button';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';
import { useNavigate } from 'react-router';

const styles = stylex.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space['4'],
        width: '100%',
        height: '100%',
        padding: space['4'],
        textAlign: 'center',
    },
    code: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSize3xl,
        fontWeight: typography.fontWeightBold,
        color: surface.foreground,
        margin: 0,
    },
    message: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeMd,
        lineHeight: typography.lineHeightRelaxed,
        color: `color-mix(in oklab, ${surface.foreground} 80%, transparent)`,
        margin: 0,
    },
});

export function NotFound() {
    const navigate = useNavigate();

    return (
        <ExperimentShell stageLabel="404">
            <div {...stylex.props(styles.container)}>
                <p {...stylex.props(styles.code)}>404</p>
                <p {...stylex.props(styles.message)}>
                    Cette page n'existe pas dans la cours de récré.
                </p>
                <Button
                    color="aqua"
                    background="solid"
                    border="subtle"
                    radius="md"
                    elevation="raised"
                    onClick={() => void navigate('/')}
                >
                    Retour à la maison
                </Button>
            </div>
        </ExperimentShell>
    );
}
