import type { ColorSpacesId } from '../../core/colorSpaces';

interface RenderColorSpaceTask {
    spaceId: ColorSpacesId;
    zValue: number;
    size: number;
}

type ColorSpaceCanvasResponse = { ok: true; bitmap: ImageBitmap } | { ok: false; error: string };

function isColorSpaceCanvasResponse(value: unknown): value is ColorSpaceCanvasResponse {
    if (typeof value !== 'object' || value === null || !('ok' in value)) {
        return false;
    }

    if (value.ok === true) {
        return 'bitmap' in value && value.bitmap instanceof ImageBitmap;
    }

    return value.ok === false && 'error' in value && typeof value.error === 'string';
}

export type { ColorSpaceCanvasResponse, RenderColorSpaceTask };
export { isColorSpaceCanvasResponse };
