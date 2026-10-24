# @repo/palette-engine

> A pure engine that maps a base color to harmonious palettes — four color spaces, four harmony rules, no UI, no rendering, no opinions about how the result should be shown.

---

## Intention & Concept

`@repo/palette-engine` is the logic half of a two-package color palette system. It defines color spaces as navigable 2D canvases with a third-axis slider, and harmony rules as functions that take a base color and return an array of derived colors. All React UI, canvas painting, and state management lives in `@repo/palette-generator`.

The interesting tension is between **perceptual uniformity** and **practical intuition**. The engine offers four color spaces — OKLab, OKLCh, HSL, sRGB. OKLab/OKLCh are perceptually uniform (equal steps in any axis produce equal perceived changes); HSL/sRGB are familiar but uneven. Offering both lets the user choose between mathematical correctness and muscle memory.

The harmony rules are built on **OKLCh**: all four convert the base color to OKLCh before touching hue, chroma, or lightness, so they operate in a perceptually uniform space no matter where the user picked the base from. A rule is a simple contract — `apply(color) → Color[]`. No class hierarchy, no strategy pattern, just a function.

## Brainstorming, Inspirations & Credits

- **Visual Inspo:** interactive color-space explorers and palette generators.
- **Math / Papers:** color science — OKLab/OKLCh perceptually uniform color spaces (Björn Ottosson), HSL, sRGB, color harmony theory (complementary 180°, triadic 120°, analogous ±30°).
- **Borrowed Code & Algorithms:** `colorjs.io` for `Color` construction and space conversion — the engine's only dependency.

## Patterns & Gotchas

- **Every rule returns exactly 6 colors** — a deliberate design choice, not a mathematical constraint (analogous could produce 3 or 9). Enough variation to explore, not so many as to overwhelm the display.
- **Chroma dampening at extremes:** the monochromatic rule reduces chroma by 20% for very light (L > 0.8) and very dark (L < 0.3) colors — a perceptual correction, since pure OKLCh lightness steps can produce oversaturated pastels at the extremes.
- **`Palette` is just `{ colors: Color[] }`** — almost suspiciously thin for a named type. The engine doesn't prescribe what a palette _is_; it just hands back the colors.

## References

- [OKLab color space — Björn Ottosson](https://bottosson.github.io/posts/oklab/)
- [OKLCH in CSS](https://oklch.com/)
- [colorjs.io](https://colorjs.io/)
