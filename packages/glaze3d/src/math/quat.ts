import { Vec3 } from './vec3';

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

    setFromAxisAngle(axis: Vec3, angle: number): this {
        const half = angle / 2;
        const s = Math.sin(half);
        const len = axis.length() || 1;
        this.x = (axis.x / len) * s;
        this.y = (axis.y / len) * s;
        this.z = (axis.z / len) * s;
        this.w = Math.cos(half);
        return this;
    }

    multiply(q: Quat): this {
        const ax = this.x;
        const ay = this.y;
        const az = this.z;
        const aw = this.w;
        this.x = ax * q.w + aw * q.x + ay * q.z - az * q.y;
        this.y = ay * q.w + aw * q.y + az * q.x - ax * q.z;
        this.z = az * q.w + aw * q.z + ax * q.y - ay * q.x;
        this.w = aw * q.w - ax * q.x - ay * q.y - az * q.z;
        return this;
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
            } else {
                this.x = 0;
                this.y = -from.z;
                this.z = from.y;
            }
        } else {
            const tmp = from.clone().cross(to);
            this.x = tmp.x;
            this.y = tmp.y;
            this.z = tmp.z;
        }
        this.w = r;
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
