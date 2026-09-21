import { describe, expect, it } from "vite-plus/test";
import { computeNorm32Raw, createPatternNorm, projectAtoms, smoothNormStep } from "./norm";

const MOL = {
  atoms: ["C", "O"],
  pos: [
    [1, 0, 0],
    [-1, 0, 0],
  ] as Array<[number, number, number]>,
};

// Column-major identity: rows read as me[0,4,8] / me[1,5,9].
const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

describe("projectAtoms", () => {
  it("projects (x,y) through the identity view matrix", () => {
    const atoms = projectAtoms(MOL, IDENTITY);
    expect(atoms).toHaveLength(2);
    expect(atoms[0]).toEqual({ el: "C", vx: 1, vy: 0 });
    expect(atoms[1]).toEqual({ el: "O", vx: -1, vy: 0 });
  });

  it("reads me[0,4,8]/me[1,5,9] like drawPattern", () => {
    // 90-degree roll: world +x maps to detector -y, world +y to +x.
    const me = [0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const atoms = projectAtoms(MOL, me);
    expect(atoms[0]?.vx).toBeCloseTo(0);
    expect(atoms[0]?.vy).toBeCloseTo(-1);
  });
});

describe("computeNorm32Raw", () => {
  it("returns a positive finite norm for a simple molecule", () => {
    const atoms = projectAtoms(MOL, IDENTITY);
    const norm = computeNorm32Raw(atoms, 900, 900);
    expect(norm).not.toBeNull();
    expect(norm ?? 0).toBeGreaterThan(0);
    expect(Number.isFinite(norm ?? Number.NaN)).toBe(true);
  });

  it("returns null on degenerate sizes", () => {
    const atoms = projectAtoms(MOL, IDENTITY);
    expect(computeNorm32Raw(atoms, 0, 0)).toBeNull();
  });
});

describe("pattern norm smoothing", () => {
  it("starts from raw then eases toward it (EMA 0.25)", () => {
    expect(smoothNormStep(0, 8)).toBe(8);
    expect(smoothNormStep(8, 12)).toBeCloseTo(9);
  });

  it("keeps the previous norm when the grid is empty", () => {
    const norm = createPatternNorm();
    const atoms = projectAtoms(MOL, IDENTITY);
    const first = norm.compute(atoms, 900, 900);
    expect(first).toBeGreaterThan(0);
    expect(norm.compute(atoms, 0, 0)).toBe(first);
  });

  it("resets on molecule switch", () => {
    const norm = createPatternNorm();
    const atoms = projectAtoms(MOL, IDENTITY);
    norm.compute(atoms, 900, 900);
    norm.reset();
    expect(norm.get()).toBe(0);
  });
});
