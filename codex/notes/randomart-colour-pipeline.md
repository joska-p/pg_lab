# Randomart: the colour conversion pipeline (session notes, 2026-10-19)

Read `randomart-time-in-xy.md` first for the overall pipeline. This note answers one question:
why is the pipeline

```
x, y ∈ [-1, 1] → tree → r, g, b ∈ [-1, 1] → colour conversion → screen
```

and not "tree straight to pixels". No code was changed in this session.

Where things live:

- `src/core/color/index.ts`: `COLOR_SPACES`, the GLSL of each space, `ChannelModel`.
- `src/core/compiler/compile.ts`: the last line of `main`.
- `src/core/compiler/preamble.ts`: where the space's GLSL is placed in the shader.
- `src/renderer/contract.ts`: the GLSL contract (`o_color`, "written as-is, read as sRGB").

## 1. Why `[-1, 1]` and not `[0, 1]`

The operator contract (`catalog/operators/types.ts`) is: every operator takes inputs in `[-1, 1]`
and returns a finite value in `[-1, 1]`, for any input. The range is **closed under every operator**,
so the field never needs clamping inside the tree. The symmetric range is what makes that cheap:

- **Coordinates are already symmetric.** `v_p = vUv * 2.0 - 1.0` is centred on the image. `x` and
  `y` are `[-1, 1]` for free, and `warp` stays inside the square with `ra_fold2`
  (`abs(mod(v + 3, 4) - 2) - 1`).
- **Sign is meaningful.** `neg` is just `-a`; on `[0, 1]` it would have to be `1 - a`. `abs` and
  `sqr` fold the field onto `[0, 1]` and give mirror symmetry about the axes, which only means
  something if 0 is the centre.
- **`sin(PI*a)` and `cos(PI*a)`** map `[-1, 1]` onto exactly one period, and land back in `[-1, 1]`.
- **Logic has a natural zero.** There is no boolean type: true = +1, false = -1. `gt` returns
  `(a>b ? 1.0 : -1.0)` and `select` tests `c > 0.0`. With `[0, 1]` the threshold would be an
  arbitrary 0.5.
- **Averages and products stay in range.** `add` is `(a+b)*0.5`; `mul` of two values in `[-1, 1]`
  is in `[-1, 1]`. `div` is `a/(1+abs(b))`, bounded, which is why there is no raw `div`, `log`,
  `sqrt` or `tan`. `mix` rescales its weight: `mix(a, b, (t+1.0)*0.5)`.
- **`const`** draws its value in `[-1, 1]`, so a constant can be either polarity.

The cost is one affine remap at the end. That is what the colour space does.

## 2. What the colour-space function does

Each space is a GLSL function `vec3 ra_<id>(vec3 raw)`: raw triplet in `[-1, 1]`, sRGB in `[0, 1]`
out. Two things happen: the **meaning** of the three components is chosen, then they are converted
to sRGB.

`srgb` (the plain remap):

```glsl
vec3 ra_srgb(vec3 raw) { return clamp(raw * 0.5 + 0.5, 0.0, 1.0); }
```

The channels _are_ red, green, blue. `-1 → 0`, `0 → 0.5`, `+1 → 1`. The clamp is dead code here:
the input is provably in `[-1, 1]`.

`oklch`:

```glsl
float L = clamp(raw.x * 0.5 + 0.5, 0.0, 1.0);   // r  → lightness
float C = abs(raw.y) * 0.4;                      // g  → chroma (sign folded away)
float h = (raw.z * 0.5 + 0.5) * 6.283185307179586; // b → hue, one full turn
return ra_oklabToSrgb(vec3(L, C * cos(h), C * sin(h)));
```

So the three channels are re-read as lightness, chroma and hue, then converted
OKLCH → OKLab → LMS (cube) → linear RGB → sRGB transfer function.

Mapped / preserved:

- **Structure is preserved.** Every remap is monotone per channel (or `abs`), so where the field
  varies, the colour varies. The flatness probe (`fieldDist.measure.test.ts`, last test) shows a
  monotone remap cannot change _local_ flatness: flat images come from a constant field, not from
  the colour mapping.
- **What changes is what each channel controls.** In `srgb`, luminance is a mix of three
  independent channels. In `oklch`, lightness is exactly one channel (`r`), colourfulness another,
  hue a third.

Why OKLCH reads as "flatter, more even colour" (preset description in `presets.ts`). These are
reasonable readings of the code, not measurements:

- OKLab lightness is perceptual, so equal steps in `L` look equal. Raw sRGB has uneven perceived
  brightness across hues.
- With a shared trunk (`shareDepth`, default 2), `r`, `g`, `b` are correlated near the root, so
  lightness, chroma and hue follow the same large-scale shape. The image reads as colour following
  the form instead of coloured noise.
- Chroma is `|g| * 0.4` and the field tends to sit near 0 (products and averages shrink toward 0),
  so many pixels are low-chroma. HSL maps `|g|` to saturation 0..100%, which is why it is more
  garish, and `oklab` (`a = g*0.4`, `b = b*0.4`, Cartesian, no hue wrap) is the calmest of the three.

