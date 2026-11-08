import Color from 'colorjs.io';

interface Axis {
    label: string;
    min: number;
    max: number;
    step?: number;
}

interface ColorSpace<TId extends string = string> {
    id: TId;
    label: string;
    description?: string;
    xAxis: Axis;
    yAxis: Axis;
    zSlider: Axis;
    getColor: (x: number, y: number, z: number) => Color;
}

const oklab: ColorSpace = {
    id: 'oklab',
    label: 'OKLab',
    description: 'OKLab color space',
    xAxis: { label: 'a (green-red)', min: -0.4, max: 0.4 },
    yAxis: { label: 'b (blue-yellow)', min: -0.4, max: 0.4 },
    zSlider: { label: 'Lightness', min: 0, max: 1, step: 0.01 },
    getColor: (x, y, z) => new Color('oklab', [z, x, y]),
};

const oklch: ColorSpace = {
    id: 'oklch',
    label: 'OKLCh',
    description: 'OKLCh color space',
    xAxis: { label: 'Chroma', min: 0, max: 0.4 },
    yAxis: { label: 'Hue', min: 0, max: 360 },
    zSlider: { label: 'Lightness', min: 0, max: 1, step: 0.01 },
    getColor: (x, y, z) => new Color('oklch', [z, x, y]),
};

const hsl: ColorSpace = {
    id: 'hsl',
    label: 'HSL',
    description: 'HSL color space',
    xAxis: { label: 'Hue', min: 0, max: 360 },
    yAxis: { label: 'Saturation', min: 0, max: 100 },
    zSlider: { label: 'Lightness', min: 0, max: 100, step: 1 },
    getColor: (x, y, z) => new Color('hsl', [x, y, z]),
};

const srgb: ColorSpace = {
    id: 'srgb',
    label: 'sRGB',
    description: 'sRGB color space',
    xAxis: { label: 'Red', min: 0, max: 255 },
    yAxis: { label: 'Green', min: 0, max: 255 },
    zSlider: { label: 'Blue', min: 0, max: 255, step: 1 },
    getColor: (x, y, z) => new Color('srgb', [x / 255, y / 255, z / 255]),
};

const COLORSPACES = [oklab, oklch, hsl, srgb] as const satisfies readonly ColorSpace[];

// Derive the types directly from the registry.
export type ColorspacetDefinition = (typeof COLORSPACES)[number];
export type ColorSpacesId = ColorspacetDefinition['id'];

export const ColorSpacesById = new Map<string, ColorspacetDefinition>(
    COLORSPACES.map((colorspace): [ColorSpacesId, ColorspacetDefinition] => [
        colorspace.id,
        colorspace,
    ]),
);

export function getColorSpace(id: string | undefined): ColorspacetDefinition {
    return ColorSpacesById.get(id ?? '') ?? COLORSPACES[0];
}

// Select options share the registry's ordering and metadata.
export const colorSpaceOptions = COLORSPACES.map(({ id, label }) => ({
    value: id,
    label,
}));
