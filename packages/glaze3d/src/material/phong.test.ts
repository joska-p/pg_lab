import { describe, expect, it } from "vite-plus/test";
import { PhongMaterial, ShaderMaterial, parseColor } from "./phong";

describe("parseColor", () => {
  it("expands a hex number to 0-1 channels", () => {
    expect(parseColor(0x333333)).toEqual([0.2, 0.2, 0.2]);
    expect(parseColor(0xffffff)).toEqual([1, 1, 1]);
  });

  it("passes tuples through by value", () => {
    const input: [number, number, number] = [0.1, 0.2, 0.3];
    const parsed = parseColor(input);
    expect(parsed).toEqual([0.1, 0.2, 0.3]);
    expect(parsed).not.toBe(input);
  });
});

describe("PhongMaterial", () => {
  it("uses three.js-compatible defaults", () => {
    const material = new PhongMaterial();
    expect(material.color).toEqual([1, 1, 1]);
    expect(material.specular).toEqual([0x11 / 255, 0x11 / 255, 0x11 / 255]);
    expect(material.shininess).toBe(30);
  });

  it("accepts hex colors and demo values", () => {
    const atoms = new PhongMaterial({ color: 0x555555, shininess: 100, specular: 0x333333 });
    expect(atoms.color[0]).toBeCloseTo(0x55 / 255);
    expect(atoms.specular[0]).toBeCloseTo(0x33 / 255);
    expect(atoms.shininess).toBe(100);

    const bonds = new PhongMaterial({ color: 0x888888, shininess: 70 });
    expect(bonds.shininess).toBe(70);
    expect(bonds.color[0]).toBeCloseTo(0x88 / 255);
  });
});

describe("ShaderMaterial", () => {
  it("stores custom GLSL sources", () => {
    const material = new ShaderMaterial("void main() {}", "void main() {}");
    expect(material.vertexSource).toBe("void main() {}");
    expect(material.fragmentSource).toBe("void main() {}");
  });
});
