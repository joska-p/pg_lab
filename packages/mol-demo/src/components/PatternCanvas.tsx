import { Quat } from '@repo/glaze3d/math';
import { useEffect, useRef, useLayoutEffect } from 'react';

import { FF, Q_MAX, Q_MIN, ff, maxAtoms } from '../lib/formFactors';
import type { Molecule } from '../lib/parseMol';
import { XRAY_LUT } from '../lib/pattern/lut';
import {
    PATTERN_ANGLE_EPS,
    PATTERN_PAT_MS,
    createPatternNorm,
    projectAtoms,
} from '../lib/pattern/norm';
import type { ProjectedAtom } from '../lib/pattern/norm';
import type { ViewerRef } from '../lib/pattern/viewer';
import { isPerfEnabled, recordPatternFrame, setPatternPath } from '../lib/perf';
import { useMoleculeCurrent } from '../stores/moleculeStore';

// Live oriented IAM scattering pattern (UC A6). Owns its own canvas +
// raw WebGL2 shader; glaze3d stays unaware — the camera is only read here
// via `camera.updateMatrixWorld()` + `matrixWorldInverse.elements`.

const VERTEX_SHADER_SOURCE = `#version 300 es
void main() {
    const vec2 pos[4] = vec2[4](
        vec2(-1,-1), vec2(1,-1), vec2(-1,1), vec2(1,1)
    );
    gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
}`;

// GLSL uniform names below (uResolution, uQmin, ...) are matched by exact
// string elsewhere in this file (getUniformLocation calls) — don't rename
// them without updating every matching string at the same time.
function buildFragmentShaderSource(maxAtomCount: number): string {
    return `#version 300 es
precision highp float;
#define MAX_ATOMS ${maxAtomCount}
#define PI 3.141592653589793

uniform vec2  uResolution;
uniform float uQmin;
uniform float uQmax;
uniform int   uNatoms;
uniform vec2  uAtomPos[MAX_ATOMS];
uniform vec4  uFFa[MAX_ATOMS];
uniform vec4  uFFb[MAX_ATOMS];
uniform float uFFc[MAX_ATOMS];
uniform float uNorm;
uniform sampler2D uLUT;

out vec4 fragColor;

void main() {
    vec2  center = uResolution * 0.5;
    float R      = min(center.x, center.y) * 0.97;
    float sc     = uQmax / R;
    // gl_FragCoord.y is 0 at screen-bottom; canvas py=0 is screen-top.
    // CPU convention: qy = (cy - py)*sc, positive at canvas top.
    // Equivalent here: qy = (fragCoord.y - center.y)*sc (both increase same direction).
    float qx     = (gl_FragCoord.x - center.x) * sc;
    float qy     = (gl_FragCoord.y - center.y) * sc;
    float q      = length(vec2(qx, qy));

    if (q < uQmin || q > uQmax) { fragColor = vec4(0.0); return; }

    float s = q / (4.0 * PI);
    s *= s;

    float re = 0.0, im = 0.0;
    for (int i = 0; i < MAX_ATOMS; i++) {
        if (i >= uNatoms) break;
        float f  = dot(uFFa[i], exp(-uFFb[i] * s)) + uFFc[i];
        float ph = qx * uAtomPos[i].x + qy * uAtomPos[i].y;
        re += f * cos(ph);
        im += f * sin(ph);
    }

    float I_raw = re*re + im*im;
    float fade  = min(1.0, (q - uQmin) / (uQmin * 2.0))
                * min(1.0, (uQmax - q) / (uQmax * 0.06));
    float v     = clamp(log(1.0 + I_raw) / uNorm, 0.0, 1.0);
    vec3  col   = texture(uLUT, vec2(v, 0.5)).rgb;

    fragColor = vec4(col, v * fade);
}`;
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error('pattern: could not create shader');
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`pattern shader: ${log}`);
    }
    return shader;
}

function linkProgram(
    gl: WebGL2RenderingContext,
    vertexSource: string,
    fragmentSource: string,
): WebGLProgram {
    const program = gl.createProgram();
    if (!program) {
        throw new Error('pattern: could not create program');
    }
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(`pattern program: ${log}`);
    }
    return program;
}

