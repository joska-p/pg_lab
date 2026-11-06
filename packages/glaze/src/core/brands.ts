export type Brand<T, B extends string> = T & { readonly __brand: B };

/** A finite number strictly greater than zero (`> 0`). */
export type PositiveNumber = Brand<number, 'PositiveNumber'>;

/** An integer strictly greater than zero (`>= 1`). */
export type PositiveInteger = Brand<number, 'PositiveInteger'>;

export function assertFinite(value: number, label: string): void {
    if (!Number.isFinite(value)) {
        throw new Error(`Glaze: ${label} must be a finite number, received ${String(value)}`);
    }
}

export function assertStrictlyPositive(value: number, label: string): void {
    assertFinite(value, label);

    if (value <= 0) {
        throw new Error(`Glaze: ${label} must be strictly positive, received ${String(value)}`);
    }
}

export function isPositiveNumber(value: number): value is PositiveNumber {
    return Number.isFinite(value) && value > 0;
}

/**
 * Validates once and returns the branded value. The type predicate above narrows the return, so the
 * factory needs no assertion.
 */
export function createPositiveNumber(value: number): PositiveNumber {
    if (!isPositiveNumber(value)) {
        throw new Error(`Glaze: expected a strictly positive number, received ${String(value)}`);
    }

    return value;
}

export function isPositiveInteger(value: number): value is PositiveInteger {
    return Number.isInteger(value) && value > 0;
}

/** Same contract as `createPositiveNumber`, but dimensions must also be integral. */
export function createPositiveInteger(value: number): PositiveInteger {
    if (!isPositiveInteger(value)) {
        throw new Error(`Glaze: expected a strictly positive integer, received ${String(value)}`);
    }

    return value;
}
