import type { Brand, PositiveInteger } from './brands';

export type { PositiveInteger, PositiveNumber } from './brands';
export { createPositiveInteger, createPositiveNumber } from './brands';

/**
 * CSS color string. This is intentionally a plain alias, not a brand: `createCssColor` can only
 * reject empty strings, and the real validation happens in `parseColor` at the render boundary.
 */
export type CssColor = string;

export type StateData = Brand<Uint8Array, 'StateData'>;

export function createStateData(
    data: Uint8Array,
    width: PositiveInteger,
    height: PositiveInteger,
): StateData {
    const expectedLength = width * height;

    if (data.length !== expectedLength) {
        throw new Error(
            `Glaze: StateData length ${String(data.length)} does not match ${String(width)}x${String(height)} cells`,
        );
    }

    return data;
}

export function createCssColor(value: string): CssColor {
    if (value.length === 0) {
        throw new Error('Glaze: color must not be empty');
    }

    return value;
}
