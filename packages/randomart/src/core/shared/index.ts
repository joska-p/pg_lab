export type Brand<T, B extends string> = T & { readonly __brand: B };

export function assertFinite(value: number, label: string): void {
    if (!Number.isFinite(value)) {
        throw new Error(`${label} must be a finite number, received ${String(value)}`);
    }
}
