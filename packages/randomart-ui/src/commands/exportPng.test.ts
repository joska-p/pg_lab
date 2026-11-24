import { createSeed } from '@repo/randomart-core/seed';
import { describe, expect, it } from 'vite-plus/test';

import { filenameSeed } from './exportPng';

describe('filenameSeed', () => {
    it('sanitizes spaces and slashes', () => {
        expect(filenameSeed(createSeed('a b/c'))).toBe('a-b-c');
    });

    it('trims leading/trailing separators', () => {
        expect(filenameSeed(createSeed('  --x--  '))).toBe('x');
    });

    it('falls back to seed for slash-only input', () => {
        expect(filenameSeed(createSeed('///'))).toBe('seed');
    });

    it('keeps digits', () => {
        expect(filenameSeed(createSeed('42'))).toBe('42');
    });
});
