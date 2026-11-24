import { radius } from '@repo/ui/tokens/const.stylex';
import { tintVars } from '@repo/ui/tokens/tint.stylex';
import type { ColorNames } from '@repo/ui/tokens/tint.stylex';
import { GlyphBannerVisual } from '@repo/ui/visuals';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
    container: {
        width: '100%',
        height: '96px',
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        backgroundColor: `color-mix(in oklab, ${tintVars.color} 2%, transparent)`,
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: `color-mix(in oklab, ${tintVars.color} 18%, transparent)`,
    },
});

export interface ExperimentVisualProps {
    readonly seed?: number | string;
    readonly mark?: string;
    readonly color?: ColorNames;
}

export function ExperimentVisual({ seed, mark, color }: ExperimentVisualProps) {
    const visualSeed = seed ?? mark ?? 'experiment';

    return (
        <div {...stylex.props(styles.container)} aria-hidden="true">
            <GlyphBannerVisual seed={visualSeed} color={color} />
        </div>
    );
}
