import type { CSSProperties } from 'react';

export const CARD_STYLE_IDS = [
    'atlas',
    'circuit',
    'constellation',
    'contour',
    'glyph',
    'lattice',
    'orbit',
    'radar',
    'spectrum',
    'weave',
] as const;

export type CardStyleId = (typeof CARD_STYLE_IDS)[number];

export type GraphicStyle = CSSProperties;

export interface GraphicPath {
    d: string;
    fill?: 'none' | 'currentColor';
    fillOpacity?: number;
    stroke?: 'currentColor' | 'none';
    strokeWidth?: number;
    strokeOpacity?: number;
    strokeLinecap?: 'round' | 'butt' | 'square';
    strokeLinejoin?: 'round' | 'miter' | 'bevel';
    strokeDasharray?: string;
    className?: string;
    style?: GraphicStyle;
}

export interface GraphicCircle {
    cx: number;
    cy: number;
    r: number;
    fill?: 'currentColor' | 'none';
    fillOpacity?: number;
    stroke?: 'currentColor' | 'none';
    strokeWidth?: number;
    opacity?: number;
    className?: string;
    style?: GraphicStyle;
}

export interface GraphicEllipse {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    rotate?: number;
    strokeDasharray?: string;
    strokeWidth?: number;
    opacity?: number;
    className?: string;
    style?: GraphicStyle;
}

export interface GraphicLine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    strokeWidth?: number;
    opacity?: number;
    className?: string;
    style?: GraphicStyle;
}

export interface GraphicRect {
    x: number;
    y: number;
    width: number;
    height: number;
    rx?: number;
    fill?: 'currentColor' | 'none';
    fillOpacity?: number;
    opacity?: number;
    className?: string;
    style?: GraphicStyle;
}

export interface CardGraphic {
    paths: GraphicPath[];
    circles: GraphicCircle[];
    ellipses: GraphicEllipse[];
    lines: GraphicLine[];
    rects: GraphicRect[];
}
