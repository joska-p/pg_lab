import type { ColorSpacesKey } from '../../core/colorSpaces';

interface RenderColorSpaceTask {
    spaceId: ColorSpacesKey;
    zValue: number;
    size: number;
}

type ColorSpaceCanvasResponse = { ok: true; bitmap: ImageBitmap } | { ok: false; error: string };

export type { ColorSpaceCanvasResponse, RenderColorSpaceTask };
