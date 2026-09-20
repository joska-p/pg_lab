import { describe, expect, it } from "vite-plus/test";
import { Quat } from "./quat";
import { Vec3 } from "./vec3";

function applyQuat(v: Vec3, q: Quat): Vec3 {
  // q * v * q^-1 for unit quats.
  const x = v.x;
  const y = v.y;
  const z = v.z;
  const qx = q.x;
  const qy = q.y;
  const qz = q.z;
  const qw = q.w;
  const ix = qw * x + qy * z - qz * y;
  const iy = qw * y + qz * x - qx * z;
  const iz = qw * z + qx * y - qy * x;
  const iw = -qx * x - qy * y - qz * z;
  return new Vec3(
    ix * qw + iw * -qx + iy * -qz - iz * -qy,
    iy * qw + iw * -qy + iz * -qx - ix * -qz,
    iz * qw + iw * -qz + ix * -qy - iy * -qx,
  );
}

describe("Quat", () => {
  it("setFromUnitVectors rotates Y onto an arbitrary bond dir", () => {
    const dir = Vec3.subVectors(new Vec3(1, 0, 0), new Vec3(0, 0, 0)).normalize();
    const q = new Quat().setFromUnitVectors(new Vec3(0, 1, 0), dir);
    const rotated = applyQuat(new Vec3(0, 1, 0), q);
    expect(rotated.x).toBeCloseTo(dir.x, 5);
    expect(rotated.y).toBeCloseTo(dir.y, 5);
    expect(rotated.z).toBeCloseTo(dir.z, 5);
  });

  it("setFromUnitVectors handles opposite vectors", () => {
    const q = new Quat().setFromUnitVectors(new Vec3(0, 1, 0), new Vec3(0, -1, 0));
    const rotated = applyQuat(new Vec3(0, 1, 0), q);
    expect(rotated.x).toBeCloseTo(0, 5);
    expect(rotated.y).toBeCloseTo(-1, 5);
    expect(rotated.z).toBeCloseTo(0, 5);
  });

  it("angleTo detects identity and small rotations (pattern early-out)", () => {
    const a = new Quat();
    const b = new Quat();
    expect(a.angleTo(b)).toBeCloseTo(0);
    const half = 0.001;
    const small = new Quat(0, Math.sin(half), 0, Math.cos(half));
    expect(a.angleTo(small)).toBeCloseTo(0.002, 4);
  });

  it("setFromAxisAngle rotates around Y by the given angle", () => {
    const q = new Quat().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2);
    const rotated = applyQuat(new Vec3(0, 0, -1), q);
    expect(rotated.x).toBeCloseTo(-1, 5);
    expect(rotated.y).toBeCloseTo(0, 5);
    expect(rotated.z).toBeCloseTo(0, 5);
  });

  it("multiply composes yaw then pitch (orbit orientation)", () => {
    const yaw = new Quat().setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2);
    const pitch = new Quat().setFromAxisAngle(new Vec3(1, 0, 0), 0);
    const composed = yaw.multiply(pitch);
    const rotated = applyQuat(new Vec3(0, 0, -1), composed);
    expect(rotated.x).toBeCloseTo(-1, 5);
    expect(rotated.y).toBeCloseTo(0, 5);
    expect(rotated.z).toBeCloseTo(0, 5);
  });
});
