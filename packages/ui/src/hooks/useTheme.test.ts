import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { parseTheme, readStoredTheme } from './useTheme';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('parseTheme', () => {
    it('accepts the three known themes', () => {
        expect(parseTheme('system')).toBe('system');
        expect(parseTheme('light')).toBe('light');
        expect(parseTheme('dark')).toBe('dark');
    });

    it('rejects unknown, empty and missing values', () => {
        expect(parseTheme(null)).toBe('system');
        expect(parseTheme('')).toBe('system');
        expect(parseTheme('Dark')).toBe('system');
        expect(parseTheme('dark ')).toBe('system');
        expect(parseTheme('sepia')).toBe('system');
    });
});

describe('readStoredTheme', () => {
    it('reads the stored value', () => {
        vi.stubGlobal('localStorage', { getItem: () => 'dark' });

        expect(readStoredTheme()).toBe('dark');
    });

    it('falls back to system when storage access throws (private mode)', () => {
        vi.stubGlobal('localStorage', {
            getItem: () => {
                throw new Error('storage is disabled');
            },
        });

        expect(readStoredTheme()).toBe('system');
    });
});
