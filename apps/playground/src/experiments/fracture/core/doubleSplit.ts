/**
 * Double-single (hi, lo) split of a float64. `hi` is the float32 rounding, so `value - hi` is exact
 * in float64 and only the residual rounds to float32: together they carry ~48 bits.
 *
 * Used to keep the complex-plane center exact on the GPU at zoom levels far beyond float32, where a
 * plain `vec2` center would snap to float32 precision and blur the detail.
 */
export function splitDouble(value: number): [number, number] {
    const hi = Math.fround(value);
    const lo = Math.fround(value - hi);

    return [hi, lo];
}
