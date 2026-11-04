import { beforeEach, describe, expect, it } from 'vite-plus/test';

import { defined } from '../testing/defined';
import { clearActionError, getActionErrors, reportError, reportErrors } from './errorStore';

describe('errorStore', () => {
    beforeEach(() => {
        clearActionError();
    });

    it('keeps every error of one action batch', () => {
        reportErrors([new Error('a'), new Error('b')]);
        const errors = getActionErrors();
        expect(errors).toHaveLength(2);
        expect(errors.map((error) => error.message)).toEqual(['a', 'b']);
    });

    it('replaces the previous batch with the next one', () => {
        reportErrors([new Error('a'), new Error('b')]);
        reportErrors([new Error('c')]);
        const errors = getActionErrors();
        expect(errors).toHaveLength(1);
        expect(defined(errors[0], 'first error').message).toBe('c');
    });

    it('an empty batch changes nothing', () => {
        reportErrors([new Error('a')]);
        const before = getActionErrors();
        reportErrors([]);
        expect(getActionErrors()).toBe(before);
    });

    it('reportError converts an unknown value to an Error', () => {
        reportError('texte');
        const errors = getActionErrors();
        expect(errors).toHaveLength(1);
        expect(defined(errors[0], 'first error').message).toBe('texte');
    });

    it('clearActionError empties the list', () => {
        reportErrors([new Error('a')]);
        clearActionError();
        expect(getActionErrors()).toEqual([]);
    });
});
