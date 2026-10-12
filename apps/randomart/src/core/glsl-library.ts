// Ported from randomart-engine/src/compile/glslLibrary.ts — the two copies must stay in sync.
export const GLSL_PI = '3.141592653589793';

export interface GlslFunction {
    id: string;
    glsl: string;
    dependencies?: string[];
}

const random2d = {
    id: 'random2d',
    glsl: `float random2d(vec2 co) {
  float dot_ = dot(co, vec2(12.9898, 78.233));
  return fract(sin(dot_) * 43758.5453);
}`,
} as const satisfies GlslFunction;

const hash1 = {
    id: 'hash1',
    glsl: `float hash1(float n) {
  return fract(sin(n * 127.1) * 43758.5453);
}`,
} as const satisfies GlslFunction;

const smoothNoise = {
    id: 'smoothNoise',
    dependencies: ['hash1'],
    glsl: `float smoothNoise(float t) {
  float i = floor(t);
  float f = fract(t);
  float u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(hash1(i), hash1(i + 1.0), u);
}`,
} as const satisfies GlslFunction;

const smoothNoise2 = {
    id: 'smoothNoise2',
    dependencies: ['smoothNoise'],
    glsl: `// 2D version
vec2 smoothNoise2(vec2 p) {
  return vec2(smoothNoise(p.x), smoothNoise(p.y));
}

// 1D (float) version
vec2 smoothNoise2(float t) {
  return vec2(smoothNoise(t), smoothNoise(t + 31.71));
}`,
} as const satisfies GlslFunction;

const pseudoRecaman = {
    id: 'pseudoRecaman',
    glsl: `float pseudoRecaman(vec2 coords) {
  float d = length(coords);

  // Scale the distance to create concentric wave frequencies
  float continuousStep = d * 10.0;
  float lowStep = floor(continuousStep);
  float stepFract = fract(continuousStep);

  // Instead of a random walk loop, we simulate expanding intervals
  // using alternating analytical functions
  float val = lowStep * (lowStep + 1.0) * 0.5; // Sum of steps (max expansion)
  float nextVal = (lowStep + 1.0) * (lowStep + 2.0) * 0.5;

  // Modulate with a sine wave based on the step to create an alternating "in-out" pulse
  val += sin(lowStep * 1.618) * lowStep;
  nextVal += sin((lowStep + 1.0) * 1.618) * (lowStep + 1.0);

  // Smoothly blend between the rings to prevent harsh aliasing artifacts
  float finalVal = mix(val, nextVal, smoothstep(0.0, 1.0, stepFract));

  // Map tightly back to a [0, 1] range for the randomart grammar pipeline
  return fract(finalVal * 0.05);
}`,
} as const satisfies GlslFunction;

const fbmNoise = {
    id: 'fbmNoise',
    dependencies: ['random2d'],
    glsl: `float fbmNoise(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * random2d(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value * 2.0 - 1.0;
}`,
} as const satisfies GlslFunction;

export const glslFunctions = [
    random2d,
    hash1,
    smoothNoise,
    smoothNoise2,
    pseudoRecaman,
    fbmNoise,
] as const satisfies GlslFunction[];

export type GlslFunctionsIds = (typeof glslFunctions)[number]['id'];

export const glslFunctionById = new Map<string, GlslFunction>(glslFunctions.map((f) => [f.id, f]));

/**
 * Concatenated source of the requested functions plus their dependencies, dependencies first — GLSL
 * won't compile a call before its declaration. Throws on dependency cycles.
 */
export function resolveGlslDeps(requiredIds: string[]): string {
    const visited = new Set<string>();
    const resolving = new Set<string>();
    const path: string[] = [];
    const ordered: GlslFunction[] = [];

    function resolve(id: string) {
        if (visited.has(id)) {
            return;
        }

        if (resolving.has(id)) {
            const cycleStart = path.indexOf(id);
            const cycle = [...path.slice(cycleStart), id];

            throw new Error(`Dependency cycle detected: ${cycle.join(' → ')}`);
        }

        resolving.add(id);
        path.push(id);
        const fn = glslFunctionById.get(id);

        if (!fn) {
            path.pop();
            resolving.delete(id);
            visited.add(id);

            return;
        }

        for (const dep of fn.dependencies ?? []) {
            resolve(dep);
        }

        path.pop();
        resolving.delete(id);
        visited.add(id);
        ordered.push(fn);
    }

    for (const id of requiredIds) {
        resolve(id);
    }

    return ordered.map((f) => f.glsl).join('\n\n');
}
