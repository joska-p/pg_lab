import { palette, radius, space, typography } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { useImageSource, useIsProcessing } from '../../stores/manipulator/selectors';

const background = `light-dark(${palette.light0Hard}, ${palette.dark0})`;

const spin = stylex.keyframes({
    to: {
        transform: 'rotate(360deg)',
    },
});

const styles = stylex.create({
    overlay: {
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space['3'],
        borderRadius: radius.lg,
        backgroundColor: background,
    },
    spinner: {
        width: space['8'],
        height: space['8'],
        borderRadius: '9999px',
        border: '4px solid currentColor',
        borderTopColor: 'transparent',
        animationName: spin,
        animationDuration: '800ms',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
    },
    text: {
        fontSize: typography.fontSizeSm,
        opacity: 0.7,
    },
});

function ProcessingOverlay() {
    const isProcessing = useIsProcessing();
    const imageSource = useImageSource();

    if (!isProcessing || !imageSource) {
        return null;
    }

    return (
        <div {...stylex.props(styles.overlay)} role="status" aria-live="polite">
            <div {...stylex.props(styles.spinner)} />
            <p {...stylex.props(styles.text)}>Processing&hellip;</p>
        </div>
    );
}

export { ProcessingOverlay };
