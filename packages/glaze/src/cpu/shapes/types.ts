import type { CssColor, FontSize, PositiveNumber } from "../../core/types";

export type Color = CssColor;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
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