type UniformMap = Record<string, WebGLUniformLocation | null>;

// "FF" = scattering form factor: per-element coefficients used to compute
// how strongly an atom scatters at a given q. uFFa/uFFb/uFFc are the three
// coefficient groups the shader expects, one triple per atom.
function uploadAtomFormFactorUniforms(
    gl: WebGL2RenderingContext,
    uniforms: UniformMap,
    molecule: Molecule,
): void {
    gl.uniform1i(uniforms.uNatoms, molecule.atoms.length);
    for (let i = 0; i < molecule.atoms.length; i++) {
        const coeffs = FF[molecule.atoms[i]];
        if (!coeffs) {
            continue;
        }
        gl.uniform4f(
            uniforms[`uFFa${i}`],
            coeffs[0] ?? 0,
            coeffs[1] ?? 0,
            coeffs[2] ?? 0,
            coeffs[3] ?? 0,
        );
        gl.uniform4f(
            uniforms[`uFFb${i}`],
            coeffs[4] ?? 0,
            coeffs[5] ?? 0,
            coeffs[6] ?? 0,
            coeffs[7] ?? 0,
        );
        gl.uniform1f(uniforms[`uFFc${i}`], coeffs[8] ?? 0);
    }
}

// CPU fallback path: same math as the fragment shader above, done in a
// double loop over pixels instead of on the GPU. "q" is the scattering
// vector magnitude (distance from the pattern's center in reciprocal
// space) — the physics term for "how far out in the diffraction pattern".
function renderPatternOnCpu(
    ctx: CanvasRenderingContext2D,
    projectedAtoms: readonly ProjectedAtom[],
    width: number,
    height: number,
    intensityBuffer: Float32Array,
    validMask: Uint8Array,
    fadeBuffer: Float32Array,
    sampleBuffer: Float32Array,
): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.97;
    const qScale = Q_MAX / radius;

    intensityBuffer.fill(0);
    validMask.fill(0);
    let maxIntensity = 0;

    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            const qx = (px - centerX) * qScale;
            const qy = (centerY - py) * qScale;
            const q = Math.sqrt(qx * qx + qy * qy);
            if (q < Q_MIN || q > Q_MAX) {
                continue;
            }
            let real = 0;
            let imaginary = 0;
            for (const { el, vx, vy } of projectedAtoms) {
                const formFactor = ff(el, q);
                const phase = qx * vx + qy * vy;
                real += formFactor * Math.cos(phase);
                imaginary += formFactor * Math.sin(phase);
            }
            const intensity = Math.log(1 + real * real + imaginary * imaginary);
            const pixelIndex = py * width + px;
            intensityBuffer[pixelIndex] = intensity;
            validMask[pixelIndex] = 1;
            fadeBuffer[pixelIndex] =
                Math.min(1, (q - Q_MIN) / (Q_MIN * 2)) * Math.min(1, (Q_MAX - q) / (Q_MAX * 0.06));
            if (intensity > maxIntensity) {
                maxIntensity = intensity;
            }
        }
    }
    if (maxIntensity === 0) {
        return;
    }

    // Normalize against the 97th percentile of sampled intensities rather
    // than the raw max, so a single very bright spot doesn't wash out the
    // rest of the pattern. Sampling every 8th pixel keeps this cheap.
    let sampleCount = 0;
    for (let i = 0; i < intensityBuffer.length; i += 8) {
        if (intensityBuffer[i] > 0) {
            sampleBuffer[sampleCount++] = intensityBuffer[i];
        }
    }
    const sortedSample = sampleBuffer.subarray(0, sampleCount);
    sortedSample.sort();
    const intensityNorm = sortedSample[Math.floor(sampleCount * 0.97)] || maxIntensity;

    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;
    for (let i = 0; i < width * height; i++) {
        const pixelOffset = i * 4;
        if (!validMask[i]) {
            pixels[pixelOffset + 3] = 0;
            continue;
        }
        const intensityByte = Math.min(255, ((intensityBuffer[i] / intensityNorm) * 255) | 0);
        const lutOffset = intensityByte * 3;
        pixels[pixelOffset] = XRAY_LUT[lutOffset];
        pixels[pixelOffset + 1] = XRAY_LUT[lutOffset + 1];
        pixels[pixelOffset + 2] = XRAY_LUT[lutOffset + 2];
        pixels[pixelOffset + 3] = (intensityByte * fadeBuffer[i]) | 0;
    }
    ctx.putImageData(imageData, 0, 0);
}

