// Shared GLSL chunk: double-single (~48-bit) arithmetic.
//
// D3 resolution (S5): the two historical DS multiplication implementations
// are kept under distinct names instead of silently unifying them, because
// deep-zoom visuals are the judge and the user spot-checks them manually:
//   - ds_mul ......... bitwise Dekker split (from double-split; ES 3.00
//                      portable, no fma, no 8193 constant). Canonical name,
//                      used by the double-split pipeline.
//   - ds_mul_8193 .... classic 8193-split Dekker mul (from perturbation).
//                      Used by the perturbation pipeline (ds_mul_float,
//                      cds_mul, cds_mul_Xn included) to preserve its exact
//                      deep-zoom behaviour.
// Common primitives (ds_set, ds_twoSum, ds_add, ds_sub) are unified on the
// standard TwoSum form; the two historical ds_add spellings are
// mathematically equivalent (Knuth TwoSum + low-part accumulation).

vec2 ds_set(float a) {
    return vec2(a, 0.0);
}

vec2 ds_set2(float hi, float lo) {
    return vec2(hi, lo);
}

// Standard TwoSum (order-independent).
vec2 ds_twoSum(float a, float b) {
    float s = a + b;
    float bv = s - a;
    float err = a - (s - bv) + (b - bv);
    return vec2(s, err);
}

vec2 ds_add(vec2 a, vec2 b) {
    vec2 s = ds_twoSum(a.x, b.x);
    s.y += a.y + b.y;
    return ds_twoSum(s.x, s.y);
}

vec2 ds_sub(vec2 a, vec2 b) {
    return ds_add(a, vec2(-b.x, -b.y));
}

// Bitwise Dekker split: splits a float into (hi, lo) where hi keeps the top
// 11 bits of the mantissa. Avoids the 8193.0 multiply and avoids `fma`.
// Works natively in ES 3.00 on all hardware.
vec2 ds_split(float a) {
    int bits = floatBitsToInt(a) & int(0xFFFFE000);
    float hi = intBitsToFloat(bits);
    return vec2(hi, a - hi);
}

// Canonical ds_mul: exact product error using bitwise splitting.
vec2 ds_mul(vec2 a, vec2 b) {
    vec2 as = ds_split(a.x);
    vec2 bs = ds_split(b.x);
    float hi = a.x * b.x;
    float lo = as.x * bs.x - hi + as.x * bs.y + as.y * bs.x + as.y * bs.y;

    // Add cross terms with the low parts of a and b
    lo = a.y * b.x + a.x * b.y + lo;

    // Renormalize
    return ds_twoSum(hi, lo);
}

// Historical 8193-split Dekker mul (perturbation pipeline). Kept verbatim
// under a distinct name so perturbation keeps its validated numerics.
vec2 ds_mul_8193(vec2 a, vec2 b) {
    const float split = 8193.0;
    float cona = a.x * split;
    float conb = b.x * split;
    float a1 = cona - (cona - a.x);
    float b1 = conb - (conb - b.x);
    float a2 = a.x - a1;
    float b2 = b.x - b1;

    float c11 = a.x * b.x;
    float c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11)));
    float c2 = a.x * b.y + a.y * b.x;

    float t1 = c11 + c2;
    float e = t1 - c11;
    float t2 = a.y * b.y + (c2 - e + (c11 - (t1 - e))) + c21;
    float hi = t1 + t2;
    return vec2(hi, t2 - (hi - t1));
}

vec2 ds_mul_float(vec2 a, float f) {
    float c11 = a.x * f;
    float c21 = a.y * f;
    float t1 = c11 + c21;
    float e = t1 - c11;
    float t2 = c21 - e + (c11 - (t1 - e));
    float hi = t1 + t2;
    return vec2(hi, t2 - (hi - t1));
}

void cds_mul(vec2 ar, vec2 ai, vec2 br, vec2 bi, out vec2 rr, out vec2 ri) {
    vec2 p0 = ds_mul_8193(ar, br);
    vec2 p1 = ds_mul_8193(ai, bi);
    vec2 p2 = ds_mul_8193(ar, bi);
    vec2 p3 = ds_mul_8193(ai, br);
    rr = ds_sub(p0, p1);
    ri = ds_add(p2, p3);
}

void cds_mul_Xn(vec2 X, vec2 dzr, vec2 dzi, out vec2 rr, out vec2 ri) {
    vec2 t0 = ds_mul_float(dzr, X.x);
    vec2 t1 = ds_mul_float(dzi, X.y);
    vec2 t2 = ds_mul_float(dzi, X.x);
    vec2 t3 = ds_mul_float(dzr, X.y);
    rr = ds_mul_float(ds_sub(t0, t1), 2.0);
    ri = ds_mul_float(ds_add(t2, t3), 2.0);
}

float mod2_float(vec2 z) {
    return dot(z, z);
}
