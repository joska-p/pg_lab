import type { RGBA } from "./types";
import type { Color } from "../../core/shapes";

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const HEX_RE = /^#([0-9a-f]{3,8})$/i;

function parseHex(color: string): RGBA | null {
  const match = HEX_RE.exec(color);

  if (!match) return null;

  let hex = match[1];

  if (hex.length === 3 || hex.length === 4) {
    let expanded = "";

    for (const channel of hex) expanded += channel + channel;

    hex = expanded;
  }

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;

  return { r, g, b, a };
}

function parseChannel(token: string | undefined): number {
  if (token === undefined) return 0;

  const t = token.trim();

  if (t.endsWith("%")) return clamp01(parseFloat(t) / 100);

  return clamp01(parseFloat(t) / 255);
}

/**
 * HSL `s`/`l` channels: `50%` → 0.5; a unitless `50` is treated as 50% (legacy CSS syntax).
 * Never divides by 255 — unlike `parseChannel`, s/l are percentages, not 0..255 channels.
 */
function parsePercentageChannel(token: string | undefined): number {
  if (token === undefined) return 0;

  return clamp01(parseFloat(token) / 100);
}

function parseRgb(color: string): RGBA | null {
  const match = /^rgba?\(([^)]+)\)$/i.exec(color);

  if (!match) return null;

  const parts = match[1].split(/[,/\s]+/).filter(Boolean);

  if (parts.length < 3) return null;

  const alphaStr = parts[3] as string | undefined;
  const a =
    alphaStr !== undefined
      ? alphaStr.endsWith("%")
        ? clamp01(parseFloat(alphaStr) / 100)
        : clamp01(parseFloat(alphaStr))
      : 1;

  return {
    r: parseChannel(parts[0]),
    g: parseChannel(parts[1]),
    b: parseChannel(parts[2]),
    a,
  };
}

function hueToRgb(p: number, q: number, t: number): number {
  let h = t;

  if (h < 0) h += 1;

  if (h > 1) h -= 1;

  if (h < 1 / 6) return p + (q - p) * 6 * h;

  if (h < 1 / 2) return q;

  if (h < 2 / 3) return p + (q - p) * (2 / 3 - h) * 6;

  return p;
}

function parseHsl(color: string): RGBA | null {
  const match = /^hsla?\(([^)]+)\)$/i.exec(color);

  if (!match) return null;

  const parts = match[1].split(/[,/\s]+/).filter(Boolean);

  if (parts.length < 3) return null;

  // Hue is an angle: wrap any value into [0, 360) — `-60` and `720` behave like `300` and `0`.
  const hue = (((parseFloat(parts[0] ?? "0") % 360) + 360) % 360) / 360;
  const s = parsePercentageChannel(parts[1]);
  const l = parsePercentageChannel(parts[2]);
  const alphaStr = parts[3] as string | undefined;
  const a =
    alphaStr !== undefined
      ? alphaStr.endsWith("%")
        ? clamp01(parseFloat(alphaStr) / 100)
        : clamp01(parseFloat(alphaStr))
      : 1;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: hueToRgb(p, q, hue + 1 / 3),
    g: hueToRgb(p, q, hue),
    b: hueToRgb(p, q, hue - 1 / 3),
    a,
  };
}

const NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  yellow: "#ffff00",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  gray: "#808080",
  grey: "#808080",
  orange: "#ffa500",
  purple: "#800080",
  pink: "#ffc0cb",
  brown: "#a52a2a",
  gold: "#ffd700",
  silver: "#c0c0c0",
  navy: "#000080",
  teal: "#008080",
  lime: "#00ff00",
  transparent: "#00000000",
};

let canvasContext: CanvasRenderingContext2D | null = null;

function parseViaCanvas(color: string): RGBA | null {
  if (typeof document === "undefined") return null;

  canvasContext ??= document.createElement("canvas").getContext("2d");

  if (canvasContext === null) return null;

  canvasContext.fillStyle = "#000000";
  canvasContext.fillStyle = color;
  const normalized = canvasContext.fillStyle;

  if (normalized.startsWith("#")) return parseHex(normalized);

  return parseRgb(normalized);
}

/** Parses any CSS color to normalized 0..1 RGBA; unrecognized strings throw. */
export function parseColor(color: Color): RGBA {
  if (color.startsWith("#")) {
    const hex = parseHex(color);

    if (hex) return hex;
  } else if (/^rgba?\(/i.test(color)) {
    const rgb = parseRgb(color);

    if (rgb) return rgb;
  } else if (/^hsla?\(/i.test(color)) {
    const hsl = parseHsl(color);

    if (hsl) return hsl;
  } else {
    const named = NAMED_COLORS[color.toLowerCase()];

    if (named) {
      const hex = parseHex(named);

      if (hex) return hex;
    }

    const viaCanvas = parseViaCanvas(color);

    if (viaCanvas) return viaCanvas;
  }

  throw new Error(`Glaze: unrecognized color format "${String(color)}"`);
}

export function colorArray(color: Color): [number, number, number, number] {
  const rgba = parseColor(color);

  return [rgba.r, rgba.g, rgba.b, rgba.a];
}
