export interface Point2D {
    x: number;
    y: number;
}

export interface Vec2 {
    readonly x: number;
    readonly y: number;
}

export interface LineSegment {
    readonly a: Point2D;
    readonly b: Point2D;
}

export function createNormalizedVec2(x: number, y: number): Vec2 {
    const lenSq = x * x + y * y;

    if (!Number.isFinite(lenSq) || Math.abs(lenSq - 1) > 1e-4) {
        throw new Error(
            `Glaze: vector must be normalized (x² + y² ≈ 1), received (${String(x)}, ${String(y)}) with length² ${String(lenSq)}`,
        );
    }

    return { x, y };
}

export function createLineSegment(a: Point2D, b: Point2D): LineSegment {
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (Math.hypot(dx, dy) === 0) {
        throw new Error(
            `Glaze: line segment endpoints must be distinct, received a=(${String(a.x)}, ${String(a.y)}) and b=(${String(b.x)}, ${String(b.y)})`,
        );
    }

    return { a, b };
}
