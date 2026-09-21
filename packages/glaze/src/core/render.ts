import { assertStrictlyPositive, type Brand } from './brands';

export type CssColor = Brand<string, 'CssColor'>;
export type PositiveNumber = Brand<number, 'PositiveNumber'>;
export type FontSize = Brand<number, 'FontSize'>;
export type CanvasDimension = Brand<number, 'CanvasDimension'>;
export type BufferDimension = Brand<number, 'BufferDimension'>;
export type DevicePixelRatio = Brand<number, 'DevicePixelRatio'>;
export type StateData = Brand<Uint8Array, 'StateData'>;

export function createBufferDimension(value: number): BufferDimension {
    if (!Number.isFinite(value) || value < 1) {
        throw new Error(`Glaze: buffer dimension must be >= 1, received ${String(value)}`);
    }

    return value as BufferDimension;
}

export function createStateData(
    data: Uint8Array,
    width: BufferDimension,
    height: BufferDimension,
): StateData {
    const expectedLength = width * height;

    if (data.length !== expectedLength) {
        throw new Error(
            `Glaze: StateData length ${String(data.length)} does not match ${String(width)}x${String(height)} cells`,
        );
    }

    return data as StateData;
}

export function createCssColor(value: string): CssColor {
    if (value.length === 0) {
        throw new Error('Glaze: color must not be empty');
    }

    return value as CssColor;
}

export function createPositiveNumber(value: number): PositiveNumber {
    assertStrictlyPositive(value, 'positive number');

    return value as PositiveNumber;
}

export function createFontSize(value: number): FontSize {
    assertStrictlyPositive(value, 'font size');

    return value as FontSize;
}

export function createCanvasDimension(value: number): CanvasDimension {
    if (!Number.isFinite(value) || value < 1) {
        throw new Error(`Glaze: canvas dimension must be >= 1, received ${String(value)}`);
    }

    return value as CanvasDimension;
}

export function createDevicePixelRatio(value: number): DevicePixelRatio {
    assertStrictlyPositive(value, 'device pixel ratio');

    return value as DevicePixelRatio;
}
