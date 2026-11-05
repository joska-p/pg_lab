import { describe, expect, it } from 'vite-plus/test';

import type { Netlist } from '../engine/core/netlist';
import { createSquareScene, placeSquares } from './squareScene';

const SIMPLE_EDGE: Netlist = {
    sourceId: 'n1',
    sinkId: 'n2',
    nodes: [{ id: 'n1' }, { id: 'n2' }],
    edges: [{ id: 'e1', from: 'n1', to: 'n2', resistance: 1 }],
};

describe('createSquareScene', () => {
    it('prépare deux états géométriques et les deux carrés de Slice 1', () => {
        const scene = createSquareScene(SIMPLE_EDGE, 4, 8);

        expect(scene.squares.map((square) => square.squareId)).toEqual(['e1-c1', 'e1-c2']);

        expect(scene.from.edges.get('e1')).toMatchObject({ size: 4 });
        expect(scene.to.edges.get('e1')).toMatchObject({ size: 8 });

        expect(scene.from.nodes.get('n1')).toMatchObject({ x: 4, y: 4 });
        expect(scene.to.nodes.get('n1')).toMatchObject({ x: 8, y: 8 });

        expect(scene.from.nodes.get('n2')).toMatchObject({ x: 0, y: 0 });
        expect(scene.to.nodes.get('n2')).toMatchObject({ x: 0, y: 0 });
    });
});

describe('placeSquares', () => {
    it('ancre chaque carré sur son nœud et lui donne la taille de son arête', () => {
        const scene = createSquareScene(SIMPLE_EDGE, 4, 8);

        const start = placeSquares(scene, 0);
        expect(start).toHaveLength(2);
        expect(start).toEqual([
            { squareId: 'e1-c1', extremity: 'high', x: 4, y: 4, size: 4 },
            { squareId: 'e1-c2', extremity: 'low', x: 0, y: 0, size: 4 },
        ]);

        const end = placeSquares(scene, 1);
        expect(end).toEqual([
            { squareId: 'e1-c1', extremity: 'high', x: 8, y: 8, size: 8 },
            { squareId: 'e1-c2', extremity: 'low', x: 0, y: 0, size: 8 },
        ]);
    });

    it('interpole positions et tailles à mi-progression', () => {
        const scene = createSquareScene(SIMPLE_EDGE, 4, 8);

        const middle = placeSquares(scene, 0.5);
        expect(middle).toEqual([
            { squareId: 'e1-c1', extremity: 'high', x: 6, y: 6, size: 6 },
            { squareId: 'e1-c2', extremity: 'low', x: 0, y: 0, size: 6 },
        ]);
    });
});
