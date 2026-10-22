/** A color space definition: how to convert the raw `[-1,1]³` channel triplet to sRGB. */
export interface ColorSpace {
    /** Unique identifier, matches registry key. */
    readonly id: string;
    /** Name shown in the UI. */
    readonly label: string;
    /**
     * Entry-point GLSL function name: `vec3 <fn>(vec3 raw)`. It takes the raw channel triplet (each
     * component in `[-1, 1]`, the range every catalog operator preserves) and returns the sRGB the
     * framebuffer expects. The remap from the raw field to the space's parameters and the
     * conversion to sRGB are both inlined.
     */
    readonly fn: string;
    /** Full GLSL definition of the entry point, plus any helper it uses. */
    readonly glsl: string;
    /** Chroma scale at |g|=1 for OKLCH/OKLab. Only present for those spaces. */
    readonly chroma?: number;
}
