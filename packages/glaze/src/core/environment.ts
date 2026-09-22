import { createDevicePixelRatio, type DevicePixelRatio } from './render';

/**
 * Shell capability: reads the device pixel ratio without crashing under SSR/Node. Falls back to 1
 * when `window` is absent or reports a non-positive value.
 */
export function defaultGetDevicePixelRatio(): number {
    if (typeof window === 'undefined') {
        return 1;
    }

    const value = window.devicePixelRatio;

    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 1;
}

/**
 * Resolves the effective DPR: an explicit value always wins, otherwise the injected getter runs
 * (defaults to the SSR-safe reader above). Keeps stack creation total — an exotic environment can
 * no longer throw at this layer.
 */
export function resolveDevicePixelRatio(
    explicit?: DevicePixelRatio,
    getDpr: () => number = defaultGetDevicePixelRatio,
): DevicePixelRatio {
    if (explicit !== undefined) {
        return explicit;
    }

    try {
        return createDevicePixelRatio(getDpr());
    } catch {
        return createDevicePixelRatio(1);
    }
}

/**
 * Shell capability: creates a canvas via `document` when available, `null` otherwise. Callers
 * decide the fallback (see `parseViaCanvas` which already handles `null`); future document
 * injection reuses this single site.
 */
export function createDocumentCanvas(): HTMLCanvasElement | null {
    if (typeof document === 'undefined') {
        return null;
    }

    return document.createElement('canvas');
}
