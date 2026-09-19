import {
  circleFillVertices,
  circleRing,
  circleSegments,
  circleStrokeVertices,
  capSegments,
  lineVertices,
  projectionFor,
  rectFillVertices,
  rectStrokeVertices,
  sameMat3,
} from "./geometry";
import { createLineSegment, createNormalizedVec2, type Point2D } from "../../core/types";
import { colorArray } from "../shapes/color";
import type { Mat3, ShapeBatcherOptions } from "./types";
import type { Camera } from "../../core/Camera";
import type { DrawStyle, Rect } from "../../cpu/shapes/types";

const VERTEX_STRIDE = 6; // x, y, r, g, b, a
const INITIAL_CAPACITY = 4096;
const DEFAULT_LINE_WIDTH = 1;

const SHAPE_VERTEX_SRC = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec4 a_color;
uniform mat3 u_projection;
out vec4 v_color;
void main() {
  vec3 p = u_projection * vec3(a_position, 1.0);
  gl_Position = vec4(p.xy, 0.0, 1.0);
  v_color = a_color;
}`;

const SHAPE_FRAGMENT_SRC = `#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 out_color;
void main() { out_color = v_color; }`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);

  if (!shader) throw new Error("Glaze: batcher shader creation failed");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);

    gl.deleteShader(shader);
    throw new Error(`Glaze: batcher shader compile failed: ${String(log)}`);
  }

  return shader;
}

function compileProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const program = gl.createProgram();

  if (!program) throw new Error("Glaze: batcher program creation failed");

  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);

    gl.deleteProgram(program);
    throw new Error(`Glaze: batcher program link failed: ${String(log)}`);
  }

  return program;
}

/**
 * Batches every shape into one dynamic vertex buffer, drawn in a single call per flush — the
 * pixelate2d approach ported to glaze.
 */
export class ShapeBatcher {
  readonly #gl: WebGL2RenderingContext;
  readonly #camera: Camera;
  readonly #getViewport: () => { width: number; height: number };
  #program: WebGLProgram | null = null;
  #vao: WebGLVertexArrayObject | null = null;
  #buffer: WebGLBuffer | null = null;
  #projectionLocation: WebGLUniformLocation | null = null;
  #vertices = new Float32Array(INITIAL_CAPACITY);
  #vertexCount = 0;
  #batchProjection: Mat3 | null = null;
  #initialized = false;

  constructor(options: ShapeBatcherOptions) {
    this.#gl = options.gl;
    this.#camera = options.camera;
    this.#getViewport = options.getViewport;
    this.#init();
  }

  drawCircle(center: Point2D, radius: number, style: DrawStyle): void {
    if (!this.#initialized) return;

    this.#setBatchProjection();

    if (style.fill !== undefined) {
      this.#pushCircleFill(center.x, center.y, radius, colorArray(style.fill));
    }

    if (style.stroke !== undefined) {
      this.#pushCircleStroke(
        center.x,
        center.y,
        radius,
        style.lineWidth ?? DEFAULT_LINE_WIDTH,
        colorArray(style.stroke),
      );
    }
  }

  drawRect(rect: Rect, style: DrawStyle): void {
    if (!this.#initialized) return;

    this.#setBatchProjection();

    if (style.fill !== undefined) {
      this.#pushRectFill(rect, colorArray(style.fill));
    }

    if (style.stroke !== undefined) {
      this.#pushRectStroke(rect, style.lineWidth ?? DEFAULT_LINE_WIDTH, colorArray(style.stroke));
    }
  }

  drawLine(a: Point2D, b: Point2D, style: DrawStyle): void {
    if (!this.#initialized) return;

    const color = style.stroke ?? style.fill;

    if (color === undefined) return;

    this.#setBatchProjection();
    this.#pushLine(a, b, style.lineWidth ?? DEFAULT_LINE_WIDTH, colorArray(color));
  }

  flush(): void {
    if (this.#vertexCount === 0) {
      this.#batchProjection = null;

      return;
    }

    if (
      !this.#initialized ||
      this.#program === null ||
      this.#vao === null ||
      this.#buffer === null ||
      this.#projectionLocation === null
    ) {
      this.#vertexCount = 0;
      this.#batchProjection = null;

      return;
    }

    const projection =
      this.#batchProjection ??
      (() => {
        const { width, height } = this.#getViewport();

        return projectionFor(this.#camera, width, height);
      })();
    const gl = this.#gl;

    gl.useProgram(this.#program);
    gl.bindVertexArray(this.#vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.#vertices.subarray(0, this.#vertexCount * VERTEX_STRIDE),
      gl.DYNAMIC_DRAW,
    );
    gl.uniformMatrix3fv(this.#projectionLocation, false, projection);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.drawArrays(gl.TRIANGLES, 0, this.#vertexCount);
    this.#vertexCount = 0;
    this.#batchProjection = null;
  }

  reinitialize(): void {
    this.#destroyGlObjects();
    this.#init();
  }

  destroy(): void {
    this.#destroyGlObjects();
  }

  #destroyGlObjects(): void {
    if (this.#program) this.#gl.deleteProgram(this.#program);

    if (this.#buffer) this.#gl.deleteBuffer(this.#buffer);

    if (this.#vao) this.#gl.deleteVertexArray(this.#vao);

    this.#program = null;
    this.#buffer = null;
    this.#vao = null;
    this.#projectionLocation = null;
    this.#vertices = new Float32Array(INITIAL_CAPACITY);
    this.#vertexCount = 0;
    this.#batchProjection = null;
    this.#initialized = false;
  }

  #init(): void {
    const gl = this.#gl;

    this.#program = compileProgram(gl, SHAPE_VERTEX_SRC, SHAPE_FRAGMENT_SRC);
    this.#projectionLocation = gl.getUniformLocation(this.#program, "u_projection");
    this.#buffer = gl.createBuffer();
    this.#vao = gl.createVertexArray();
    gl.bindVertexArray(this.#vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, VERTEX_STRIDE * 4, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, VERTEX_STRIDE * 4, 2 * 4);
    gl.bindVertexArray(null);
    this.#initialized = true;
  }

  #ensureCapacity(extra: number): void {
    const needed = this.#vertexCount + extra;

    if (needed <= this.#vertices.length) return;

    let size = this.#vertices.length * 2;

    while (size < needed) size *= 2;

    const next = new Float32Array(size);

    next.set(this.#vertices);
    this.#vertices = next;
  }

  #pushVertex(x: number, y: number, color: readonly [number, number, number, number]): void {
    const i = this.#vertexCount * VERTEX_STRIDE;

    this.#vertices[i] = x;
    this.#vertices[i + 1] = y;
    this.#vertices[i + 2] = color[0];
    this.#vertices[i + 3] = color[1];
    this.#vertices[i + 4] = color[2];
    this.#vertices[i + 5] = color[3];
    this.#vertexCount++;
  }

  #pushTriangle(
    p1: Point2D,
    p2: Point2D,
    p3: Point2D,
    color: readonly [number, number, number, number],
  ): void {
    this.#pushVertex(p1.x, p1.y, color);
    this.#pushVertex(p2.x, p2.y, color);
    this.#pushVertex(p3.x, p3.y, color);
  }

  #pushQuad(
    p1: Point2D,
    p2: Point2D,
    p3: Point2D,
    p4: Point2D,
    color: readonly [number, number, number, number],
  ): void {
    this.#pushTriangle(p1, p2, p3, color);
    this.#pushTriangle(p3, p4, p1, color);
  }

  #pushCircleFill(
    cx: number,
    cy: number,
    radius: number,
    color: readonly [number, number, number, number],
  ): void {
    const segments = circleSegments(radius, this.#camera.zoom);
    const ring = circleRing(cx, cy, radius, segments);

    this.#ensureCapacity(circleFillVertices(radius, this.#camera.zoom));
    const center = { x: cx, y: cy };

    for (let i = 0; i < segments; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % segments];

      this.#pushTriangle(center, a, b, color);
    }
  }

  #pushCircleStroke(
    cx: number,
    cy: number,
    radius: number,
    width: number,
    color: readonly [number, number, number, number],
  ): void {
    const segments = circleSegments(radius, this.#camera.zoom);
    const outer = circleRing(cx, cy, radius + width / 2, segments);
    const inner = circleRing(cx, cy, Math.max(0, radius - width / 2), segments);

    this.#ensureCapacity(circleStrokeVertices(radius, this.#camera.zoom));

    for (let i = 0; i < segments; i++) {
      const j = (i + 1) % segments;
      const a = outer[i];
      const b = outer[j];
      const c = inner[j];
      const d = inner[i];

      this.#pushQuad(a, b, c, d, color);
    }
  }

  #pushRectFill(rect: Rect, color: readonly [number, number, number, number]): void {
    this.#ensureCapacity(rectFillVertices());
    this.#pushQuad(
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.w, y: rect.y },
      { x: rect.x + rect.w, y: rect.y + rect.h },
      { x: rect.x, y: rect.y + rect.h },
      color,
    );
  }

  #pushRectStroke(
    rect: Rect,
    width: number,
    color: readonly [number, number, number, number],
  ): void {
    const half = width / 2;

    this.#ensureCapacity(rectStrokeVertices());
    this.#pushQuad(
      { x: rect.x, y: rect.y - half },
      { x: rect.x + rect.w, y: rect.y - half },
      { x: rect.x + rect.w, y: rect.y + half },
      { x: rect.x, y: rect.y + half },
      color,
    );
    this.#pushQuad(
      { x: rect.x, y: rect.y + rect.h - half },
      { x: rect.x + rect.w, y: rect.y + rect.h - half },
      { x: rect.x + rect.w, y: rect.y + rect.h + half },
      { x: rect.x, y: rect.y + rect.h + half },
      color,
    );
    this.#pushQuad(
      { x: rect.x - half, y: rect.y },
      { x: rect.x + half, y: rect.y },
      { x: rect.x + half, y: rect.y + rect.h },
      { x: rect.x - half, y: rect.y + rect.h },
      color,
    );
    this.#pushQuad(
      { x: rect.x + rect.w - half, y: rect.y },
      { x: rect.x + rect.w + half, y: rect.y },
      { x: rect.x + rect.w + half, y: rect.y + rect.h },
      { x: rect.x + rect.w - half, y: rect.y + rect.h },
      color,
    );
  }

  #pushCap(
    center: Point2D,
    dirX: number,
    dirY: number,
    normX: number,
    normY: number,
    half: number,
    segments: number,
    color: readonly [number, number, number, number],
  ): void {
    this.#ensureCapacity(segments * 3);

    for (let i = 0; i < segments; i++) {
      const t0 = -Math.PI / 2 + (i / segments) * Math.PI;
      const t1 = -Math.PI / 2 + ((i + 1) / segments) * Math.PI;

      this.#pushTriangle(
        center,
        {
          x: center.x + half * (Math.cos(t0) * dirX + Math.sin(t0) * normX),
          y: center.y + half * (Math.cos(t0) * dirY + Math.sin(t0) * normY),
        },
        {
          x: center.x + half * (Math.cos(t1) * dirX + Math.sin(t1) * normX),
          y: center.y + half * (Math.cos(t1) * dirY + Math.sin(t1) * normY),
        },
        color,
      );
    }
  }

  #pushLine(
    a: Point2D,
    b: Point2D,
    width: number,
    color: readonly [number, number, number, number],
  ): void {
    const segment = createLineSegment(a, b);
    const dx = segment.b.x - segment.a.x;
    const dy = segment.b.y - segment.a.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) return;

    const rawUx = dx / length;
    const rawUy = dy / length;
    const uxVec = createNormalizedVec2(rawUx, rawUy);
    const ux = uxVec.x;
    const uy = uxVec.y;
    const nxVec = createNormalizedVec2(-uy, ux);
    const nx = nxVec.x;
    const ny = nxVec.y;
    const half = width / 2;
    const segments = capSegments(width, this.#camera.zoom);

    this.#ensureCapacity(lineVertices(width, this.#camera.zoom));
    this.#pushQuad(
      { x: segment.a.x + nx * half, y: segment.a.y + ny * half },
      { x: segment.a.x - nx * half, y: segment.a.y - ny * half },
      { x: segment.b.x - nx * half, y: segment.b.y - ny * half },
      { x: segment.b.x + nx * half, y: segment.b.y + ny * half },
      color,
    );
    this.#pushCap(segment.a, -ux, -uy, nx, ny, half, segments, color);
    this.#pushCap(segment.b, ux, uy, nx, ny, half, segments, color);
  }

  #setBatchProjection(): void {
    const { width, height } = this.#getViewport();
    const projection = projectionFor(this.#camera, width, height);

    if (this.#batchProjection === null || !sameMat3(this.#batchProjection, projection)) {
      this.flush();
      this.#batchProjection = projection;
    }
  }
}
