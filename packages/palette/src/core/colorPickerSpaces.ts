import Color from 'colorjs.io';

interface Axis {
    label: string;
    min: number;
    max: number;
    step?: number;
}

interface ColorPickerSpace<TId extends string = string> {
    id: TId;
    label: string;
    description?: string;
    xAxis: Axis;
    yAxis: Axis;
    zSlider: Axis;
    getColor: (x: number, y: number, z: number) => Color;
}

const oklab: ColorPickerSpace = {
    id: 'oklab',
    label: 'OKLab',
    description: 'OKLab color space',
    xAxis: { label: 'a (green-red)', min: -0.4, max: 0.4 },
    yAxis: { label: 'b (blue-yellow)', min: -0.4, max: 0.4 },
    zSlider: { label: 'Lightness', min: 0, max: 1, step: 0.01 },
    getColor: (x, y, z) => new Color('oklab', [z, x, y]),
};

const oklch: ColorPickerSpace = {
    id: 'oklch',
    label: 'OKLCh',
    description: 'OKLCh color space',
    xAxis: { label: 'Chroma', min: 0, max: 0.4 },
    yAxis: { label: 'Hue', min: 0, max: 360 },
    zSlider: { label: 'Lightness', min: 0, max: 1, step: 0.01 },
    getColor: (x, y, z) => new Color('oklch', [z, x, y]),
};

const hsl: ColorPickerSpace = {
    id: 'hsl',
    label: 'HSL',
    description: 'HSL color space',
    xAxis: { label: 'Hue', min: 0, max: 360 },
    yAxis: { label: 'Saturation', min: 0, max: 100 },
    zSlider: { label: 'Lightness', min: 0, max: 100, step: 1 },
    getColor: (x, y, z) => new Color('hsl', [x, y, z]),
};

const srgb: ColorPickerSpace = {
    id: 'srgb',
    label: 'sRGB',
    description: 'sRGB color space',
    xAxis: { label: 'Red', min: 0, max: 255 },
    yAxis: { label: 'Green', min: 0, max: 255 },
    zSlider: { label: 'Blue', min: 0, max: 255, step: 1 },
    getColor: (x, y, z) => new Color('srgb', [x / 255, y / 255, z / 255]),
};

const COLOR_PICKER_SPACES = [
    oklab,
    oklch,
    hsl,
    srgb,
] as const satisfies readonly ColorPickerSpace[];

// Derive the types directly from the registry.
export type ColorPickerSpaceDefinition = (typeof COLOR_PICKER_SPACES)[number];
export type ColorPickerSpaceId = ColorPickerSpaceDefinition['id'];

const colorPickerSpacesById = new Map<string, ColorPickerSpaceDefinition>(
    COLOR_PICKER_SPACES.map(
        (colorPickerSpace): [ColorPickerSpaceId, ColorPickerSpaceDefinition] => [
            colorPickerSpace.id,
            colorPickerSpace,
        ],
    ),
);

export function getColorPickerSpace(id: string | undefined): ColorPickerSpaceDefinition {
    return colorPickerSpacesById.get(id ?? '') ?? COLOR_PICKER_SPACES[0];
}

// Select options share the registry's ordering and metadata.
export const colorPickerSpaceOptions = COLOR_PICKER_SPACES.map(({ id, label }) => ({
    value: id,
    label,
}));
