import { describe, expect, it } from "vite-plus/test";
import { PerspectiveCamera } from "../core/camera";
import { Group } from "../core/object3d";
import { Renderer } from "./renderer";

interface MockGl {
  calls: string[];
  viewportArgs: number[] | null;
  clearColorArgs: number[] | null;
  clearArgs: number | null;
  drawArgs: number[] | null;
  enabled: number[];
}

function createMockGl(): { gl: Record<string, unknown>; state: MockGl } {
  const state: MockGl = {
    calls: [],
    viewportArgs: null,
    clearColorArgs: null,
    clearArgs: null,
    drawArgs: null,
    enabled: [],
  };
  const gl: Record<string, unknown> = {
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    COMPILE_STATUS: 0x8b81,
    LINK_STATUS: 0x8b82,
    ARRAY_BUFFER: 0x8892,
    STATIC_DRAW: 0x88e4,
    FLOAT: 0x1406,
    TRIANGLES: 0x0004,
    COLOR_BUFFER_BIT: 0x4000,
    DEPTH_BUFFER_BIT: 0x0100,
    DEPTH_TEST: 0x0b71,
    calls: state.calls,
    enabled: state.enabled,
    enable(cap: number): void {
      state.calls.push("enable");
      state.enabled.push(cap);
    },
    createShader(): object {
      return {};
    },
    shaderSource(): void {},
    compileShader(): void {},
    getShaderParameter(): boolean {
      return true;
    },
    getShaderInfoLog(): string {
      return "";
    },
    deleteShader(): void {},
    createProgram(): object {
      return {};
    },
    attachShader(): void {},
    linkProgram(): void {},
    getProgramParameter(): boolean {
      return true;
    },
    getProgramInfoLog(): string {
      return "";
    },
    deleteProgram(): void {},
    getAttribLocation(): number {
      return 0;
    },
    createBuffer(): object {
      return {};
    },
    bindBuffer(): void {},
    bufferData(): void {},
    createVertexArray(): object {
      return {};
    },
    bindVertexArray(): void {},
    enableVertexAttribArray(): void {},
    vertexAttribPointer(): void {},
    useProgram(): void {
      state.calls.push("useProgram");
    },
    viewport(x: number, y: number, w: number, h: number): void {
      state.calls.push("viewport");
      state.viewportArgs = [x, y, w, h];
    },
    clearColor(r: number, g: number, b: number, a: number): void {
      state.calls.push("clearColor");
      state.clearColorArgs = [r, g, b, a];
    },
    clear(mask: number): void {
      state.calls.push("clear");
      state.clearArgs = mask;
    },
    drawArrays(mode: number, first: number, count: number): void {
      state.calls.push("drawArrays");
      state.drawArgs = [mode, first, count];
    },
  };
  return { gl, state };
}

function createCanvas(mock: unknown, width = 300, height = 150): HTMLCanvasElement {
  return {
    width,
    height,
    getContext: () => mock,
  } as unknown as HTMLCanvasElement;
}

describe("Renderer skeleton", () => {
  it("throws when WebGL2 is unavailable", () => {
    const canvas = {
      width: 300,
      height: 150,
      getContext: () => null,
    } as unknown as HTMLCanvasElement;
    expect(() => new Renderer({ canvas })).toThrow("WebGL2 not available");
  });

  it("enables DEPTH_TEST and sizes the drawing buffer", () => {
    const { gl, state } = createMockGl();
    const canvas = createCanvas(gl);
    const renderer = new Renderer({ canvas });
    expect(state.enabled).toContain(0x0b71);
    renderer.setSize(200, 100);
    renderer.setPixelRatio(2);
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(200);
    expect(state.viewportArgs).toEqual([0, 0, 400, 200]);
  });

  it("forwards clear color and draws a hard-coded triangle", () => {
    const { gl, state } = createMockGl();
    const canvas = createCanvas(gl);
    const renderer = new Renderer({ canvas });
    renderer.setClearColor([0.1, 0.2, 0.3], 0.5);
    expect(state.clearColorArgs).toEqual([0.1, 0.2, 0.3, 0.5]);

    const scene = new Group();
    const camera = new PerspectiveCamera(40, 1, 0.01, 200);
    scene.position.set(1, 0, 0);
    camera.position.set(0, 0, 5);
    renderer.render(scene, camera);

    expect(scene.matrixWorld.elements[12]).toBeCloseTo(1);
    expect(camera.matrixWorld.elements[14]).toBeCloseTo(5);
    expect(state.calls).toContain("clear");
    expect(state.calls).toContain("useProgram");
    expect(state.drawArgs).toEqual([0x0004, 0, 3]);
    expect(state.clearArgs).toBe(0x4000 | 0x0100);
  });
});
