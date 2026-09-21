// Diffraction-pattern projection + normalization helpers.
// Ports the camera read (mol-demo.js drawPattern) and computeNorm32 —
// glaze3d stays unaware of the pattern; this module only reads
// `matrixWorldInverse.elements` from the outside.

import { Q_MAX, Q_MIN, ff } from "../formFactors";
import type { Molecule } from "../parseMol";

export type ProjectedAtom = {
  el: string;
  vx: number;
  vy: number;
};

export const PATTERN_GRID = 32;
export const PATTERN_SMOOTHING = 0.25;
export const PATTERN_PAT_MS = 33;
export const PATTERN_ANGLE_EPS = 0.003;

// Projects atom positions into the detector plane using the camera's
// inverse world matrix: vx = row0 . p, vy = row1 . p (qz = 0).
// Reads me[0,4,8] / me[1,5,9], exactly like mol-demo.js.
export function projectAtoms(
  mol: Pick<Molecule, "atoms" | "pos">,
  me: ArrayLike<number>,
): ProjectedAtom[] {
  const m0 = me[0] ?? 0;
  const m1 = me[1] ?? 0;
  const m4 = me[4] ?? 0;
  const m5 = me[5] ?? 0;
  const m8 = me[8] ?? 0;
  const m9 = me[9] ?? 0;
  return mol.atoms.map((el, i) => {
    const p = mol.pos[i] ?? [0, 0, 0];
    return {
      el,
      vx: m0 * p[0] + m4 * p[1] + m8 * p[2],
      vy: m1 * p[0] + m5 * p[1] + m9 * p[2],
    };
  });
}

// 97th percentile of log(1+I) over a 32x32 grid. Returns null when no
// sample falls inside [Q_MIN, Q_MAX] (caller keeps the previous norm).
export function computeNorm32Raw(
  atoms: readonly ProjectedAtom[],
  w: number,
  h: number,
): number | null {
  if (w <= 0 || h <= 0) return null;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(cx, cy) * 0.97;
  if (!(r > 0)) return null;
  const sc = Q_MAX / r;
  const sx = w / PATTERN_GRID;
  const sy = h / PATTERN_GRID;
  const buf = new Float32Array(PATTERN_GRID * PATTERN_GRID);
  let k = 0;
  for (let row = 0; row < PATTERN_GRID; row++) {
    for (let col = 0; col < PATTERN_GRID; col++) {
      const px = (col + 0.5) * sx;
      const py = (row + 0.5) * sy;
      const qx = (px - cx) * sc;
      const qy = (cy - py) * sc;
      const q = Math.sqrt(qx * qx + qy * qy);
      if (q < Q_MIN || q > Q_MAX) continue;
      let re = 0;
      let im = 0;
      for (const { el, vx, vy } of atoms) {
        const f = ff(el, q);
        const ph = qx * vx + qy * vy;
        re += f * Math.cos(ph);
        im += f * Math.sin(ph);
      }
      buf[k++] = Math.log(1 + re * re + im * im);
    }
  }
  if (!k) return null;
  const sub = buf.subarray(0, k);
  sub.sort();
  return sub[Math.floor(k * 0.97)] || 1;
}

export function smoothNormStep(prev: number, raw: number): number {
  return prev > 0 ? prev + PATTERN_SMOOTHING * (raw - prev) : raw;
}

// Stateful EMA wrapper around computeNorm32Raw. Reset on molecule switch
// (mirrors `smoothNorm = 0` in switchMolecule).
export function createPatternNorm() {
  let smooth = 0;
  return {
    get(): number {
      return smooth;
    },
    reset(): void {
      smooth = 0;
    },
    compute(atoms: readonly ProjectedAtom[], w: number, h: number): number {
      const raw = computeNorm32Raw(atoms, w, h);
      if (raw === null) return smooth || 1;
      smooth = smoothNormStep(smooth, raw);
      return smooth;
    },
  };
}

export type PatternNorm = ReturnType<typeof createPatternNorm>;
