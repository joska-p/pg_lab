/*
 * SVG rendering helpers. Every tile is built once from a fixed pool of paths,
 * then only `d`, `fill` and `transform` are patched in place. Nothing here
 * touches the shared mosaic container or rebuilds its children.
 */

import { COLOR_KEYS } from './constants';
import type { TileNames } from './constants';
import { TILE_REGISTRY } from './tile-registry';
import type { Shape } from './tile-registry';
import type { TileInstance } from './tiles';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Largest tile definition wins: Cube currently needs six shapes. */
export const SHAPE_SLOTS = Math.max(
    ...Object.values(TILE_REGISTRY).map((definition) => definition.shapes.length),
);

export interface TileSvg {
    svg: SVGSVGElement;
    paths: SVGPathElement[];
}

type ComputedStyles = Record<string, string>;

function updateElementStyles(element: HTMLElement, styles: ComputedStyles): void {
    for (const [prop, value] of Object.entries(styles)) {
        element.style.setProperty(prop, value);
    }
}

/** Convert a declarative shape into a path so each tile has a fixed node set. */
function shapeToPath(shape: Shape): string {
    switch (shape.type) {
        case 'circle': {
            const { cx, cy, r } = shape;

            return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
        }
        case 'rect': {
            const { x, y, width, height } = shape;

            return `M ${x} ${y} h ${width} v ${height} h ${-width} Z`;
        }
        case 'path': {
            return shape.d;
        }
        case 'polygon': {
            return `M ${shape.points.split(' ').join(' L ')} Z`;
        }
    }
}

function createTileSvg(className: string): TileSvg {
    const svg = document.createElementNS(SVG_NS, 'svg');
    const paths: SVGPathElement[] = [];

    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add(className);

    for (let index = 0; index < SHAPE_SLOTS; index += 1) {
        const path = document.createElementNS(SVG_NS, 'path');

        path.classList.add('pg-mosaic__shape');
        path.style.display = 'none';
        paths.push(path);
        svg.append(path);
    }

    return { svg, paths };
}

function paintShapes(
    paths: readonly SVGPathElement[],
    shapes: readonly Shape[],
    colors: readonly string[],
): void {
    shapes.forEach((shape, index) => {
        const path = paths[index];

        if (!path) {
            return;
        }

        path.setAttribute('d', shapeToPath(shape));
        path.setAttribute('fill', `var(${colors[shape.colorIndex] ?? COLOR_KEYS[0]})`);
        path.style.display = '';
    });

    for (let index = shapes.length; index < paths.length; index += 1) {
        const path = paths[index];

        if (path) {
            path.style.display = 'none';
        }
    }
}

function updateTileElement(tile: TileSvg, instance: TileInstance): void {
    tile.svg.style.transform = `rotate(var(${instance.rotation}))`;
    paintShapes(tile.paths, TILE_REGISTRY[instance.name]?.shapes ?? [], instance.colors);
}

function createTilePreview(name: TileNames, className: string): SVGSVGElement {
    const tile = createTileSvg(className);

    paintShapes(tile.paths, TILE_REGISTRY[name]?.shapes ?? [], COLOR_KEYS);

    return tile.svg;
}

export {
    createTilePreview,
    createTileSvg,
    paintShapes,
    shapeToPath,
    updateElementStyles,
    updateTileElement,
};
