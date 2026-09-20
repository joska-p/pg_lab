import type { PerspectiveCamera } from "../core/camera";
import type { Object3D } from "../core/object3d";

export interface RendererOptions {
  canvas: HTMLCanvasElement;
  alpha?: boolean;
  antialias?: boolean;
}

export type ClearColor = [number, number, number];

const VERTEX_SOURCE = `#version 300 es
in vec3 position;
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SOURCE = `#version 300 es
precision mediump float;
out vec4 outColor;
void main() {
  outColor = vec4(1.0, 0.3, 0.2, 1.0);
}
`;

const TRIANGLE_POSITIONS = new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0, 0.5, 0]);

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (shader === null) {
    throw new Error("glaze3d: unable to create shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`glaze3d: shader compile failed: ${log ?? "unknown error"}`);
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  let fragment: WebGLShader | null = null;
  try {
    fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (program === null) {
      throw new Error("glaze3d: unable to create program");
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS) !== true) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`glaze3d: program link failed: ${log ?? "unknown error"}`);
    }
    return program;
  } finally {
    gl.deleteShader(vertex);
    if (fragment !== null) {
      gl.deleteShader(fragment);
    }
  }
}

export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject | null;

  private pixelRatio = 1;
  private width = 300;
  private height = 150;
  private clearColor: ClearColor = [0, 0, 0];
  private clearAlpha = 0;

  constructor(options: RendererOptions) {
    this.canvas = options.canvas;
    const gl = options.canvas.getContext("webgl2", {
      alpha: options.alpha ?? true,
      antialias: options.antialias ?? false,
    });
    if (gl === null) {
      throw new Error("glaze3d: WebGL2 not available");
    }
    this.gl = gl;
    gl.enable(gl.DEPTH_TEST);

    this.program = createProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE);

    const buffer = gl.createBuffer();
    if (buffer === null) {
      throw new Error("glaze3d: unable to create buffer");
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, TRIANGLE_POSITIONS, gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const location = gl.getAttribLocation(this.program, "position");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.vao = vao;

    this.width = options.canvas.width > 0 ? options.canvas.width : 300;
    this.height = options.canvas.height > 0 ? options.canvas.height : 150;
    gl.clearColor(0, 0, 0, 0);
    this.applySize();
  }

  setPixelRatio(ratio: number): void {
    this.pixelRatio = ratio > 0 ? ratio : 1;
    this.applySize();
  }

  setSize(width: number, height: number): void {
    this.width = Math.max(1, Math.floor(width));
    this.height = Math.max(1, Math.floor(height));
    this.applySize();
  }

  setClearColor(color: ClearColor, alpha: number): void {
    this.clearColor = color;
    this.clearAlpha = alpha;
    this.gl.clearColor(color[0], color[1], color[2], alpha);
  }

  render(scene: Object3D, camera: PerspectiveCamera): void {
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    const gl = this.gl;
    gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearAlpha);
    // eslint-disable-next-line no-bitwise -- WebGL clear mask combines buffer bits.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  private applySize(): void {
    const bufferWidth = Math.max(1, Math.floor(this.width * this.pixelRatio));
    const bufferHeight = Math.max(1, Math.floor(this.height * this.pixelRatio));
    this.canvas.width = bufferWidth;
    this.canvas.height = bufferHeight;
    this.gl.viewport(0, 0, bufferWidth, bufferHeight);
  }
}
