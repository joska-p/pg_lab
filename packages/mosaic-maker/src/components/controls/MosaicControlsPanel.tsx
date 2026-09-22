import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Slider } from '@repo/ui/components/Slider';
import { colors } from '@repo/ui/tokens/colors.stylex';
import { borderWidth, radius, space } from '@repo/ui/tokens/layout.stylex';
import { motion } from '@repo/ui/tokens/motion.stylex';
import { typography } from '@repo/ui/tokens/typography.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState } from 'react';

import {
    CSS_VARS,
    DEFAULT_GAP_SIZE,
    DEFAULT_TILE_SIZE,
    initialRotations,
} from '../../core/constants';
import { cyclePalettes, regenerateTiles } from '../../stores/mosaic/actions';
import {
    useCurrentPalette,
    useIsPalettesLoading,
    useMosaicRef,
} from '../../stores/mosaic/selectors';
import { shuffleObject } from '../../utils/random/shuffleObject';
import { updateElementStyles } from '../../utils/updateElementStyles';
import { PalettePicker } from './PalettePicker';
import { TileSetControls } from './TileSetControls';

function useSliderState(
    cssVar: string,
    defaultValue: number,
    debounceMs = 150,
): { value: number; onChange: (value: number) => void } {
    const mosaicRef = useMosaicRef();
    const [value, setValue] = useState(defaultValue);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const onChange = (newValue: number) => {
        setValue(newValue);
        mosaicRef.current?.style.setProperty(cssVar, `${String(newValue)}px`);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(regenerateTiles, debounceMs);
    };

    return { value, onChange };
}

const spin = stylex.keyframes({
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
});

const styles = stylex.create({
    actions: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: space['2'],
    },

    loadingFooter: {
        display: 'grid',
        gridAutoFlow: 'column',
        placeContent: 'center',
        gap: space['2'],
        marginTop: space['2'],
        borderTopWidth: borderWidth.hairline,
        borderTopStyle: 'solid',
        borderTopColor: `color-mix(in oklab, ${colors.border} 30%, transparent)`,
        paddingTop: space['3'],
        fontSize: typography.fontSizeSm,
        color: `color-mix(in oklab, ${colors.mutedForeground} 60%, transparent)`,
    },

    spinner: {
        width: '12px',
        height: '12px',
        alignSelf: 'center',
        borderRadius: radius.full,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'currentColor',
        borderTopColor: 'transparent',
        animationName: {
            default: spin,
            '@media (prefers-reduced-motion: reduce)': 'none',
        },
        animationDuration: motion.durationSlow,
        animationTimingFunction: motion.easingLinear,
        animationIterationCount: motion.iterationInfinite,
    },
});

function MosaicControlsPanel() {
    const isPalettesLoading = useIsPalettesLoading();
    const mosaicRef = useMosaicRef();
    const currentPalette = useCurrentPalette();

    const tileSize = useSliderState(CSS_VARS.size, DEFAULT_TILE_SIZE);
    const gapSize = useSliderState(CSS_VARS.gap, DEFAULT_GAP_SIZE);

    function shuffleColors() {
        if (!mosaicRef.current) {
            return;
        }

        updateElementStyles(mosaicRef.current, shuffleObject(currentPalette));
    }

    function shuffleRotations() {
        if (!mosaicRef.current) {
            return;
        }

        updateElementStyles(mosaicRef.current, shuffleObject(initialRotations));
    }

    return (
        <>
            <ControlSection title="Tile set">
                <TileSetControls />
            </ControlSection>

            <ControlSection title="Actions">
                <div {...stylex.props(styles.actions)}>
                    <Button family="aurora" onClick={shuffleColors}>
                        Shuffle Colors
                    </Button>
                    <Button family="amber" onClick={shuffleRotations}>
                        Shuffle Rotations
                    </Button>
                    <Button
                        family="neon-violet"
                        disabled={isPalettesLoading}
                        onClick={cyclePalettes}
                    >
                        Cycle Palettes
                    </Button>
                    <Button family="solder" onClick={regenerateTiles}>
                        Regenerate Tiles
                    </Button>
                </div>
            </ControlSection>

            <ControlSection title="Layout">
                <Slider
                    label="Tile size"
                    min={32}
                    max={256}
                    step={2}
                    value={tileSize.value}
                    onValueChange={tileSize.onChange}
                />
                <Slider
                    label="Gap"
                    min={0}
                    max={64}
                    step={2}
                    value={gapSize.value}
                    onValueChange={gapSize.onChange}
                />
            </ControlSection>

            <ControlSection title="Palettes">
                <PalettePicker />
            </ControlSection>

            {isPalettesLoading && (
                <div role="status" {...stylex.props(styles.loadingFooter)}>
                    <span aria-hidden {...stylex.props(styles.spinner)} />
                    Loading palettes...
                </div>
            )}
        </>
    );
}

export { MosaicControlsPanel };
