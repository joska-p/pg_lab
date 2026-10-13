import { describe, expect, it, vi } from 'vite-plus/test';

import { swapProgram } from './programSwap';

function fakeProgram() {
    return { destroy: vi.fn() };
}

describe('swapProgram', () => {
    it('installs the first program without anything to destroy', () => {
        const holder: { current: ReturnType<typeof fakeProgram> | null } = { current: null };
        const next = fakeProgram();

        expect(swapProgram(holder, { ok: true, program: next })).toBeNull();
        expect(holder.current).toBe(next);
        expect(next.destroy).not.toHaveBeenCalled();
    });

    it('replaces the live program and destroys the old one', () => {
        const old = fakeProgram();
        const holder = { current: old as ReturnType<typeof fakeProgram> | null };
        const next = fakeProgram();

        expect(swapProgram(holder, { ok: true, program: next })).toBeNull();
        expect(holder.current).toBe(next);
        expect(old.destroy).toHaveBeenCalledTimes(1);
        expect(next.destroy).not.toHaveBeenCalled();
    });

    it('keeps the live program and returns the error on failure', () => {
        const old = fakeProgram();
        const holder = { current: old as ReturnType<typeof fakeProgram> | null };

        expect(swapProgram(holder, { ok: false, error: 'boom' })).toBe('boom');
        expect(holder.current).toBe(old);
        expect(old.destroy).not.toHaveBeenCalled();
    });
});
