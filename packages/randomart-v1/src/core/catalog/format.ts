import { assertFinite } from '../shared/shared';

/** Number → valid GLSL ES 3.00 float literal (negative values are parenthesized). */
export function formatGlslFloat(value: number): string {
    assertFinite(value, 'formatGlslFloat value');
    const s = String(value);
    const withDot = !s.includes('.') && !s.includes('e') && !s.includes('E') ? `${s}.0` : s;

    return value < 0 ? `(${withDot})` : withDot;
}
