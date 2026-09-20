import { Mat4 } from "../math/mat4";
import { Object3D } from "./object3d";

export class PerspectiveCamera extends Object3D {
  fov: number;
  aspect: number;
  near: number;
  far: number;

  projectionMatrix: Mat4 = new Mat4();
  matrixWorldInverse: Mat4 = new Mat4();

  constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
    super();
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.updateProjectionMatrix();
  }

  updateProjectionMatrix(): void {
    const fovRadians = (this.fov * Math.PI) / 180;
    this.projectionMatrix.copy(Mat4.perspective(fovRadians, this.aspect, this.near, this.far));
  }

  // Keeps `matrixWorldInverse` fresh so external readers (drawPattern) can use
  // `elements` every frame without an explicit recompute.
  override updateMatrixWorld(force?: boolean): void {
    super.updateMatrixWorld(force);
    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
}
