import { describe, expect, it } from "vite-plus/test";
import cid115374 from "../../public/molecules/cid-115374.sdf?raw";
import cid1983 from "../../public/molecules/cid-1983.sdf?raw";
import cid21550 from "../../public/molecules/cid-21550.sdf?raw";
import cid52359 from "../../public/molecules/cid-52359.sdf?raw";
import cid702 from "../../public/molecules/cid-702.sdf?raw";
import cid936 from "../../public/molecules/cid-936.sdf?raw";
import { MAX_ATOMS_DESKTOP } from "./formFactors";
import { MOLECULES, parseAndValidate, switchMolecule, validateMolecule } from "./molecules";
import { parseMol } from "./parseMol";
import type { Molecule } from "./parseMol";

const WATER: Molecule = {
  name: "water",
  atoms: ["O", "H", "H"],
  pos: [
    [0, -0.3788, 0],
    [0.7586, 0.1894, 0],
    [-0.7586, 0.1894, 0],
  ],
  bonds: [
    [0, 1],
    [0, 2],
  ],
};

describe("molecules registry", () => {
  it("lists 6 SDF assets within the desktop atom budget", () => {
    expect(MOLECULES).toHaveLength(6);
    for (const entry of MOLECULES) {
      expect(entry.file).toMatch(/\.sdf$/);
      expect(entry.atoms).toBeLessThanOrEqual(MAX_ATOMS_DESKTOP);
    }
  });

  it("accepts a valid molecule", () => {
    expect(validateMolecule(WATER, MAX_ATOMS_DESKTOP)).toEqual({ ok: true });
  });

  it("refuses unknown elements, naming them", () => {
    const bad: Molecule = { ...WATER, atoms: ["C", "Xx", "H"] };
    const check = validateMolecule(bad, MAX_ATOMS_DESKTOP);
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.reason).toMatch(/Xx/);
  });

  it("refuses molecules over the atom budget", () => {
    const big: Molecule = {
      ...WATER,
      atoms: Array.from({ length: 61 }, () => "H"),
      pos: Array.from({ length: 61 }, () => [0, 0, 0] as [number, number, number]),
    };
    const check = validateMolecule(big, MAX_ATOMS_DESKTOP);
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.reason).toMatch(/61 atoms, max is 60/);
  });

  it("switchMolecule keeps the current molecule on refusal", () => {
    const bad: Molecule = { ...WATER, atoms: ["C", "Xx"] };
    const kept = switchMolecule(WATER, bad, MAX_ATOMS_DESKTOP);
    expect(kept.switched).toBe(false);
    expect(kept.mol).toBe(WATER);
    expect(kept.reason).toMatch(/Xx/);
  });

  it("switchMolecule adopts a valid candidate", () => {
    const next: Molecule = { ...WATER, name: "other" };
    const res = switchMolecule(WATER, next, MAX_ATOMS_DESKTOP);
    expect(res.switched).toBe(true);
    expect(res.mol).toBe(next);
  });

  it("parseAndValidate throws on refusal", () => {
    expect(() => parseAndValidate("not a mol file", "bad.mol", 60)).toThrow();
  });
});

describe("molecules assets", () => {
  const assets: Array<{ file: string; text: string }> = [
    { file: "cid-702.sdf", text: cid702 },
    { file: "cid-936.sdf", text: cid936 },
    { file: "cid-1983.sdf", text: cid1983 },
    { file: "cid-21550.sdf", text: cid21550 },
    { file: "cid-52359.sdf", text: cid52359 },
    { file: "cid-115374.sdf", text: cid115374 },
  ];

  it("ships one .sdf per registry entry", () => {
    expect(assets.map((a) => a.file).sort()).toEqual(MOLECULES.map((e) => e.file).sort());
  });

  it.each(assets)("parses and validates $file (atom count matches registry)", ({ file, text }) => {
    const mol = parseMol(text, file);
    expect(validateMolecule(mol, MAX_ATOMS_DESKTOP)).toEqual({ ok: true });
    expect(mol.atoms.length).toBe(MOLECULES.find((e) => e.file === file)?.atoms);
  });
});
