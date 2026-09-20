import { describe, expect, it } from "vite-plus/test";
import { Vec3 } from "./vec3";

describe("Vec3", () => {
  it("length computes euclidean norm", () => {
    expect(new Vec3(3, 4, 0).length()).toBeCloseTo(5);
    expect(new Vec3(1, 2, 2).length()).toBeCloseTo(3);
  });

  it("normalize produces unit vectors and survives zero", () => {
    const v = new Vec3(0, 3, 4).normalize();
    expect(v.length()).toBeCloseTo(1);
    expect(v.y).toBeCloseTo(0.6);
    expect(v.z).toBeCloseTo(0.8);
    const zero = new Vec3(0, 0, 0).normalize();
    expect(zero.x).toBe(0);
    expect(zero.y).toBe(0);
    expect(zero.z).toBe(0);
  });

  it("subVectors returns a - b without mutating inputs", () => {
    const a = new Vec3(5, 6, 7);
    const b = new Vec3(1, 2, 3);
    const r = Vec3.subVectors(a, b);
    expect([r.x, r.y, r.z]).toEqual([4, 4, 4]);
    expect([a.x, a.y, a.z]).toEqual([5, 6, 7]);
  });

  it("lerp moves toward target", () => {
    const v = new Vec3(0, 0, 0).lerp(new Vec3(10, 0, 0), 0.25);
    expect(v.x).toBeCloseTo(2.5);
  });

  it("fromArray builds vectors (mol-demo bond path)", () => {
    const v = Vec3.fromArray([1, 2, 3]);
    expect([v.x, v.y, v.z]).toEqual([1, 2, 3]);
  });
});