Observation worth following up: OKLab chroma up to 0.4 is **larger than the sRGB gamut** at most
lightnesses (roughly 0.32 at best). For `oklch`, `oklab` and `hsl` the final
`clamp(..., 0.0, 1.0)` does real work (per-channel gamut clipping, which shifts hue). The comment
in `compile.ts` ("boundary assurance, not a correcting transform") is exactly true only for `srgb`.
A smarter gamut mapping (reduce chroma until in gamut) is an open lead, and it would change
images, so it needs a new shader version, not a `GENERATOR_VERSION` bump.

## 3. Why the conversion happens once, at the end of `main()`

- **The tree is scalar.** Every vertex is a `float`. There is no vec3 value inside the tree, and
  the compiler emits `float v<n> = ...`. A colour only exists once three scalars are packed.
- **Channels share vertices.** `lower()` hash-conses across r, g, b, and the shared trunk makes
  that sharing the point of `shareDepth`. A per-channel or per-branch conversion would break the
  sharing, because the same vertex would need a different interpretation per use.
- **Operators assume one meaning of the range.** `add` averages, `mix` blends, `select` thresholds
  at 0. These are only meaningful if both inputs mean the same thing. Averaging a value that
  "means OKLab L" with one that "means sRGB red" is noise.
- **The closed `[-1, 1]` contract would break.** A mid-tree conversion changes range and type
  (vec3 in `[0, 1]`) and puts a cube and a gamma curve inside operators, which no longer preserve
  `[-1, 1]`.
- **Cost.** Doing it once is constant cost, independent of expression size, and needs no LUT
  (`color/index.ts` header). Per-operator conversion would multiply it by the node count.
- **One space per shader.** `buildPreamble` emits only the chosen space's GLSL. That is why the
  shared helper name `ra_oklabToSrgb` (used by both `oklch` and `oklab`) cannot collide.

## 4. Where `[0, 1]` ends and 8-bit begins

- Output of `ra_<space>`: `vec3` in `[0, 1]`, already **sRGB-encoded** (the OKLab path applies the
  sRGB transfer function itself: `12.92 * lin` below `0.0031308`, else `1.055 * lin^(1/2.4) - 0.055`).
- `compile.ts` ends `main` with `o_color = vec4(ra_<space>(vec3(r, g, b)), 1.0);`. Alpha is
  always 1.
- `o_color` is the fragment output written to the default framebuffer (RGBA, 8 bits per channel,
  normalized). The GPU converts float `[0, 1]` to `[0, 255]` at that write. That is the only place
  quantization happens.
- The contract (`renderer/contract.ts`) states: _"colour values are written as-is and read as sRGB,
  no linear conversion."_ The framebuffer is not an sRGB framebuffer, so the shader must output
  already-encoded values. That is why the gamma curve is in the shader and not left to the
  hardware.
- Readback (`batch.ts`): `drawImage` onto a 2D canvas, then `getImageData`, gives the 8-bit RGBA
  bytes that the descriptors and planche consume. `preserveDrawingBuffer: true` is what keeps the
  picture there after the frame.

## 5. What a "colour space" is, concretely

- A `ColorSpace` is `{ id, label, fn, glsl }` in the `COLOR_SPACES` registry: one entry-point GLSL
  function (plus its helpers) as a plain string. `ColorSpaceId` is the union of the keys
  (`srgb | oklch | oklab | hsl`). Core, no DOM, no GPU.
- Selection: `ChannelModel.space` lives in the grammar. `compile()` passes it to
    - `buildPreamble(catalog, usedDeps, space)`, which appends `colorSpaceGlsl(space)` after the
      dependency functions and before `main`, and
    - the last line of `main`, which calls `colorSpaceFunction(space)` (the `fn` name, e.g.
      `ra_oklch`).
      `compile()` defaults to `RAW_CHANNELS` (`srgb`, `shareDepth 0`) when `channels` is omitted.
      `shareDepth` never reaches the compiler; it shapes the expression, not the emission.
- **Unknown space on import: refused, not repaired.** `readChannels` (`artwork/serialize.ts`)
  checks `isColorSpaceId` and throws `grammar.channels.space: unknown colour space "<x>"`, and
  `createGrammar` (`validateChannels`) throws too. This is the throw-vs-repair policy: a colour
  space is _content_, so there is no canonical substitute. `importArtworkFile` catches it and
  shows it as the action error; state stays untouched. A **missing** `channels` field is fine and
  falls back to `RAW_CHANNELS`. `shareDepth` is an editing quantity and is clamped, not refused.
- Gap noticed: an artwork file stores the expression but the space only exists inside
  `provenance.grammar.channels`. `publishArtwork` uses `provenance?.grammar ?? state.grammar`, so
  an artwork **without provenance** is rendered in whatever space is currently selected. The
  expression is the reference, but the colour reading is not part of it.

## Open leads

- Gamut mapping instead of per-channel clamp for `oklch`, `oklab`, `hsl` (see §2).
- Decide whether the colour space belongs in the artwork file proper, not only in provenance.
- If chroma/saturation scales (`0.4`, `100`) become a tuning knob, they belong in the config file
  session (`codex/prompts/session-config-file.md`) as taste knobs, not constraints. Changing them
  does not alter seed output, so no `GENERATOR_VERSION` bump.
