import { describe, expect, it } from "vite-plus/test";
import { PerspectiveCamera } from "../core/camera";
import { AmbientLight, DirectionalLight, Group, Mesh } from "../core/object3d";
import { Geometry } from "../geometry/geometry";
import { CylinderGeometry } from "../geometry/cylinder";
import { SphereGeometry } from "../geometry/sphere";
import { PhongMaterial, ShaderMaterial } from "../material/phong";
import { MAX_DIRECTIONAL_LIGHTS, Renderer } from "./renderer";

interface MockGl {
  calls: string[];
  viewportArgs: number[] | null;
  clearColorArgs: number[] | null;
  clearArgs: number | null;
  drawElementsArgs: number[] | null;
  enabled: number[];
  programs: object[];
  usedPrograms: object[];
  shaderSources: string[];
  uniformByName: Map<string, number[] | Float32Array | number>;
  locationNames: Map<object, string>;
}

function createMockGl(): { gl: Record<string, unknown>; state: MockGl } {
  const state: MockGl = {
    calls: [],
    viewportArgs: null,
    clearColorArgs: null,
    clearArgs: null,
    drawElementsArgs: null,
    enabled: [],
    programs: [],
    usedPrograms: [],
    shaderSources: [],
    uniformByName: new Map(),
    locationNames: new Map(),
  };
  const gl: Record<string, unknown> = {
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    COMPILE_STATUS: 0x8b81,
    LINK_STATUS: 0x8b82,
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,
    STATIC_DRAW: 0x88e4,
    FLOAT: 0x1406,
    UNSIGNED_SHORT: 0x1403,
    UNSIGNED_INT: 0x1405,
    TRIANGLES: 0x0004,
    COLOR_BUFFER_BIT: 0x4000,
    DEPTH_BUFFER_BIT: 0x0100,
    DEPTH_TEST: 0x0b71,
    enable(cap: number): void {
      state.calls.push("enable");
      state.enabled.push(cap);
    },
    createShader(): object {
      return {};
    },
    shaderSource(_shader: unknown, source: string): void {
      state.shaderSources.push(source);
    },
    compileShader(): void {},
    getShaderParameter(): boolean {
      return true;
    },
    getShaderInfoLog(): string {
      return "";
    },
    deleteShader(): void {},
    createProgram(): object {
      const program = {};
      state.programs.push(program);
      return program;
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
    getUniformLocation(_program: unknown, name: string): object {
      const location = { name };
      state.locationNames.set(location, name);
      return location;
    },
    uniformMatrix4fv(location: unknown, _transpose: boolean, value: Float32Array): void {
      const name = state.locationNames.get(location as object) ?? "unknown";
      state.uniformByName.set(name, Array.from(value));
    },
    uniformMatrix3fv(location: unknown, _transpose: boolean, value: Float32Array): void {
      const name = state.locationNames.get(location as object) ?? "unknown";
      state.uniformByName.set(name, Array.from(value));
    },
    uniform3f(location: unknown, x: number, y: number, z: number): void {
      const name = state.locationNames.get(location as object) ?? "unknown";
      state.uniformByName.set(name, [x, y, z]);
    },
    uniform1f(location: unknown, x: number): void {
      const name = state.locationNames.get(location as object) ?? "unknown";
      state.uniformByName.set(name, x);
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
    useProgram(program: unknown): void {
      state.calls.push("useProgram");
      state.usedPrograms.push(program as object);
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
    drawElements(mode: number, count: number, type: number, offset: number): void {
      state.calls.push("drawElements");
      state.drawElementsArgs = [mode, count, type, offset];
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

function demoScene(): { scene: Group; camera: PerspectiveCamera; geometry: SphereGeometry } {
  const scene = new Group();
  const camera = new PerspectiveCamera(40, 1, 0.01, 200);
  camera.position.set(0, 0, 5);
  scene.add(camera);
  const keyLight = new DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(5, 8, -6);
  camera.add(keyLight);
  scene.add(new AmbientLight(0xffffff, 0.5));
  const geometry = new SphereGeometry(1, 8, 6);
  const material = new PhongMaterial({ color: 0x555555, shininess: 100, specular: 0x333333 });
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);
  return { scene, camera, geometry };
}

describe("Renderer", () => {
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

  it("compiles a Phong shader with a fixed directional light budget", () => {
    const { gl, state } = createMockGl();
    const canvas = createCanvas(gl);
    new Renderer({ canvas });
    expect(MAX_DIRECTIONAL_LIGHTS).toBe(4);
    const fragment = state.shaderSources.find((source) => source.includes("uDirColors"));
    expect(fragment).toBeDefined();
    expect(fragment).toContain(`NUM_DIR_LIGHTS ${MAX_DIRECTIONAL_LIGHTS}`);
  });

  it("renders a lit Phong mesh with drawElements and material uniforms", () => {
    const { gl, state } = createMockGl();
    const canvas = createCanvas(gl);
    const renderer = new Renderer({ canvas });
    const { scene, camera, geometry } = demoScene();
    renderer.render(scene, camera);

    expect(camera.matrixWorld.elements[14]).toBeCloseTo(5);
    expect(state.calls).toContain("drawElements");
    expect(state.drawElementsArgs?.[0]).toBe(0x0004);
    expect(state.drawElementsArgs?.[1]).toBe(geometry.indexCount);
    expect(state.drawElementsArgs?.[2]).toBe(0x1403);
    expect(state.clearArgs).toBe(0x4000 | 0x0100);

    const diffuse = state.uniformByName.get("uDiffuse") as number[];
    expect(diffuse[0]).toBeCloseTo(0x55 / 255);
    const ambient = state.uniformByName.get("uAmbientColor") as number[];
    expect(ambient).toEqual([0.5, 0.5, 0.5]);
    expect(state.uniformByName.get("uShininess")).toBe(100);
    // Identity rotation on the modelView keeps the normal matrix identity.
    const normal = state.uniformByName.get("uNormalMatrix") as number[];
    expect(normal).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  });

  it("derives a camera-attached headlamp direction from its world position", () => {
    const { gl, state } = createMockGl();
    const canvas = createCanvas(gl);
    const renderer = new Renderer({ canvas });
    const { scene, camera } = demoScene();
    renderer.render(scene, camera);

    // World position (5, 8, -1): camera at (0,0,5) plus local (5,8,-6).
    // View rotation is identity, so the view-space direction matches.
    const direction = state.uniformByName.get("uDirDirections[0]") as number[];
    const length = Math.hypot(5, 8, -1);
    expect(direction[0]).toBeCloseTo(5 / length);
    expect(direction[1]).toBeCloseTo(8 / length);
    expect(direction[2]).toBeCloseTo(-1 / length);
    const color = state.uniformByName.get("uDirColors[0]") as number[];
    expect(color).toEqual([1.2, 1.2, 1.2]);
  });

  it("finds camera-attached lights even when the camera is outside the scene", () => {
    const { gl, state } = createMockGl();
    const canvas = createCanvas(gl);
    const renderer = new Renderer({ canvas });
    const scene = new Group();
    const camera = new PerspectiveCamera(40, 1, 0.01, 200);
    camera.position.set(0, 0, 5);
    const headlamp = new DirectionalLight(0xffffff, 0.4);
    headlamp.position.set(0, 0, 1);
    camera.add(headlamp);
    scene.add(new Mesh(new SphereGeometry(1, 8, 6), new PhongMaterial()));
    renderer.render(scene, camera);

    const color = state.uniformByName.get("uDirColors[0]") as number[];
    expect(color).toEqual([0.4, 0.4, 0.4]);
  });

  it("clamps extra directional lights to the compile-time budget", () => {
    const { gl, state } = createMockGl();
    const canvas = createCanvas(gl);
    const renderer = new Renderer({ canvas });
    const scene = new Group();
    const camera = new PerspectiveCamera(40, 1, 0.01, 200);
    for (let i = 0; i < 6; i++) {
      const light = new DirectionalLight([1, 1, 1], 0.1);
      light.position.set(0, 1, 0);
      scene.add(light);
    }
    scene.add(new Mesh(new SphereGeometry(1, 8, 6), new PhongMaterial()));
    renderer.render(scene, camera);

    expect(state.calls).toContain("drawElements");
    expect(state.uniformByName.has("uDirColors[3]")).toBe(true);
    expect(state.uniformByName.has("uDirColors[4]")).toBe(false);
  });

  it("compiles a custom ShaderMaterial on its own program", () => {
    const { gl, state } = createMockGl();
    const canvas = createCanvas(gl);
    const renderer = new Renderer({ canvas });
    const scene = new Group();
    const camera = new PerspectiveCamera(40, 1, 0.01, 200);
    camera.position.set(0, 0, 5);
    const custom = new ShaderMaterial(
      "#version 300 es\nvoid main() {}",
      "#version 300 es\nprecision mediump float;\nvoid main() {}",
    );
    scene.add(new Mesh(new SphereGeometry(1, 8, 6), custom));
    renderer.render(scene, camera);

    expect(state.programs.length).toBe(2);
    expect(state.usedPrograms[state.usedPrograms.length - 1]).toBe(state.programs[1]);
    expect(state.calls).toContain("drawElements");
  });

  it("skips meshes without resolvable geometry or material", () => {
    const { gl, state } = createMockGl();
    const canvas = createCanvas(gl);
    const renderer = new Renderer({ canvas });
    const scene = new Group();
    const camera = new PerspectiveCamera(40, 1, 0.01, 200);
    scene.add(new Mesh(null, new PhongMaterial()));
    scene.add(new Mesh(new SphereGeometry(1, 8, 6), null));
    renderer.render(scene, camera);

    expect(state.calls).not.toContain("drawElements");
    expect(state.calls).toContain("clear");
  });

  it("draws Uint32 indexed geometry with UNSIGNED_INT", () => {
    const { gl, state } = createMockGl();
    const canvas = createCanvas(gl);
    const renderer = new Renderer({ canvas });
    const scene = new Group();
    const camera = new PerspectiveCamera(40, 1, 0.01, 200);
    camera.position.set(0, 0, 5);
    const geometry = new Geometry({
      positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
      normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
      indices: new Uint32Array([0, 1, 2]),
    });
    scene.add(new Mesh(geometry, new PhongMaterial()));
    renderer.render(scene, camera);

    expect(state.drawElementsArgs?.[1]).toBe(3);
    expect(state.drawElementsArgs?.[2]).toBe(0x1405);
  });

  it("renders a Phong cylinder bond alongside a sphere", () => {
    const { gl, state } = createMockGl();
    const canvas = createCanvas(gl);
    const renderer = new Renderer({ canvas });
    const scene = new Group();
    const camera = new PerspectiveCamera(40, 1, 0.01, 200);
    camera.position.set(0, 0, 5);
    scene.add(new AmbientLight(0xffffff, 0.5));
    const atom = new Mesh(
      new SphereGeometry(0.35, 8, 6),
      new PhongMaterial({ color: 0x555555, shininess: 100, specular: 0x333333 }),
    );
    const bondGeometry = new CylinderGeometry(0.065, 0.065, 1, 8);
    const bond = new Mesh(bondGeometry, new PhongMaterial({ color: 0x888888, shininess: 70 }));
    scene.add(atom);
    scene.add(bond);
    renderer.render(scene, camera);

    expect(state.calls).toContain("drawElements");
    expect(state.drawElementsArgs?.[1]).toBe(bondGeometry.indexCount);
    expect(state.uniformByName.get("uShininess")).toBe(70);
  });
});