// A CPU fallback that burns the main thread is not a fallback. When WebGL2
// is unavailable the CPU path runs at a reduced buffer (320/256 instead of
// 900/600 — pixel work scales with area, ~8x cheaper) and a longer
// throttle (500 ms instead of 33 ms), so the viewer loop stays interactive
// and the pattern updates slowly instead of freezing the page.
const CPU_BUFFER_SIZE_MOBILE = 256;
const CPU_BUFFER_SIZE_DESKTOP = 320;
const REDRAW_THROTTLE_MS_CPU = 500;

// WebGL2 support is knowable before the first render — no need to mount on
// the GPU path, run the setup effect, discover it's unsupported, then
// setState + remount into the CPU path. A throwaway canvas answers this
// synchronously, so the initial render already picks the right branch.
function supportsWebGL2(): boolean {
    if (typeof document === 'undefined') {
        return true;
    }
    try {
        const probe = document.createElement('canvas');
        const ctx = probe.getContext('webgl2');
        return ctx !== null && !ctx.isContextLost();
    } catch {
        return false;
    }
}

export function PatternCanvas({ viewerRef }: { viewerRef: ViewerRef }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const molecule = useMoleculeCurrent();
    const moleculeRef = useRef(molecule);

    // The renderer is driven by MolCanvas' RAF, not by React.
    // Keep the latest committed molecule available to that imperative loop.
    useLayoutEffect(() => {
        moleculeRef.current = molecule;
    }, [molecule]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) {
            return;
        }

        const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
        const maxAtomCount = maxAtoms(isMobileViewport);
        const intensityNormalizer = createPatternNorm();
        const isPerfTrackingEnabled = isPerfEnabled();

        let isDisposed = false;

        // ---------------------------------------------------------------------
        // Renderer state
        // ---------------------------------------------------------------------

        let gl: WebGL2RenderingContext | null = null;
        let program: WebGLProgram | null = null;
        let lutTexture: WebGLTexture | null = null;
        let cpuContext: CanvasRenderingContext2D | null = null;

        const uniforms: UniformMap = {};

        let intensityBuffer = new Float32Array(0);
        let validMask = new Uint8Array(0);
        let fadeBuffer = new Float32Array(0);
        let sampleBuffer = new Float32Array(0);

        let needsRedraw = true;
        let lastDrawTime = 0;
        let lastRenderedMolecule: Molecule | null = null;
        const lastCameraOrientation = new Quat();
        let isFirstFrame = true;

        let subscribedControls: NonNullable<ViewerRef['current']>['controls'] | null = null;
        let handleControlsChange: (() => void) | null = null;

        // ---------------------------------------------------------------------
        // Backend initialization
        // ---------------------------------------------------------------------

        const initializeGpu = (): boolean => {
            const maybeGl = canvas.getContext('webgl2', {
                alpha: true,
                premultipliedAlpha: false,
            });

            if (maybeGl === null || maybeGl.isContextLost()) {
                return false;
            }

            try {
                gl = maybeGl;

                program = linkProgram(
                    gl,
                    VERTEX_SHADER_SOURCE,
                    buildFragmentShaderSource(maxAtomCount),
                );

                gl.useProgram(program);

                for (const name of ['uResolution', 'uQmin', 'uQmax', 'uNatoms', 'uNorm', 'uLUT']) {
                    uniforms[name] = gl.getUniformLocation(program, name);
                }

                for (let i = 0; i < maxAtomCount; i++) {
                    uniforms[`uAtomPos${i}`] = gl.getUniformLocation(program, `uAtomPos[${i}]`);
                    uniforms[`uFFa${i}`] = gl.getUniformLocation(program, `uFFa[${i}]`);
                    uniforms[`uFFb${i}`] = gl.getUniformLocation(program, `uFFb[${i}]`);
                    uniforms[`uFFc${i}`] = gl.getUniformLocation(program, `uFFc[${i}]`);
                }

                const texture = gl.createTexture();
                if (texture === null) {
                    throw new Error('pattern: could not create LUT texture');
                }

                lutTexture = texture;

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);

                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGB,
                    256,
                    1,
                    0,
                    gl.RGB,
                    gl.UNSIGNED_BYTE,
                    XRAY_LUT,
                );

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                gl.uniform1i(uniforms.uLUT, 0);
                gl.uniform1f(uniforms.uQmin, Q_MIN);
                gl.uniform1f(uniforms.uQmax, Q_MAX);

                setPatternPath('gpu');

                return true;
            } catch (error) {
                console.warn('pattern: WebGL2 initialization failed:', error);

                if (lutTexture !== null) {
                    maybeGl.deleteTexture(lutTexture);
                    lutTexture = null;
                }

                if (program !== null) {
                    maybeGl.deleteProgram(program);
                    program = null;
                }

                gl = null;

                return false;
            }
        };

        const initializeCpu = (): boolean => {
            const context = canvas.getContext('2d');

            if (context === null) {
                return false;
            }

            cpuContext = context;
            setPatternPath('cpu');

            return true;
        };

        // Probe WebGL2 before claiming the real canvas context.
        //
        // This keeps the CPU fallback possible without requiring a React
        // state update/remount. Once the real canvas has a WebGL context,
        // switching that same canvas to 2D is not possible.
        const useGpu = supportsWebGL2();

        if (useGpu) {
            if (!initializeGpu()) {
                console.warn(
                    'pattern: WebGL2 was available during the probe but initialization failed; pattern disabled',
                );
                return;
            }
        } else if (!initializeCpu()) {
            console.error('pattern: no supported rendering backend available');
            return;
        }

        const isCpuMode = gl === null;
        const redrawThrottleMs = isCpuMode ? REDRAW_THROTTLE_MS_CPU : PATTERN_PAT_MS;

        // ---------------------------------------------------------------------
        // Subscriptions
        // ---------------------------------------------------------------------

        const requestRedraw = () => {
            needsRedraw = true;
        };

        const subscribeToControlsChanges = () => {
            const controls = viewerRef.current?.controls;

            if (!controls || controls === subscribedControls) {
                return;
            }

            if (subscribedControls && handleControlsChange) {
                subscribedControls.removeEventListener('change', handleControlsChange);
            }

            subscribedControls = controls;
            handleControlsChange = requestRedraw;

            subscribedControls.addEventListener('change', handleControlsChange);
        };

        // ---------------------------------------------------------------------
        // Canvas sizing
        // ---------------------------------------------------------------------

        const resizeCanvas = () => {
            const isMobileNow = window.matchMedia('(max-width: 768px)').matches;

            const desktopBufferSize = isCpuMode ? CPU_BUFFER_SIZE_DESKTOP : 900;
            const mobileBufferSize = isCpuMode ? CPU_BUFFER_SIZE_MOBILE : 600;

            const bufferSize = isMobileNow ? mobileBufferSize : desktopBufferSize;

            canvas.width = bufferSize;
            canvas.height = bufferSize;

            if (gl !== null) {
                gl.viewport(0, 0, bufferSize, bufferSize);
            } else {
                const pixelCount = bufferSize * bufferSize;

                intensityBuffer = new Float32Array(pixelCount);
                validMask = new Uint8Array(pixelCount);
                fadeBuffer = new Float32Array(pixelCount);
                sampleBuffer = new Float32Array(Math.ceil(pixelCount / 8));
            }

            needsRedraw = true;
        };

        // ---------------------------------------------------------------------
        // Rendering
        // ---------------------------------------------------------------------

        const renderFrame = () => {
            if (isDisposed) {
                return;
            }

            const currentMolecule = moleculeRef.current;

            if (currentMolecule === null) {
                return;
            }

            const camera = viewerRef.current?.camera;

            if (!camera) {
                return;
            }

            subscribeToControlsChanges();

            if (currentMolecule !== lastRenderedMolecule) {
                lastRenderedMolecule = currentMolecule;
                intensityNormalizer.reset();

                if (gl !== null && program !== null) {
                    gl.useProgram(program);
                    uploadAtomFormFactorUniforms(gl, uniforms, currentMolecule);
                }

                needsRedraw = true;
            }

            const now = performance.now();

            if (now - lastDrawTime < redrawThrottleMs) {
                return;
            }

            if (
                !needsRedraw &&
                !isFirstFrame &&
                camera.quaternion.angleTo(lastCameraOrientation) < PATTERN_ANGLE_EPS
            ) {
                return;
            }

            lastCameraOrientation.copy(camera.quaternion);
            needsRedraw = false;
            lastDrawTime = now;
            isFirstFrame = false;

            const width = canvas.width;
            const height = canvas.height;

            if (!width || !height) {
                return;
            }

            const frameStartTime = isPerfTrackingEnabled ? performance.now() : 0;

            camera.updateMatrixWorld();

            const projectedAtoms = projectAtoms(
                currentMolecule,
                camera.matrixWorldInverse.elements,
            );

            const projectionDoneTime = isPerfTrackingEnabled ? performance.now() : 0;

            if (gl !== null && program !== null) {
                const intensityNorm = intensityNormalizer.compute(projectedAtoms, width, height);

                const normComputeDoneTime = isPerfTrackingEnabled ? performance.now() : 0;

                gl.useProgram(program);
                gl.viewport(0, 0, width, height);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);

                gl.uniform2f(uniforms.uResolution, width, height);
                gl.uniform1f(uniforms.uNorm, intensityNorm);

                for (let i = 0; i < projectedAtoms.length; i++) {
                    const atom = projectedAtoms[i];

                    gl.uniform2f(uniforms[`uAtomPos${i}`], atom.vx, atom.vy);
                }

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

                if (isPerfTrackingEnabled) {
                    const frameEndTime = performance.now();

                    recordPatternFrame(
                        frameEndTime - frameStartTime,
                        width,
                        currentMolecule.name,
                        projectionDoneTime - frameStartTime,
                        normComputeDoneTime - projectionDoneTime,
                        frameEndTime - normComputeDoneTime,
                    );
                }

                return;
            }

            if (cpuContext !== null) {
                renderPatternOnCpu(
                    cpuContext,
                    projectedAtoms,
                    width,
                    height,
                    intensityBuffer,
                    validMask,
                    fadeBuffer,
                    sampleBuffer,
                );

                if (isPerfTrackingEnabled) {
                    const frameEndTime = performance.now();

                    recordPatternFrame(
                        frameEndTime - frameStartTime,
                        width,
                        currentMolecule.name,
                        projectionDoneTime - frameStartTime,
                        0,
                        frameEndTime - projectionDoneTime,
                    );
                }
            }
        };

        // ---------------------------------------------------------------------
        // Lifecycle
        // ---------------------------------------------------------------------

        resizeCanvas();
        subscribeToControlsChanges();

        window.addEventListener('resize', resizeCanvas);

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                needsRedraw = true;
            }
        };

        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                resizeCanvas();
            }

            needsRedraw = true;
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pageshow', handlePageShow);

        if (viewerRef.current) {
            viewerRef.current.requestPatternDraw = renderFrame;
        } else {
            viewerRef.current = {
                camera: null,
                controls: null,
                requestPatternDraw: renderFrame,
            };
        }

        return () => {
            isDisposed = true;

            if (viewerRef.current?.requestPatternDraw === renderFrame) {
                viewerRef.current.requestPatternDraw = null;
            }

            window.removeEventListener('resize', resizeCanvas);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pageshow', handlePageShow);

            if (subscribedControls && handleControlsChange) {
                subscribedControls.removeEventListener('change', handleControlsChange);
            }

            if (gl !== null) {
                if (lutTexture !== null) {
                    gl.deleteTexture(lutTexture);
                }

                if (program !== null) {
                    gl.deleteProgram(program);
                }
            }
        };
    }, [viewerRef]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                zIndex: '50',
                inset: 0,
            }}
            aria-label="diffraction pattern"
        />
    );
}
