import type { Mat3 } from "./types";
import type { Camera } from "../../core/Camera";
import type { Point2D } from "../../core/geometry";

export function multiplyMat3(a: Mat3, b: Mat3): Mat3 {
  return [
    a[0] * b[0] + a[3] * b[1] + a[6] * b[2],
    a[1] * b[0] + a[4] * b[1] + a[7] * b[2],
    a[2] * b[0] + a[5] * b[1] + a[8] * b[2],
    a[0] * b[3] + a[3] * b[4] + a[6] * b[5],
    a[1] * b[3] + a[4] * b[4] + a[7] * b[5],
    a[2] * b[3] + a[5] * b[4] + a[8] * b[5],
    a[0] * b[6] + a[3] * b[7] + a[6] * b[8],
    a[1] * b[6] + a[4] * b[7] + a[7] * b[8],
    a[2] * b[6] + a[5] * b[7] + a[8] * b[8],
  ];
}

export function sameMat3(a: Mat3, b: Mat3): boolean {
  for (let i = 0; i < 9; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

/** World → screen (CSS px, y-down): `screen = world * zoom + camera.xy`. */
export function cameraMatrix(camera: Camera): Mat3 {
  return [camera.zoom, 0, 0, 0, camera.zoom, 0, camera.x, camera.y, 1];
}

/** Screen (CSS px, y-down) → the -1..1 box GL draws in. */
export function viewportMatrix(width: number, height: number): Mat3 {
  return [2 / width, 0, 0, 0, -2 / height, 0, -1, 1, 1];
}

export function projectionFor(camera: Camera, width: number, height: number): Mat3 {
  return multiplyMat3(viewportMatrix(width, height), cameraMatrix(camera));
}

const MIN_CIRCLE_SEGMENTS = 12;
const MAX_CIRCLE_SEGMENTS = 128;
const MIN_CAP_SEGMENTS = 4;
const MAX_CAP_SEGMENTS = 32;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/** More segments for bigger circles on screen (radius × zoom), so zoomed circles stay smooth. */
export function circleSegments(radius: number, zoom: number): number {
  return clamp(Math.round(radius * zoom), MIN_CIRCLE_SEGMENTS, MAX_CIRCLE_SEGMENTS);
}

/** More segments for thicker lines on screen (width × zoom), so zoomed lines stay round. */
export function capSegments(width: number, zoom: number): number {
  return clamp(Math.round(width * zoom), MIN_CAP_SEGMENTS, MAX_CAP_SEGMENTS);
}

/** Ring vertices, starting at angle 0 (positive x). */
export function circleRing(cx: number, cy: number, radius: number, segments: number): Point2D[] {
  const points: Point2D[] = [];

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;

    points.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
  }

  return points;
}

export function circleFillVertices(radius: number, zoom: number): number {
  return circleSegments(radius, zoom) * 3;
}

export function circleStrokeVertices(radius: number, zoom: number): number {
  return circleSegments(radius, zoom) * 6;
}

export function rectFillVertices(): number {
  return 6;
}

export function rectStrokeVertices(): number {
  return 24;
}

export function lineVertices(width: number, zoom: number): number {
  return 6 + 2 * capSegments(width, zoom) * 3;
}
