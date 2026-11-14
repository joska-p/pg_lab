import { describe, expect, it, vi } from 'vite-plus/test';

import { createPlaybackStore, globalPlaybackStore } from './usePlayback';

describe('createPlaybackStore', () => {
    it('initializes with isPlaying true and getSnapshot reflecting it', () => {
        const store = createPlaybackStore();
        expect(store.isPlaying).toBe(true);
        expect(store.getSnapshot()).toBe(true);
    });

    it('toggles playback and notifies subscribers', () => {
        const store = createPlaybackStore();
        const listener = vi.fn();
        store.subscribe(listener);

        store.togglePlay();
        expect(store.isPlaying).toBe(false);
        expect(store.getSnapshot()).toBe(false);
        expect(listener).toHaveBeenCalledTimes(1);

        store.togglePlay();
        expect(store.isPlaying).toBe(true);
        expect(store.getSnapshot()).toBe(true);
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('pauses and plays idempotently', () => {
        const store = createPlaybackStore();
        const listener = vi.fn();
        store.subscribe(listener);

        store.play(); // already playing -> no-op
        expect(listener).not.toHaveBeenCalled();

        store.pause();
        expect(store.isPlaying).toBe(false);
        expect(listener).toHaveBeenCalledTimes(1);

        store.pause(); // already paused -> no-op
        expect(listener).toHaveBeenCalledTimes(1);

        store.play();
        expect(store.isPlaying).toBe(true);
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('unsubscribes subscribers correctly', () => {
        const store = createPlaybackStore();
        const listener = vi.fn();
        const unsubscribe = store.subscribe(listener);

        store.pause();
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        store.play();
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('notifies onReset listeners when reset() is called', () => {
        const store = createPlaybackStore();
        const resetListener = vi.fn();
        const generalListener = vi.fn();

        store.onReset(resetListener);
        store.subscribe(generalListener);

        store.reset();

        expect(resetListener).toHaveBeenCalledTimes(1);
        expect(generalListener).toHaveBeenCalledTimes(1);
    });

    it('does not trigger onReset listeners on play, pause, or togglePlay', () => {
        const store = createPlaybackStore();
        const resetListener = vi.fn();

        store.onReset(resetListener);

        store.pause();
        store.play();
        store.togglePlay();

        expect(resetListener).not.toHaveBeenCalled();
    });

    it('unsubscribes onReset listeners correctly', () => {
        const store = createPlaybackStore();
        const resetListener = vi.fn();
        const unsubscribe = store.onReset(resetListener);

        store.reset();
        expect(resetListener).toHaveBeenCalledTimes(1);

        unsubscribe();
        store.reset();
        expect(resetListener).toHaveBeenCalledTimes(1);
    });
});

describe('globalPlaybackStore', () => {
    it('notifies onReset listeners on global reset', () => {
        const resetListener = vi.fn();
        const unsubscribe = globalPlaybackStore.onReset(resetListener);

        globalPlaybackStore.reset();
        expect(resetListener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });
});
