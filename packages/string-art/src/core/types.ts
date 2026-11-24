export interface Size {
    readonly width: number;
    readonly height: number;
}

export interface PlacedRect {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
}

export type FitMode = 'contain' | 'cover';
