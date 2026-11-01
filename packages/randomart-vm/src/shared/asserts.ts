export function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

export function assertFinite(value: number, label: string): void {
    if (!Number.isFinite(value)) {
        throw new Error(`${label} must be a finite number`);
    }
}

export function assertIntegerInRange(value: number, label: string, min: number, max: number): void {
    assertFinite(value, label);
    if (!Number.isInteger(value)) {
        throw new Error(`${label} must be an integer, received ${value}`);
    }
    if (value < min || value > max) {
        throw new Error(`${label} must be between ${min} and ${max}, received ${value}`);
    }
}
