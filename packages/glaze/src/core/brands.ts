export type Brand<T, B extends string> = T & { readonly __brand: B };

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
