import { createCssColor, type CssColor } from "@repo/glaze/core/render";
import { parseColor } from "@repo/glaze/gpu/shapes/color";
import { MAX_STATE_COUNT } from "./constants";

export function buildStateColorArray(stateColors: CssColor[]): Float32Array {
  const floats = new Float32Array(MAX_STATE_COUNT * 3);

  for (let i = 0; i < MAX_STATE_COUNT; i++) {
    const rgba = parseColor(stateColors[i] ?? "#000000");

    floats[i * 3] = rgba.r;
    floats[i * 3 + 1] = rgba.g;
    floats[i * 3 + 2] = rgba.b;
  }

  return floats;
}

function lerpColor(hexA: CssColor, hexB: CssColor, t: number): CssColor {
  const rA = parseInt(hexA.slice(1, 3), 16);
  const gA = parseInt(hexA.slice(3, 5), 16);
  const bA = parseInt(hexA.slice(5, 7), 16);

  const rB = parseInt(hexB.slice(1, 3), 16);
  const gB = parseInt(hexB.slice(3, 5), 16);
  const bB = parseInt(hexB.slice(5, 7), 16);

  const r = Math.round(rA + (rB - rA) * t);
  const g = Math.round(gA + (gB - gA) * t);
  const b = Math.round(bA + (bB - bA) * t);

  return createCssColor(`#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`);
}

// Computes all derived state colors given a rule's stateCount plus the dead and alive colors.
export function computeDerivedColors(
  stateCount: number,
  deadHex: CssColor,
  aliveHex: CssColor,
): CssColor[] {
  const colors = [deadHex, aliveHex];

  // States 2..N-1 decay from alive toward dead.
  for (let i = 2; i < stateCount; i++) {
    const t = (i - 1) / (stateCount - 1);

    colors.push(lerpColor(aliveHex, deadHex, t));
  }

  return colors;
}
