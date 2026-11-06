import { describe, expect, it } from 'vite-plus/test';

import { FrameLoop } from './FrameLoop';
import { createMilliseconds } from './time';

function inertLoop(): FrameLoop {
    return new FrameLoop(() => undefined, {
        now: () => createMilliseconds(0),
        schedule: () => () => undefined,
    });
}

describe('FrameLoop.runFrameSubscribers', () => {
    it('iterates a snapshot: additions join the next frame, removals apply next frame', () => {
        const loop = inertLoop();
        const calls: string[] = [];
        let addedThird = false;

        const unsubscribeSecond = loop.subscribe(() => {
            calls.push('second');
        });

        loop.subscribe(() => {
            calls.push('first');
            unsubscribeSecond();

            if (!addedThird) {
                addedThird = true;
                loop.subscribe(() => {
                    calls.push('third');
                });
            }
        });

        loop.runFrameSubscribers();
        expect(calls).toEqual(['second', 'first']);

        calls.length = 0;
        loop.runFrameSubscribers();
        expect(calls).toEqual(['first', 'third']);

        loop.dispose();
    });
});
