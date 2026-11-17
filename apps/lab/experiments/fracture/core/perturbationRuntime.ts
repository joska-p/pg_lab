import { createOrbitTextures } from './orbitTextures';
import type { OrbitTextures } from './orbitTextures';
import { computeReferenceOrbit, computeSecondaryOrbit } from './referenceOrbit';
import type { ReferenceOrbit } from './referenceOrbit';

interface Orbits {
    primary: ReferenceOrbit;
    secondary: ReferenceOrbit;
}

/**
 * Module-free owner of the perturbation pipeline's raw-GL resources. The React version kept these
 * in refs inside the scene component; the static page holds one instance and resets its GPU
 * textures on context restore.
 */
export class PerturbationRuntime {
    #gl: WebGL2RenderingContext;
    #textures: OrbitTextures | null = null;
    #orbits: Orbits | null = null;
    #lastCenterRe = Number.NaN;
    #lastCenterIm = Number.NaN;
    #lastZoom = Number.NaN;

    constructor(gl: WebGL2RenderingContext) {
        this.#gl = gl;
    }

    get textures(): OrbitTextures | null {
        return this.#textures;
    }

    get orbits(): Orbits | null {
        return this.#orbits;
    }

    /** Recomputes and uploads both orbits only when the complex view actually moved. */
    update(
        centerRe: number,
        centerIm: number,
        zoom: number,
        viewScale: number,
        maxIterations: number,
    ): void {
        const viewChanged =
            centerRe !== this.#lastCenterRe ||
            centerIm !== this.#lastCenterIm ||
            zoom !== this.#lastZoom;

        if (!viewChanged) {
            return;
        }

        if (!this.#textures) {
            this.#textures = createOrbitTextures(this.#gl);
        }

        const primary = computeReferenceOrbit(centerRe, centerIm, maxIterations);
        const secondary = computeSecondaryOrbit(centerRe, centerIm, viewScale, maxIterations);

        this.#textures.upload(primary, secondary);
        this.#orbits = { primary, secondary };
        this.#lastCenterRe = centerRe;
        this.#lastCenterIm = centerIm;
        this.#lastZoom = zoom;
    }

    /** Orbit textures do not survive a WebGL context loss; re-create them from cached CPU orbits. */
    restore(gl: WebGL2RenderingContext): void {
        this.#gl = gl;
        this.#textures?.dispose();
        this.#textures = null;

        const orbits = this.#orbits;
        if (!orbits) {
            return;
        }

        const textures = createOrbitTextures(gl);
        textures.upload(orbits.primary, orbits.secondary);
        this.#textures = textures;
    }

    dispose(): void {
        this.#textures?.dispose();
        this.#textures = null;
        this.#orbits = null;
        this.#lastCenterRe = Number.NaN;
        this.#lastCenterIm = Number.NaN;
        this.#lastZoom = Number.NaN;
    }
}
