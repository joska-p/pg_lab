/**
 * Predicate on FORMATTED LABEL strings (e.g. `sin`, `const(0.3)`, `v1`, `0.3`, `(-0.5)`).
 *
 * Domain: labels produced by `formatNodeLabel`/`formatFormula` — human-readable functional
 * notation. A label is an "atom" when `wrapInput` can emit it without extra parentheses.
 */
export function isAtom(s: string): boolean {
    if (/^v_p\.[xy]$/.test(s)) {
        return true;
    }
    if (/^u_phase$/.test(s)) {
        return true;
    }
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)) {
        // identifier like v1? but atoms are usually coords/uniforms/literals
        // be permissive - only treat single identifiers without parens as atoms? easier: check
    }
    if (/^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$/.test(s)) {
        return true;
    }
    if (/^\(-[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?\)$/.test(s)) {
        return true;
    }
    // member access
    if (/^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)) {
        return true;
    }
    return false;
}

/**
 * Predicate on RAW GLSL strings emitted by operators (e.g. `v_p.x`, `u_phase`, `0.3`, `-0.5`,
 * `(-1)`).
 *
 * Domain: raw GLSL fragments produced by `Operator.glsl` during codegen, before they are wrapped as
 * inputs. Used by compile.ts to decide whether a vertex can be inlined instead of assigned to a
 * variable. This is a different domain from `isAtom` (formatted labels) — the two must NOT be
 * merged: raw GLSL allows signed literals and partial parenthesized forms that labels do not.
 */
export function isGlslAtom(s: string): boolean {
    if (/^v_p\.[xy]$/.test(s)) {
        return true;
    }
    if (/^u_phase$/.test(s)) {
        return true;
    }
    if (/^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$/.test(s)) {
        return true;
    }
    if (/^\(-[0-9]+/.test(s)) {
        return true;
    }
    return false;
}

export function isEnclosedInParens(s: string): boolean {
    if (s.length < 2 || s[0] !== '(' || s[s.length - 1] !== ')') {
        return false;
    }
    let depth = 0;
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === '(') {
            depth++;
        } else if (c === ')') {
            depth--;
            if (depth === 0 && i < s.length - 1) {
                return false;
            }
        }
    }
    return depth === 0;
}

export function wrapInput(s: string): string {
    if (isAtom(s)) {
        return s;
    }
    if (isEnclosedInParens(s)) {
        return s;
    }
    return `(${s})`;
}
