import type { PerspectiveCamera } from "../core/camera";
import { Quat } from "../math/quat";
import { Vec3 } from "../math/vec3";

export interface OrbitControlsOptions {
  enableDamping?: boolean;
  dampingFactor?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enablePan?: boolean;
  enableZoom?: boolean;
}

export type OrbitControlsEvent = "change";
export type OrbitControlsListener = () => void;

// Pixels-to-radians factor for drag rotation (no rotateSpeed option in spec).
const ROTATE_SPEED = 0.005;
// Polar clamp keeps the camera off the exact poles so the Y-up orientation
// stays defined. Min/maxPolarAngle options are hors scope.
const MIN_POLAR_ANGLE = 0.01;
const MAX_POLAR_ANGLE = Math.PI - 0.01;
// Radius clamp avoids crossing the origin target (degenerate lookAt).
const MIN_RADIUS = 0.1;
const MAX_RADIUS = 1000;
const EPSILON = 1e-9;

const AXIS_X = new Vec3(1, 0, 0);
const AXIS_Y = new Vec3(0, 1, 0);

interface WindowTarget {
  addEventListener(type: string, listener: (event: never) => void): void;
  removeEventListener(type: string, listener: (event: never) => void): void;
}

function windowTarget(): WindowTarget | null {
  const candidate = (globalThis as { window?: WindowTarget }).window;
  return candidate ?? null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export class OrbitControls {
  enableDamping = true;
  dampingFactor = 0.05;
  autoRotate = false;
  autoRotateSpeed = 2.0;
  // Accepted but a no-op: the target is fixed at the origin (spec section 7),
  // so there is nothing to pan. Kept mutable for demo-compat assignment.
  enablePan = true;
  enableZoom = true;

  private camera: PerspectiveCamera;
  private domElement: HTMLElement;
  private theta: number;
  private phi: number;
  private radius: number;
  private deltaTheta = 0;
  private deltaPhi = 0;
  private zoomScale = 1;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private listeners = new Set<OrbitControlsListener>();

  constructor(
    camera: PerspectiveCamera,
    domElement: HTMLElement,
    options: OrbitControlsOptions = {},
  ) {
    this.camera = camera;
    this.domElement = domElement;
    if (options.enableDamping !== undefined) this.enableDamping = options.enableDamping;
    if (options.dampingFactor !== undefined)
      this.dampingFactor = clamp(options.dampingFactor, 0, 1);
    if (options.autoRotate !== undefined) this.autoRotate = options.autoRotate;
    if (options.autoRotateSpeed !== undefined) this.autoRotateSpeed = options.autoRotateSpeed;
    if (options.enablePan !== undefined) this.enablePan = options.enablePan;
    if (options.enableZoom !== undefined) this.enableZoom = options.enableZoom;

    const offset = Vec3.subVectors(camera.position, new Vec3(0, 0, 0));
    this.radius = clamp(offset.length() || 1, MIN_RADIUS, MAX_RADIUS);
    this.theta = Math.atan2(offset.x, offset.z);
    this.phi = Math.acos(clamp(offset.y / this.radius, -1, 1));

    domElement.addEventListener("pointerdown", this.onPointerDown);
    domElement.addEventListener("wheel", this.onWheel, { passive: false });
  }

  addEventListener(_type: OrbitControlsEvent, callback: OrbitControlsListener): void {
    this.listeners.add(callback);
  }

  removeEventListener(_type: OrbitControlsEvent, callback: OrbitControlsListener): void {
    this.listeners.delete(callback);
  }

  dispose(): void {
    this.domElement.removeEventListener("pointerdown", this.onPointerDown);
    this.domElement.removeEventListener("wheel", this.onWheel);
    windowTarget()?.removeEventListener("pointermove", this.onPointerMove);
    windowTarget()?.removeEventListener("pointerup", this.onPointerUp);
    this.listeners.clear();
    this.dragging = false;
  }

  getAutoRotationAngle(): number {
    return ((2 * Math.PI) / 60 / 60) * this.autoRotateSpeed;
  }

  update(): void {
    let moved = false;

    if (this.autoRotate && !this.dragging) {
      this.theta -= this.getAutoRotationAngle();
      moved = true;
    }

    if (this.enableDamping) {
      const decay = 1 - this.dampingFactor;
      this.deltaTheta *= decay;
      this.deltaPhi *= decay;
      if (Math.abs(this.deltaTheta) < EPSILON) this.deltaTheta = 0;
      if (Math.abs(this.deltaPhi) < EPSILON) this.deltaPhi = 0;
      if (this.deltaTheta !== 0 || this.deltaPhi !== 0) {
        this.theta += this.deltaTheta;
        this.phi += this.deltaPhi;
        moved = true;
      }
    } else if (this.deltaTheta !== 0 || this.deltaPhi !== 0) {
      this.theta += this.deltaTheta;
      this.phi += this.deltaPhi;
      this.deltaTheta = 0;
      this.deltaPhi = 0;
      moved = true;
    }

    if (this.zoomScale !== 1) {
      this.radius = clamp(this.radius * this.zoomScale, MIN_RADIUS, MAX_RADIUS);
      this.zoomScale = 1;
      moved = true;
    }

    if (!moved) return;

    this.phi = clamp(this.phi, MIN_POLAR_ANGLE, MAX_POLAR_ANGLE);
    const sinPhi = Math.sin(this.phi);
    this.camera.position.set(
      this.radius * sinPhi * Math.sin(this.theta),
      this.radius * Math.cos(this.phi),
      this.radius * sinPhi * Math.cos(this.theta),
    );
    // Camera looks down -Z with Y up: yaw then pitch orients -Z from the
    // camera position onto the origin target.
    const yaw = new Quat().setFromAxisAngle(AXIS_Y, this.theta);
    const pitch = new Quat().setFromAxisAngle(AXIS_X, this.phi - Math.PI / 2);
    this.camera.quaternion.copy(yaw.multiply(pitch));
    this.camera.updateMatrixWorld();
    for (const listener of this.listeners) {
      listener();
    }
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    this.dragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    windowTarget()?.addEventListener("pointermove", this.onPointerMove);
    windowTarget()?.addEventListener("pointerup", this.onPointerUp);
    const element = event.currentTarget as HTMLElement | null | undefined;
    if (element != null && typeof element.setPointerCapture === "function") {
      try {
        element.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is best-effort (synthetic events in tests).
      }
    }
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.dragging) return;
    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.deltaTheta -= dx * ROTATE_SPEED;
    this.deltaPhi -= dy * ROTATE_SPEED;
  };

  private onPointerUp = (): void => {
    this.dragging = false;
    windowTarget()?.removeEventListener("pointermove", this.onPointerMove);
    windowTarget()?.removeEventListener("pointerup", this.onPointerUp);
  };

  private onWheel = (event: WheelEvent): void => {
    if (!this.enableZoom) return;
    event.preventDefault();
    this.zoomScale *= Math.exp(event.deltaY * 0.001);
  };
}
