import { describe, expect, it } from 'vite-plus/test';

import { circleFrom, rectangleFrom, segmentFrom } from './shapes';

describe('core/shapes factories', () => {
    it('rectangleFrom builds full-word bounds', () => {
        expect(rectangleFrom(1, 2, 3, 4)).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    });

    it('circleFrom pairs center and radius', () => {
        expect(circleFrom({ x: 5, y: 6 }, 7)).toEqual({ center: { x: 5, y: 6 }, radius: 7 });
    });

    it('segmentFrom pairs endpoints', () => {
        expect(segmentFrom({ x: 0, y: 0 }, { x: 1, y: 1 })).toEqual({
            a: { x: 0, y: 0 },
            b: { x: 1, y: 1 },
        });
    });
});
