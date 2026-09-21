import type { Geometry } from '../geometry/geometry';
import type { Material } from '../material/phong';
import { Mat4 } from '../math/mat4';
import { Quat } from '../math/quat';
import { Vec3 } from '../math/vec3';

export class Object3D {
    position: Vec3 = new Vec3();
    quaternion: Quat = new Quat();
    scale: Vec3 = new Vec3(1, 1, 1);
    parent: Object3D | null = null;
    children: Object3D[] = [];

    matrix: Mat4 = new Mat4();
    matrixWorld: Mat4 = new Mat4();

    add(child: Object3D): this {
        if (child.parent !== null) {
            child.parent.remove(child);
        }
        if (!this.children.includes(child)) {
            this.children.push(child);
            child.parent = this;
        }
        return this;
    }

    remove(child: Object3D): this {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
        return this;
    }

    // Empties children for molecule swap (use case A4) without orphaning parents.
    clear(): this {
        for (const child of this.children) {
            child.parent = null;
        }
        this.children.length = 0;
        return this;
    }

    updateMatrix(): void {
        this.matrix.compose(this.position, this.quaternion, this.scale);
    }

    // Called explicitly by the renderer before each render, never on mutation,
    // so a hierarchy is not recomputed on every `position.x = ...`.
    updateMatrixWorld(_force?: boolean): void {
        this.updateMatrix();
        if (this.parent === null) {
            this.matrixWorld.copy(this.matrix);
        } else {
            this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
        }
        for (const child of this.children) {
            child.updateMatrixWorld(_force);
        }
    }
}

export class Group extends Object3D {}

// Geometry/material arrive with S4/S5; Mesh keeps opaque refs meanwhile so
// S2 hierarchy tests do not depend on a shading API that does not exist yet.
export class Mesh extends Object3D {
    geometry: Geometry | null;
    material: Material | null;

    constructor(geometry?: Geometry | null, material?: Material | null) {
        super();
        this.geometry = geometry ?? null;
        this.material = material ?? null;
    }
}

export type LightColor = [number, number, number];

function normalizeLightColor(input: number | LightColor): LightColor {
    if (typeof input === 'number') {
        const hex = Math.floor(input);
        return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
    }
    return [input[0], input[1], input[2]];
}

export class Light extends Object3D {
    color: LightColor;
    intensity: number;

    constructor(color: number | LightColor = [1, 1, 1], intensity = 1) {
        super();
        this.color = normalizeLightColor(color);
        this.intensity = intensity;
    }
}

export class AmbientLight extends Light {}

export class DirectionalLight extends Light {}
