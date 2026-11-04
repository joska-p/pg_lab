import { describe, expect, it } from 'vite-plus/test';

import { MAX_SEED_LENGTH, createSeed, parseSeed } from './seed';

describe('seed', () => {
    it('trims identity so equivalent text is the same seed', () => {
        expect(createSeed('  42 ')).toBe(createSeed('42'));
    });

    it('rejects empty seeds and oversized seeds', () => {
        expect(() => createSeed('   ')).toThrow(RangeError);
        expect(() => createSeed('x'.repeat(MAX_SEED_LENGTH + 1))).toThrow(RangeError);
    });

    it('parses raw text without throwing', () => {
        expect(parseSeed(' hello ')).toBe(createSeed('hello'));
        expect(parseSeed('')).toBeNull();
        expect(parseSeed('   ')).toBeNull();
        expect(parseSeed('x'.repeat(MAX_SEED_LENGTH + 1))).toBeNull();
    });
});
