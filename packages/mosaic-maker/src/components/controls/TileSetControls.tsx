import { interactionStyles } from '@repo/ui/recipes/interactions';
import { radius, space } from '@repo/ui/tokens/const.stylex';
import { typography } from '@repo/ui/tokens/const.stylex';
import { colors } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';

import { initialPalette, initialTileSet } from '../../core/constants';
import { toggleTileInSet } from '../../stores/mosaic/actions';
import { useTileSet } from '../../stores/mosaic/selectors';
import { Tile } from '../Tile';

const TILE_COLORS: [string, string, string, string, string] = [
    '--color-0',
    '--color-1',
    '--color-2',
    '--color-3',
    '--color-4',
];

const TILE_GRID_STYLE = {
    ...initialPalette,
    '--tile-size': '32px',
} as React.CSSProperties;

const styles = stylex.create({
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        alignItems: 'center',
        justifyItems: 'center',
        gap: space['4'],
        paddingInline: space['2'],
        paddingBlock: space['4'],
    },

    option: {
        display: 'grid',
        alignItems: 'center',
        justifyItems: 'center',
        gap: space['2'],
        appearance: 'none',
        padding: '3px',
        borderWidth: 0,
        borderRadius: radius.sm,
        backgroundColor: 'transparent',
        color: colors.neutral,
    },

    dimmed: {
        opacity: 0.65,
    },

    ring: {
        boxShadow: `0 0 0 3px ${colors.neutral}`,
    },

    hint: {
        margin: 0,
        fontSize: typography.fontSizeXs,
        color: `color-mix(in oklab, ${colors.neutral} 60%, transparent)`,
        textAlign: 'center',
    },
});

function TileSetControls() {
    const tileSet = useTileSet();
    const locked = tileSet.length === 1;

    return (
        <div {...stylex.props(styles.grid)} style={TILE_GRID_STYLE}>
            {initialTileSet.map((tileName) => {
                const selected = tileSet.includes(tileName);
                const isLastSelected = selected && locked;

                return (
                    <button
                        key={tileName}
                        type="button"
                        aria-label={tileName}
                        aria-pressed={selected}
                        disabled={isLastSelected}
                        title={
                            isLastSelected
                                ? `${tileName}- Keep at least one tile type selected`
                                : tileName
                        }
                        onClick={() => {
                            toggleTileInSet(tileName);
                        }}
                        {...stylex.props(
                            styles.option,
                            interactionStyles(),
                            selected ? styles.ring : styles.dimmed,
                        )}
                    >
                        <Tile name={tileName} colors={TILE_COLORS} rotation="--rotation-0" />
                    </button>
                );
            })}
        </div>
    );
}

export { TileSetControls };
