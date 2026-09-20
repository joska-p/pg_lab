import { Vec3 } from "./vec3";

export class Quat {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  copy(q: Quat): this {
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
    return this;
  }

  clone(): Quat {
    return new Quat(this.x, this.y, this.z, this.w);
  }

  setFromUnitVectors(from: Vec3, to: Vec3): this {
    // Adapted from three.js Quaternion.setFromUnitVectors (unit inputs assumed).
    let r = from.dot(to) + 1;
    if (r < 0.000001) {
      r = 0;
      if (Math.abs(from.x) > Math.abs(from.z)) {
        this.x = -from.y;
        this.y = from.x;
        this.z = 0;
        this.w = r;
      } else {
        this.x = 0;
        this.y = -from.z;
        this.z = from.y;
        this.w = r;
      }
    } else {
      const tmp = from.clone().cross(to);
      this.x = tmp.x;
      this.y = tmp.y;
      this.z = tmp.z;
      this.w = r;
    }
    return this.normalize();
  }

  angleTo(q: Quat): number {
    const dot = this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
    const clamped = Math.min(1, Math.max(-1, Math.abs(dot)));
    return 2 * Math.acos(clamped);
  }

  normalize(): this {
    const len =
      Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w) || 1;
    this.x /= len;
    this.y /= len;
    this.z /= len;
    this.w /= len;
    return this;
  }
}
