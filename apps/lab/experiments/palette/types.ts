/* Message contract shared by the palette page and its worker. */

export interface GeneratePaletteTask {
    l: number;
    c: number;
    h: number;
    ruleId: string;
}

export type GeneratePaletteResponse = { ok: true; colors: string[] } | { ok: false; error: string };

export function isGeneratePaletteResponse(value: unknown): value is GeneratePaletteResponse {
    if (typeof value !== 'object' || value === null || !('ok' in value)) {
        return false;
    }

    if (value.ok === true) {
        return (
            'colors' in value &&
            Array.isArray(value.colors) &&
            value.colors.every((color: unknown) => typeof color === 'string')
        );
    }

    return value.ok === false && 'error' in value && typeof value.error === 'string';
}
