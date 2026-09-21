import { assertFinite, type Brand } from './brands';

export interface Point2D {
    x: number;
    y: number;
}

export type ScreenPoint = Brand<Point2D, 'ScreenPoint'>;
export type WorldPoint = Brand<Point2D, 'WorldPoint'>;
export type ScreenDelta = Brand<Point2D, 'ScreenDelta'>;
export type WorldDelta = Brand<Point2D, 'WorldDelta'>;
export type NormalizedVec2 = Brand<{ readonly x: number; readonly y: number }, 'NormalizedVec2'>;
export type LineSegment = Brand<{ readonly a: Point2D; readonly b: Point2D }, 'LineSegment'>;

export function assertFinitePoint(point: Point2D, label: string): void {
    assertFinite(point.x, `${label} x`);
    assertFinite(point.y, `${label} y`);
}

export function toScreenPoint(point: Point2D): ScreenPoint {
    assertFinitePoint(point, 'screen point');

    return point as ScreenPoint;
}

export function toWorldPoint(point: Point2D): WorldPoint {
    assertFinitePoint(point, 'world point');

    return point as WorldPoint;
}

export function toScreenDelta(delta: Point2D): ScreenDelta {
    assertFinitePoint(delta, 'screen delta');

    return delta as ScreenDelta;
}

export function toWorldDelta(delta: Point2D): WorldDelta {
    assertFinitePoint(delta, 'world delta');

    return delta as WorldDelta;
}

export function createNormalizedVec2(x: number, y: number): NormalizedVec2 {
    const lenSq = x * x + y * y;

    if (!Number.isFinite(lenSq) || Math.abs(lenSq - 1) > 1e-4) {
        throw new Error(
            `Glaze: vector must be normalized (x² + y² ≈ 1), received (${String(x)}, ${String(y)}) with length² ${String(lenSq)}`,
        );
    }

    return { x, y } as NormalizedVec2;
}

export function createLineSegment(a: Point2D, b: Point2D): LineSegment {
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (Math.hypot(dx, dy) === 0) {
        throw new Error(
            `Glaze: line segment endpoints must be distinct, received a=(${String(a.x)}, ${String(a.y)}) and b=(${String(b.x)}, ${String(b.y)})`,
        );
    }

    return { a, b } as LineSegment;
}
