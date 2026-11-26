/** A color in OKLCh: perceptual lightness, chroma, and hue in degrees. */
export interface Oklch {
    l: number;
    c: number;
    /** `null` for achromatic colors, matching CSS `none`. */
    h: number | null;
}

/** The palette domain's color value. OKLCh is its canonical representation. */
export interface Color {
    readonly oklch: Oklch;
}

export interface Palette {
    colors: Color[];
}

export interface Rule<TId extends string = string> {
    id: TId;
    label: string;
    description: string;
    apply: (color: Color) => Color[];
}
