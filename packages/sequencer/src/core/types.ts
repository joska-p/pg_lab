export type ParamDescriptor =
    | { type: 'number'; label: string; min: number; max: number; step: number; default: number }
    | { type: 'color'; label: string; default: string }
    | { type: 'string'; label: string; default: string }
    | { type: 'boolean'; label: string; default: boolean };

export interface CanvasLayout {
    minVal: number;
    maxVal: number;
    valueScale: number;
    offsetX: number;
    offsetY: number;
}

export interface CanvasViewport {
    enabled: boolean;
    zoom: number;
    panX: number;
    panY: number;
}

export type LayerCategory = 'cosmetic' | 'drawing';

export interface VisualLayer {
    id: string;
    name: string;
    description: string;
    category: LayerCategory;
    params: Record<string, ParamDescriptor>;
    draw: (
        ctx: CanvasRenderingContext2D,
        data: number[],
        params: Record<string, unknown>,
        layout: CanvasLayout,
    ) => void;
}

export interface LayerConfigEntry {
    id: string;
    enabled: boolean;
    params: Record<string, unknown>;
}
