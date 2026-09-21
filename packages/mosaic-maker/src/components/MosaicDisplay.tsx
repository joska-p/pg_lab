import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef } from 'react';

import { CSS_VARS, initialGapSize, initialRotations, initialTileSize } from '../core/constants';
import { initialPalette } from '../core/constants';
import { regenerateTiles, initPalettes, setRef } from '../stores/mosaic/actions';
import { useTiles } from '../stores/mosaic/selectors';
import { Tile } from './Tile';

const styles = stylex.create({
    base: {
        flex: 1,
        minHeight: 0,
        display: 'grid',
        placeContent: 'center',
        width: '100%',
    },
});

const MOSAIC_STYLES = {
    ...initialPalette,
    ...initialTileSize,
    ...initialGapSize,
    ...initialRotations,
    gridTemplateColumns: `repeat(auto-fit,var(${CSS_VARS.size}))`,
    gap: `var(${CSS_VARS.gap})`,
} as React.CSSProperties;

function MosaicDisplay() {
    const tiles = useTiles();
    const mosaicRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setRef(mosaicRef);
    }, [mosaicRef]);

    useEffect(() => {
        const element = mosaicRef.current;
        if (!element) return;

        let timeout: ReturnType<typeof setTimeout> | null = null;
        let lastWidth = element.clientWidth;
        let lastHeight = element.clientHeight;

        const observer = new ResizeObserver(() => {
            const width = element.clientWidth;
            const height = element.clientHeight;

            if (width === lastWidth && height === lastHeight) return;
            lastWidth = width;
            lastHeight = height;

            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(regenerateTiles, 150);
        });

        observer.observe(element);

        return () => {
            if (timeout) clearTimeout(timeout);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        void initPalettes();
    }, []);

    return (
        <div
            ref={mosaicRef}
            aria-hidden="true"
            {...stylex.props(styles.base)}
            style={MOSAIC_STYLES}
        >
            {tiles.map((tile) => (
                <Tile
                    key={tile.id}
                    name={tile.name}
                    colors={tile.colors}
                    rotation={tile.rotation}
                />
            ))}
        </div>
    );
}

export { MosaicDisplay };
