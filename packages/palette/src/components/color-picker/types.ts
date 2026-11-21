import type { ColorPickerSpaceId } from '../../core/colorPickerSpaces';

interface RenderColorPickerSpaceTask {
    pickerSpaceId: ColorPickerSpaceId;
    zValue: number;
    size: number;
}

type ColorPickerSpaceCanvasResponse =
    | { ok: true; bitmap: ImageBitmap }
    | { ok: false; error: string };

function isColorPickerSpaceCanvasResponse(value: unknown): value is ColorPickerSpaceCanvasResponse {
    if (typeof value !== 'object' || value === null || !('ok' in value)) {
        return false;
    }

    if (value.ok === true) {
        return 'bitmap' in value && value.bitmap instanceof ImageBitmap;
    }

    return value.ok === false && 'error' in value && typeof value.error === 'string';
}

export type { ColorPickerSpaceCanvasResponse, RenderColorPickerSpaceTask };
export { isColorPickerSpaceCanvasResponse };
