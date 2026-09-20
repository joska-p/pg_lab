import { describe, expect, it } from "vite-plus/test";
import { parseMol } from "./parseMol";

const WATER = `water
comment line

  3  2  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.7586    0.5682    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.7586    0.5682    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  1  3  1  0  0  0  0
M  END
`;

// Same content without the comment line: counts land at [2] instead of [3].
const NO_COMMENT = `water

  3  2  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.7586    0.5682    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.7586    0.5682    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  1  3  1  0  0  0  0
M  END
`;

describe("parseMol", () => {
  it("parses a V2000 block (name, atoms, bonds 1-based to 0-based)", () => {
    const mol = parseMol(WATER, "water.mol");
    expect(mol.name).toBe("water");
    expect(mol.atoms).toEqual(["O", "H", "H"]);
    expect(mol.bonds).toEqual([
      [0, 1],
      [0, 2],
    ]);
  });

  it("centers positions on the centroid", () => {
    const mol = parseMol(WATER);
    const n = mol.pos.length;
    const mean = [0, 1, 2].map((k) => mol.pos.reduce((s, p) => s + p[k], 0) / n);
    expect(mean[0]).toBeCloseTo(0, 10);
    expect(mean[1]).toBeCloseTo(0, 10);
    expect(mean[2]).toBeCloseTo(0, 10);
    // O was at (0,0,0), centroid at (0,0.3788,0).
    expect(mol.pos[0][1]).toBeCloseTo(-0.3788, 4);
  });

  it("finds the counts line when the comment line is missing", () => {
    const mol = parseMol(NO_COMMENT);
    expect(mol.atoms).toEqual(["O", "H", "H"]);
    expect(mol.bonds).toHaveLength(2);
  });

  it("falls back to filename when the name field is numeric", () => {
    const sdf = WATER.replace("water", "702");
    expect(parseMol(sdf, "cid-702.sdf").name).toBe("cid-702");
  });

  it("falls back to Unknown with no usable name", () => {
    const sdf = WATER.replace("water", "   ");
    expect(parseMol(sdf).name).toBe("Unknown");
  });

  it("parses only the first record of a multi-record SDF", () => {
    const two = `${WATER}\n$$$$\n${WATER.replace("water", "other")}\n$$$$\n`;
    const mol = parseMol(two, "multi.sdf");
    expect(mol.name).toBe("water");
    expect(mol.atoms).toHaveLength(3);
  });

  it("rejects input without atom counts", () => {
    expect(() => parseMol("not a mol file")).toThrow(/could not parse atom count/);
  });

  it("rejects atoms with invalid coordinates", () => {
    const bad = WATER.replace("0.7586    0.5682", "abc       0.5682");
    expect(() => parseMol(bad)).toThrow(/invalid coordinates/);
  });

  it("rejects atoms with a missing element symbol", () => {
    const line = "    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0";
    const bad = WATER.replace(line, "    0.0000    0.0000    0.0000");
    expect(() => parseMol(bad)).toThrow(/missing element/);
  });

  it("rejects bonds referencing atoms out of range", () => {
    const bad = WATER.replace("  1  3  1", "  1  9  1");
    expect(() => parseMol(bad)).toThrow(/out of range/);
  });
});
