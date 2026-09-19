import type { Point2D } from "./geometry";
import type { CssColor, FontSize, PositiveNumber } from "./render";

export type Color = CssColor;

/** World-space axis-aligned rectangle with full-word dimensions (no `w`/`h` shorthand). */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function rectangleFrom(x: number, y: number, width: number, height: number): Rectangle {
  return { x, y, width, height };
}

export interface DrawStyle {
  fill?: Color;
  stroke?: Color;
  lineWidth?: PositiveNumber;
}

export interface TextStyle {
  fill?: Color;
  stroke?: Color;
  lineWidth?: PositiveNumber;
  fontSize?: FontSize;
  fontFamily?: string;
  align?: "left" | "center" | "right";
  baseline?: "alphabetic" | "top" | "middle" | "bottom";
}

export interface PathOptions {
  closed?: boolean;
  fill?: boolean;
  stroke?: boolean;
}

export interface Circle {
  center: Point2D;
  radius: number;
}

export function circleFrom(center: Point2D, radius: number): Circle {
  return { center, radius };
}

export interface Segment {
  a: Point2D;
  b: Point2D;
}

export function segmentFrom(a: Point2D, b: Point2D): Segment {
  return { a, b };
}
