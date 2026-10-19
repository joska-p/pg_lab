/**
 * Format.ts — GLSL text formatting utilities.
 *
 * - IsAtom / isEnclosedInParens / wrapInput: parenthesization helpers.
 *
 * Number → GLSL literal formatting lives in `catalog/format.ts` (used by the operators).
 */

const IDENTIFIER_OR_MEMBER = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)?$/;
const POSITIVE_NUMBER = /^\d+(\.\d+)?([eE][+-]?\d+)?$/;
const PARENTHESIZED_NEGATIVE = /^\(-\d+(\.\d+)?([eE][+-]?\d+)?\)$/;

/**
 * Checks whether a GLSL expression string is an atom (identifier, member access, positive number
 * literal, or parenthesized negative number literal). Atoms never require outer parentheses when
 * used as subexpressions.
 */
export function isAtom(s: string): boolean {
    return (
        IDENTIFIER_OR_MEMBER.test(s) || POSITIVE_NUMBER.test(s) || PARENTHESIZED_NEGATIVE.test(s)
    );
}

/** Checks whether a string is completely enclosed by a matching outer pair of parentheses. */
export function isEnclosedInParens(s: string): boolean {
    if (!s.startsWith('(') || !s.endsWith(')')) {
        return false;
    }
    let depth = 0;
    for (let i = 0; i < s.length - 1; i++) {
        if (s[i] === '(') {
            depth++;
        } else if (s[i] === ')') {
            depth--;
        }
        if (depth === 0) {
            return false;
        }
    }
    return depth === 1;
}

/** Wraps an expression in parentheses if it is not already an atom or enclosed in parentheses. */
export function wrapInput(s: string): string {
    if (isAtom(s) || isEnclosedInParens(s)) {
        return s;
    }
    return `(${s})`;
}
