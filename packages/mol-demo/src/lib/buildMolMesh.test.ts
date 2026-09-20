import { describe, expect, it } from "vite-plus/test";
import { Group, Mesh } from "@repo/glaze3d/core";
import { buildMolMesh } from "./buildMolMesh";
import type { Molecule } from "./parseMol";

const MOL: Molecule = {
  name: "test",
  atoms: ["C", "O"],
  pos: [
    [1, 0, 0],
    [-1, 0, 0],
  ],
  bonds: [[0, 1]],
};

describe("buildMolMesh", () => {
  it("creates one sphere per atom plus one cylinder per bond", () => {
    const group = new Group();
    buildMolMesh(group, MOL);
    expect(group.children).toHaveLength(3);
    for (const child of group.children) {
      expect(child).toBeInstanceOf(Mesh);
    }
  });

  it("clears previous children on rebuild (no ghosts)", () => {
    const group = new Group();
    buildMolMesh(group, MOL);
    buildMolMesh(group, MOL);
    expect(group.children).toHaveLength(3);
  });

  it("centers the bond mesh at the midpoint", () => {
    const group = new Group();
    buildMolMesh(group, MOL);
    const bond = group.children[2] as Mesh;
    expect(bond.position.x).toBeCloseTo(0);
    expect(bond.position.y).toBeCloseTo(0);
    expect(bond.position.z).toBeCloseTo(0);
  });
});
