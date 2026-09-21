import { describe, expect, it } from 'vite-plus/test';

import { ATOM, ATOM_FALLBACK, atomDisplay } from './atoms';

describe('atoms', () => {
    it('holds the CPK-ish palette (29 entries)', () => {
        expect(Object.keys(ATOM)).toHaveLength(29);
        expect(ATOM['C']).toEqual({ r: 0.77, col: 0x555555 });
        expect(ATOM['O']).toEqual({ r: 0.73, col: 0xee2010 });
        expect(ATOM['H']).toEqual({ r: 0.31, col: 0xffffff });
    });

    it('returns the palette entry for known elements', () => {
        expect(atomDisplay('O')).toBe(ATOM['O']);
    });

    it('falls back for elements without a palette entry', () => {
        // Xe has form factors but no palette color.
        expect(atomDisplay('Xe')).toBe(ATOM_FALLBACK);
        expect(atomDisplay('Xx')).toBe(ATOM_FALLBACK);
        expect(ATOM_FALLBACK).toEqual({ r: 0.77, col: 0x888888 });
    });
});
