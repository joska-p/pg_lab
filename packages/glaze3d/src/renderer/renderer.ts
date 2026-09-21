import type { PerspectiveCamera } from '../core/camera';
import { AmbientLight, DirectionalLight, Mesh, type Object3D } from '../core/object3d';
import type { Geometry } from '../geometry/geometry';
import { PhongMaterial, ShaderMaterial } from '../material/phong';
import { Mat4 } from '../math/mat4';

export interface RendererOptions {
    canvas: HTMLCanvasElement;
    alpha?: boolean;
    antialias?: boolean;
}

export type ClearColor = [number, number, number];

// Compile-time light budget (spec section 5): the demo uses 1 ambient +
// 3 directional, one spare directional slot avoids a shader recompile for a
// second use case without growing into a dynamic light system.
export const MAX_DIRECTIONAL_LIGHTS = 4;

const PHONG_VERTEX_SOURCE = `#version 300 es
in vec3 position;
in vec3 normal;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat3 uNormalMatrix;
out vec3 vNormal;
out vec3 vViewPosition;
void main() {
  vec4 mvPosition = uModelViewMatrix * vec4(position, 1.0);
  vViewPosition = mvPosition.xyz;
  vNormal = normalize(uNormalMatrix * normal);
  gl_Position = uProjectionMatrix * mvPosition;
}
`;

