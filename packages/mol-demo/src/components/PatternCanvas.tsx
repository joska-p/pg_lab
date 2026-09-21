import { Quat } from '@repo/glaze3d/math';
import { useEffect, useRef, useState } from 'react';

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

const VS_SRC = `#version 300 es
void main() {
    const vec2 pos[4] = vec2[4](
        vec2(-1,-1), vec2(1,-1), vec2(-1,1), vec2(1,1)
    );
    gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
}`;

function fragSrc(maxAtomsCount: number): string {
    return `#version 300 es
precision highp float;
#define MAX_ATOMS ${maxAtomsCount}
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

function makeShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('pattern: could not create shader');
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`pattern shader: ${log}`);
    }
    return shader;
}

function makeProgram(gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string): WebGLProgram {
    const program = gl.createProgram();
    if (!program) throw new Error('pattern: could not create program');
    const vertexShader = makeShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fragmentShader = makeShader(gl, gl.FRAGMENT_SHADER, fsSrc);
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

function setAtomFFUniforms(gl: WebGL2RenderingContext, uniforms: UniformMap, mol: Molecule): void {
    gl.uniform1i(uniforms.uNatoms, mol.atoms.length);
    for (let i = 0; i < mol.atoms.length; i++) {
        const c = FF[mol.atoms[i]];
        if (!c) continue;
        gl.uniform4f(uniforms[`uFFa${i}`], c[0] ?? 0, c[1] ?? 0, c[2] ?? 0, c[3] ?? 0);
        gl.uniform4f(uniforms[`uFFb${i}`], c[4] ?? 0, c[5] ?? 0, c[6] ?? 0, c[7] ?? 0);
        gl.uniform1f(uniforms[`uFFc${i}`], c[8] ?? 0);
    }
}

function drawPatternCPU(
    ctx: CanvasRenderingContext2D,
    atoms: readonly ProjectedAtom[],
    w: number,
    h: number,
    raw: Float32Array,
    mask: Uint8Array,
    fadeTbl: Float32Array,
    sampBuf: Float32Array,
): void {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) * 0.97;
    const sc = Q_MAX / r;

    raw.fill(0);
    mask.fill(0);
    let maxV = 0;

    for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
            const qx = (px - cx) * sc;
            const qy = (cy - py) * sc;
            const q = Math.sqrt(qx * qx + qy * qy);
            if (q < Q_MIN || q > Q_MAX) continue;
            let re = 0;
            let im = 0;
            for (const { el, vx, vy } of atoms) {
                const f = ff(el, q);
                const ph = qx * vx + qy * vy;
                re += f * Math.cos(ph);
                im += f * Math.sin(ph);
            }
            const v = Math.log(1 + re * re + im * im);
            const idx = py * w + px;
            raw[idx] = v;
            mask[idx] = 1;
            fadeTbl[idx] =
                Math.min(1, (q - Q_MIN) / (Q_MIN * 2)) * Math.min(1, (Q_MAX - q) / (Q_MAX * 0.06));
            if (v > maxV) maxV = v;
        }
    }
    if (maxV === 0) return;

    let sampLen = 0;
    for (let i = 0; i < raw.length; i += 8) {
        if (raw[i] > 0) sampBuf[sampLen++] = raw[i];
    }
    const samp = sampBuf.subarray(0, sampLen);
    samp.sort();
    const norm = samp[Math.floor(sampLen * 0.97)] || maxV;

    const imgData = ctx.createImageData(w, h);
    const px4 = imgData.data;
    for (let i = 0; i < w * h; i++) {
        const base = i * 4;
        if (!mask[i]) {
            px4[base + 3] = 0;
            continue;
        }
        const vi = Math.min(255, ((raw[i] / norm) * 255) | 0);
        const li = vi * 3;
        px4[base] = XRAY_LUT[li];
        px4[base + 1] = XRAY_LUT[li + 1];
        px4[base + 2] = XRAY_LUT[li + 2];
        px4[base + 3] = (vi * fadeTbl[i]) | 0;
    }
    ctx.putImageData(imgData, 0, 0);
}

// A CPU fallback that burns the main thread is not a fallback. When WebGL2
// is unavailable the CPU path runs at a reduced buffer (320/256 instead of
// 900/600 — pixel work scales with area, ~8x cheaper) and a longer
// throttle (500 ms instead of 33 ms), so the viewer loop stays interactive
// and the pattern updates slowly instead of freezing the page.
const CPU_BUF_MOBILE = 256;
const CPU_BUF_DESKTOP = 320;
const PATTERN_PAT_MS_CPU = 500;

export function PatternCanvas({ viewerRef }: { viewerRef: ViewerRef }) {
    const [cpuFallback, setCpuFallback] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const molecule = useMoleculeCurrent();
    const molRef = useRef(molecule);
    molRef.current = molecule;
    const fallbackRef = useRef(cpuFallback);
    fallbackRef.current = cpuFallback;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) return;
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const maxCount = maxAtoms(isMobile);
        const norm = createPatternNorm();
        let disposed = false;
        // P2: no RAF here — the viewer loop (MolCanvas) owns the single RAF and
        // calls drawPattern every frame; throttle + angle early-out below keep
        // actual redraws on demand.
        const perfEnabled = isPerfEnabled();
        const cpuMode = fallbackRef.current;
        // Throttle budget depends on the backend: GPU redraws are milliseconds,
        // CPU redraws are hundreds of ms — sharing one budget freezes the page.
        const patMs = cpuMode ? PATTERN_PAT_MS_CPU : PATTERN_PAT_MS;
        let patDirty = true;
        let lastTs = 0;
        let lastMol: Molecule | null = null;
        const prevQuat = new Quat();
        let firstFrame = true;
        let subscribedControls: { dispose?: () => void } | { remove?: () => void } | null = null;
        let onChange: (() => void) | null = null;

        const markDirty = () => {
            patDirty = true;
        };

        const subscribeControls = () => {
            const controls = viewerRef.current?.controls;
            if (!controls || subscribedControls) return;
            onChange = markDirty;
            controls.addEventListener('change', onChange);
            subscribedControls = {
                dispose: () => {
                    if (onChange) controls.removeEventListener('change', onChange);
                },
            };
        };

        // CPU buffers (allocated on resize when in fallback mode).
        let patCtx: CanvasRenderingContext2D | null = null;
        let raw = new Float32Array(0);
        let mask = new Uint8Array(0);
        let fadeTbl = new Float32Array(0);
        let sampBuf = new Float32Array(0);

        // GPU state.
        let gl: WebGL2RenderingContext | null = null;
        let prog: WebGLProgram | null = null;
        let lutTex: WebGLTexture | null = null;
        const uniforms: UniformMap = {};

        const resizePat = () => {
            const small = window.matchMedia('(max-width: 768px)').matches;
            const BUF = cpuMode ? (small ? CPU_BUF_MOBILE : CPU_BUF_DESKTOP) : small ? 600 : 900;
            canvas.width = BUF;
            canvas.height = BUF;
            if (gl) {
                gl.viewport(0, 0, BUF, BUF);
            } else {
                const n = BUF * BUF;
                raw = new Float32Array(n);
                mask = new Uint8Array(n);
                fadeTbl = new Float32Array(n);
                sampBuf = new Float32Array(Math.ceil(n / 8));
            }
            patDirty = true;
        };

        if (!fallbackRef.current) {
            const maybeGl = canvas.getContext('webgl2', {
                alpha: true,
                premultipliedAlpha: false,
            });
            if (maybeGl === null || maybeGl.isContextLost()) {
                setCpuFallback(true);
                return;
            }
            try {
                gl = maybeGl;
                prog = makeProgram(gl, VS_SRC, fragSrc(maxCount));
                gl.useProgram(prog);
                for (const n of ['uResolution', 'uQmin', 'uQmax', 'uNatoms', 'uNorm', 'uLUT']) {
                    uniforms[n] = gl.getUniformLocation(prog, n);
                }
                for (let i = 0; i < maxCount; i++) {
                    uniforms[`uAtomPos${i}`] = gl.getUniformLocation(prog, `uAtomPos[${i}]`);
                    uniforms[`uFFa${i}`] = gl.getUniformLocation(prog, `uFFa[${i}]`);
                    uniforms[`uFFb${i}`] = gl.getUniformLocation(prog, `uFFb[${i}]`);
                    uniforms[`uFFc${i}`] = gl.getUniformLocation(prog, `uFFc[${i}]`);
                }
                const lutTexObj = gl.createTexture();
                lutTex = lutTexObj;
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, lutTexObj);
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
            } catch (err) {
                console.warn('pattern: WebGL2 init failed, using CPU fallback:', err);
                gl = null;
                prog = null;
                setCpuFallback(true);
                return;
            }
        } else {
            patCtx = canvas.getContext('2d');
            if (patCtx === null) return;
            setPatternPath('cpu');
        }

        resizePat();
        subscribeControls();
        window.addEventListener('resize', resizePat);
        const onVisible = () => {
            if (!document.hidden) patDirty = true;
        };
        const onPageShow = (e: PageTransitionEvent) => {
            // After a bfcache restore the canvas backing store may be gone —
            // reallocate it like the origin demo does, then force a redraw.
            if (e.persisted) resizePat();
            patDirty = true;
        };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('pageshow', onPageShow);

        const drawPattern = () => {
            if (disposed) return;
            const mol = molRef.current;
            if (mol === null) return;
            const camera = viewerRef.current?.camera;
            if (!camera) return;
            subscribeControls();

            if (mol !== lastMol) {
                lastMol = mol;
                norm.reset();
                if (gl && prog) {
                    gl.useProgram(prog);
                    setAtomFFUniforms(gl, uniforms, mol);
                }
                patDirty = true;
            }

            const now = performance.now();
            if (now - lastTs < patMs) return;
            if (
                !patDirty &&
                !firstFrame &&
                camera.quaternion.angleTo(prevQuat) < PATTERN_ANGLE_EPS
            ) {
                return;
            }
            prevQuat.copy(camera.quaternion);
            patDirty = false;
            lastTs = now;
            firstFrame = false;

            const w = canvas.width;
            const h = canvas.height;
            if (!w || !h) return;

            const t0 = perfEnabled ? performance.now() : 0;
            camera.updateMatrixWorld();
            const atoms = projectAtoms(mol, camera.matrixWorldInverse.elements);
            const t1 = perfEnabled ? performance.now() : 0;

            if (gl && prog) {
                const normV = norm.compute(atoms, w, h);
                const t2 = perfEnabled ? performance.now() : 0;
                gl.useProgram(prog);
                gl.viewport(0, 0, w, h);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.uniform2f(uniforms.uResolution, w, h);
                gl.uniform1f(uniforms.uNorm, normV);
                for (let i = 0; i < atoms.length; i++) {
                    const a = atoms[i];
                    gl.uniform2f(uniforms[`uAtomPos${i}`], a.vx, a.vy);
                }
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                if (perfEnabled) {
                    const t3 = performance.now();
                    recordPatternFrame(t3 - t0, w, mol.name, t1 - t0, t2 - t1, t3 - t2);
                }
                return;
            }

            if (patCtx) {
                drawPatternCPU(patCtx, atoms, w, h, raw, mask, fadeTbl, sampBuf);
                if (perfEnabled) {
                    const t3 = performance.now();
                    recordPatternFrame(t3 - t0, w, mol.name, t1 - t0, 0, t3 - t1);
                }
            }
        };
        // The handle object is stable (owned by App) so registration is
        // order-independent: works whether Pattern mounts before or after Mol.
        if (viewerRef.current) viewerRef.current.requestPatternDraw = drawPattern;
        else viewerRef.current = { camera: null, controls: null, requestPatternDraw: drawPattern };

        return () => {
            disposed = true;
            if (viewerRef.current?.requestPatternDraw === drawPattern) {
                viewerRef.current.requestPatternDraw = null;
            }
            window.removeEventListener('resize', resizePat);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('pageshow', onPageShow);
            const controls = viewerRef.current?.controls;
            if (controls && onChange) controls.removeEventListener('change', onChange);
            subscribedControls = null;
            if (gl) {
                // No loseContext() here: in dev StrictMode this effect mounts,
                // cleans up, and remounts on the same canvas element, and losing
                // the context would force the remount onto the CPU fallback.
                // Releasing the program + texture is enough; the browser reclaims
                // the context with the canvas.
                if (lutTex) gl.deleteTexture(lutTex);
                if (prog) gl.deleteProgram(prog);
            }
        };
    }, [cpuFallback, viewerRef]);

    return (
        <canvas
            key={cpuFallback ? 'cpu' : 'gpu'}
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