const PHONG_FRAGMENT_SOURCE = `#version 300 es
precision mediump float;
#define NUM_DIR_LIGHTS ${MAX_DIRECTIONAL_LIGHTS}
uniform vec3 uDiffuse;
uniform vec3 uSpecular;
uniform float uShininess;
uniform vec3 uAmbientColor;
uniform vec3 uDirColors[NUM_DIR_LIGHTS];
uniform vec3 uDirDirections[NUM_DIR_LIGHTS];
in vec3 vNormal;
in vec3 vViewPosition;
out vec4 outColor;
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(-vViewPosition);
  vec3 color = uDiffuse * uAmbientColor;
  for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
    vec3 l = normalize(uDirDirections[i]);
    float diffuseFactor = max(dot(n, l), 0.0);
    color += uDiffuse * uDirColors[i] * diffuseFactor;
    vec3 r = reflect(-l, n);
    float specularFactor = pow(max(dot(r, v), 0.0), uShininess);
    color += uSpecular * uDirColors[i] * specularFactor;
  }
  outColor = vec4(color, 1.0);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (shader === null) {
        throw new Error('glaze3d: unable to create shader');
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`glaze3d: shader compile failed: ${log ?? 'unknown error'}`);
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
            throw new Error('glaze3d: unable to create program');
        }
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS) !== true) {
            const log = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`glaze3d: program link failed: ${log ?? 'unknown error'}`);
        }
        return program;
    } finally {
        gl.deleteShader(vertex);
        if (fragment !== null) {
            gl.deleteShader(fragment);
        }
    }
}

interface PhongUniforms {
    projectionMatrix: WebGLUniformLocation | null;
    modelViewMatrix: WebGLUniformLocation | null;
    normalMatrix: WebGLUniformLocation | null;
    diffuse: WebGLUniformLocation | null;
    specular: WebGLUniformLocation | null;
    shininess: WebGLUniformLocation | null;
    ambientColor: WebGLUniformLocation | null;
    dirColors: (WebGLUniformLocation | null)[];
    dirDirections: (WebGLUniformLocation | null)[];
}

interface CustomUniforms {
    projectionMatrix: WebGLUniformLocation | null;
    modelViewMatrix: WebGLUniformLocation | null;
    normalMatrix: WebGLUniformLocation | null;
}

interface GeometryBuffers {
    vao: WebGLVertexArrayObject | null;
    indexCount: number;
    indexType: number;
}

export class Renderer {
    private readonly canvas: HTMLCanvasElement;
    private readonly gl: WebGL2RenderingContext;
    private readonly phongProgram: WebGLProgram;
    private readonly phongUniforms: PhongUniforms;

    private readonly geometryCache = new WeakMap<Geometry, GeometryBuffers>();
    private readonly customPrograms = new WeakMap<ShaderMaterial, WebGLProgram>();
    private readonly customUniforms = new WeakMap<ShaderMaterial, CustomUniforms>();

    private pixelRatio = 1;
    private width = 300;
    private height = 150;
    private clearColor: ClearColor = [0, 0, 0];
    private clearAlpha = 0;

    private readonly tmpModelView = new Mat4();
    private readonly tmpNormalSource = new Mat4();

    constructor(options: RendererOptions) {
        this.canvas = options.canvas;
        const gl = options.canvas.getContext('webgl2', {
            alpha: options.alpha ?? true,
            antialias: options.antialias ?? false,
        });
        if (gl === null) {
            throw new Error('glaze3d: WebGL2 not available');
        }
        this.gl = gl;
        gl.enable(gl.DEPTH_TEST);

        this.phongProgram = createProgram(gl, PHONG_VERTEX_SOURCE, PHONG_FRAGMENT_SOURCE);
        this.phongUniforms = this.locatePhongUniforms(gl, this.phongProgram);

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

        const { meshes, ambient, directional } = this.collect(scene, camera);
        if (meshes.length === 0) {
            return;
        }

        const view = camera.matrixWorldInverse;
        const projection = camera.projectionMatrix;
        const { ambientColor, dirColors, dirDirections } = this.resolveLights(
            view,
            ambient,
            directional,
        );

        for (const mesh of meshes) {
            const geometry = mesh.geometry;
            const material = mesh.material;
            if (geometry === null || material === null) {
                continue;
            }
            if (material instanceof ShaderMaterial) {
                this.drawCustom(geometry, material, mesh, view, projection);
            } else if (material instanceof PhongMaterial) {
                this.drawPhong(
                    geometry,
                    material,
                    mesh,
                    view,
                    projection,
                    ambientColor,
                    dirColors,
                    dirDirections,
                );
            }
        }
    }

    private collect(
        scene: Object3D,
        camera: PerspectiveCamera,
    ): {
        meshes: Mesh[];
        ambient: AmbientLight[];
        directional: DirectionalLight[];
    } {
        const meshes: Mesh[] = [];
        const ambient: AmbientLight[] = [];
        const directional: DirectionalLight[] = [];
        const seenLights = new Set<Object3D>();
        const visit = (object: Object3D): void => {
            if (object instanceof Mesh) {
                meshes.push(object);
            } else if (object instanceof AmbientLight) {
                if (!seenLights.has(object)) {
                    seenLights.add(object);
                    ambient.push(object);
                }
            } else if (object instanceof DirectionalLight) {
                if (!seenLights.has(object)) {
                    seenLights.add(object);
                    directional.push(object);
                }
            }
            for (const child of object.children) {
                visit(child);
            }
        };
        visit(scene);
        // Lights attached to the camera live under the camera node. The demo
        // adds the camera to the scene so they are found above; when the camera
        // is kept out of the scene they are still headlamps and must apply.
        if (!this.isDescendant(camera, scene)) {
            visit(camera);
        }
        return { meshes, ambient, directional };
    }

    private isDescendant(node: Object3D, root: Object3D): boolean {
        let current: Object3D | null = node;
        while (current !== null) {
            if (current === root) {
                return true;
            }
            current = current.parent;
        }
        return false;
    }

    private resolveLights(
        view: Mat4,
        ambient: AmbientLight[],
        directional: DirectionalLight[],
    ): {
        ambientColor: [number, number, number];
        dirColors: [number, number, number][];
        dirDirections: [number, number, number][];
    } {
        // Multiple ambient lights are summed; the demo uses exactly one.
        let ar = 0;
        let ag = 0;
        let ab = 0;
        for (const light of ambient) {
            ar += light.color[0] * light.intensity;
            ag += light.color[1] * light.intensity;
            ab += light.color[2] * light.intensity;
        }
        const viewElements = view.elements;
        const dirColors: [number, number, number][] = [];
        const dirDirections: [number, number, number][] = [];
        for (let i = 0; i < MAX_DIRECTIONAL_LIGHTS; i++) {
            const light = directional[i];
            if (light === undefined) {
                dirColors.push([0, 0, 0]);
                dirDirections.push([0, 1, 0]);
                continue;
            }
            dirColors.push([
                light.color[0] * light.intensity,
                light.color[1] * light.intensity,
                light.color[2] * light.intensity,
            ]);
            // DirectionalLight direction convention: `.position` points from the
            // target (world origin, three.js default target) toward the light, so
            // the world direction is the normalized world position. Transformed by
            // the view rotation only (w = 0), matching a light attached to the
            // camera staying fixed on screen while orbiting.
            const wx = light.matrixWorld.elements[12];
            const wy = light.matrixWorld.elements[13];
            const wz = light.matrixWorld.elements[14];
            const worldLength = Math.hypot(wx, wy, wz) || 1;
            const dx = wx / worldLength;
            const dy = wy / worldLength;
            const dz = wz / worldLength;
            const vx = viewElements[0] * dx + viewElements[4] * dy + viewElements[8] * dz;
            const vy = viewElements[1] * dx + viewElements[5] * dy + viewElements[9] * dz;
            const vz = viewElements[2] * dx + viewElements[6] * dy + viewElements[10] * dz;
            const viewLength = Math.hypot(vx, vy, vz) || 1;
            dirDirections.push([vx / viewLength, vy / viewLength, vz / viewLength]);
        }
        return { ambientColor: [ar, ag, ab], dirColors, dirDirections };
    }

    private locatePhongUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): PhongUniforms {
        const dirColors: (WebGLUniformLocation | null)[] = [];
        const dirDirections: (WebGLUniformLocation | null)[] = [];
        for (let i = 0; i < MAX_DIRECTIONAL_LIGHTS; i++) {
            dirColors.push(gl.getUniformLocation(program, `uDirColors[${i}]`));
            dirDirections.push(gl.getUniformLocation(program, `uDirDirections[${i}]`));
        }
        return {
            projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(program, 'uNormalMatrix'),
            diffuse: gl.getUniformLocation(program, 'uDiffuse'),
            specular: gl.getUniformLocation(program, 'uSpecular'),
            shininess: gl.getUniformLocation(program, 'uShininess'),
            ambientColor: gl.getUniformLocation(program, 'uAmbientColor'),
            dirColors,
            dirDirections,
        };
    }

    private buffersFor(geometry: Geometry, program: WebGLProgram): GeometryBuffers {
        const cached = this.geometryCache.get(geometry);
        if (cached !== undefined) {
            return cached;
        }
        const gl = this.gl;
        const { positions, normals, indices } = geometry.data;

        const positionBuffer = gl.createBuffer();
        const normalBuffer = gl.createBuffer();
        const indexBuffer = gl.createBuffer();
        if (positionBuffer === null || normalBuffer === null || indexBuffer === null) {
            throw new Error('glaze3d: unable to create geometry buffers');
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        const indexType = indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
        const typedIndices =
            indices instanceof Uint32Array || indices instanceof Uint16Array
                ? indices
                : new Uint16Array(indices);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, typedIndices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        const normalLocation = gl.getAttribLocation(program, 'normal');
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.enableVertexAttribArray(normalLocation);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        const buffers: GeometryBuffers = { vao, indexCount: indices.length, indexType };
        this.geometryCache.set(geometry, buffers);
        return buffers;
    }

    private drawPhong(
        geometry: Geometry,
        material: PhongMaterial,
        mesh: Mesh,
        view: Mat4,
        projection: Mat4,
        ambientColor: [number, number, number],
        dirColors: [number, number, number][],
        dirDirections: [number, number, number][],
    ): void {
        const gl = this.gl;
        const buffers = this.buffersFor(geometry, this.phongProgram);
        this.tmpModelView.multiplyMatrices(view, mesh.matrixWorld);
        // Normal matrix = transpose(inverse(upper 3x3 of modelView)).
        this.tmpNormalSource.copy(this.tmpModelView).invert();
        const inv = this.tmpNormalSource.elements;
        const normalMatrix = new Float32Array([
            inv[0],
            inv[4],
            inv[8],
            inv[1],
            inv[5],
            inv[9],
            inv[2],
            inv[6],
            inv[10],
        ]);

        gl.useProgram(this.phongProgram);
        gl.uniformMatrix4fv(this.phongUniforms.projectionMatrix, false, projection.elements);
        gl.uniformMatrix4fv(this.phongUniforms.modelViewMatrix, false, this.tmpModelView.elements);
        gl.uniformMatrix3fv(this.phongUniforms.normalMatrix, false, normalMatrix);
        gl.uniform3f(
            this.phongUniforms.diffuse,
            material.color[0],
            material.color[1],
            material.color[2],
        );
        gl.uniform3f(
            this.phongUniforms.specular,
            material.specular[0],
            material.specular[1],
            material.specular[2],
        );
        gl.uniform1f(this.phongUniforms.shininess, material.shininess);
        gl.uniform3f(
            this.phongUniforms.ambientColor,
            ambientColor[0],
            ambientColor[1],
            ambientColor[2],
        );
        for (let i = 0; i < MAX_DIRECTIONAL_LIGHTS; i++) {
            const color = dirColors[i];
            const direction = dirDirections[i];
            gl.uniform3f(this.phongUniforms.dirColors[i], color[0], color[1], color[2]);
            gl.uniform3f(
                this.phongUniforms.dirDirections[i],
                direction[0],
                direction[1],
                direction[2],
            );
        }
        gl.bindVertexArray(buffers.vao);
        gl.drawElements(gl.TRIANGLES, buffers.indexCount, buffers.indexType, 0);
        gl.bindVertexArray(null);
    }

    private drawCustom(
        geometry: Geometry,
        material: ShaderMaterial,
        mesh: Mesh,
        view: Mat4,
        projection: Mat4,
    ): void {
        const gl = this.gl;
        let program = this.customPrograms.get(material);
        let uniforms = this.customUniforms.get(material);
        if (program === undefined) {
            program = createProgram(gl, material.vertexSource, material.fragmentSource);
            uniforms = {
                projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
                normalMatrix: gl.getUniformLocation(program, 'uNormalMatrix'),
            };
            this.customPrograms.set(material, program);
            this.customUniforms.set(material, uniforms);
        }
        const buffers = this.buffersFor(geometry, program);
        this.tmpModelView.multiplyMatrices(view, mesh.matrixWorld);
        this.tmpNormalSource.copy(this.tmpModelView).invert();
        const inv = this.tmpNormalSource.elements;
        const normalMatrix = new Float32Array([
            inv[0],
            inv[4],
            inv[8],
            inv[1],
            inv[5],
            inv[9],
            inv[2],
            inv[6],
            inv[10],
        ]);
        gl.useProgram(program);
        gl.uniformMatrix4fv(uniforms?.projectionMatrix ?? null, false, projection.elements);
        gl.uniformMatrix4fv(uniforms?.modelViewMatrix ?? null, false, this.tmpModelView.elements);
        gl.uniformMatrix3fv(uniforms?.normalMatrix ?? null, false, normalMatrix);
        gl.bindVertexArray(buffers.vao);
        gl.drawElements(gl.TRIANGLES, buffers.indexCount, buffers.indexType, 0);
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
