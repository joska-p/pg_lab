import { describe, expect, it } from "vite-plus/test";
import { createCssColor } from "../../core/render";
import { colorArray, parseColor } from "./color";

describe("parseColor", () => {
  it("parses hex colors", () => {
    expect(parseColor(createCssColor("#f00"))).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(parseColor(createCssColor("#123456"))).toEqual({
      r: 0x12 / 255,
      g: 0x34 / 255,
      b: 0x56 / 255,
      a: 1,
    });
    expect(parseColor(createCssColor("#ff000080"))).toEqual({
      r: 1,
      g: 0,
      b: 0,
      a: 0x80 / 255,
    });
  });

  it("parses rgb()/rgba() with numbers, percentages and fractions", () => {
    expect(parseColor(createCssColor("rgb(255, 0, 0)"))).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(parseColor(createCssColor("rgb(100%, 0%, 0%)"))).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(parseColor(createCssColor("rgba(0, 0, 0, 0.5)"))).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
  });

  it("parses hsl()/hsla() percentage channels", () => {
    expect(parseColor(createCssColor("hsl(0 100% 50%)"))).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(parseColor(createCssColor("hsl(120 100% 25%)"))).toEqual({ r: 0, g: 0.5, b: 0, a: 1 });
    expect(parseColor(createCssColor("hsl(240 100% 50%)"))).toEqual({ r: 0, g: 0, b: 1, a: 1 });
    expect(parseColor(createCssColor("hsla(120 100% 50% / 0.5)"))).toEqual({
      r: 0,
      g: 1,
      b: 0,
      a: 0.5,
    });
  });

  it("treats unitless hsl() s/l as percentages, not 0..255 channels", () => {
    // Legacy syntax `hsl(120, 100, 50)` must equal `hsl(120, 100%, 50%)` — pre-fix, s/l went
    // through the ÷255 path and produced a mutated, almost-black color.
    expect(parseColor(createCssColor("hsl(120, 100, 50)"))).toEqual(
      parseColor(createCssColor("hsl(120, 100%, 50%)")),
    );
  });

  it("wraps negative and overflowing hues into [0, 360)", () => {
    // Float-exact equivalence: `-60` must produce the same RGBA as `300`.
    expect(parseColor(createCssColor("hsl(-60 100% 50%)"))).toEqual(
      parseColor(createCssColor("hsl(300 100% 50%)")),
    );
    expect(parseColor(createCssColor("hsl(720 100% 50%)"))).toEqual(
      parseColor(createCssColor("hsl(0 100% 50%)")),
    );
  });

  it("parses named colors", () => {
    expect(parseColor(createCssColor("red"))).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(parseColor(createCssColor("green"))).toEqual({ r: 0, g: 0x80 / 255, b: 0, a: 1 });
    expect(parseColor(createCssColor("transparent"))).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it("throws on unrecognized colors (no document fallback under Node)", () => {
    expect(() => parseColor(createCssColor("banana"))).toThrow(/unrecognized color format/);
  });
});

describe("colorArray", () => {
  it("flattens to a 0..1 RGBA tuple", () => {
    expect(colorArray(createCssColor("#00ff00"))).toEqual([0, 1, 0, 1]);
    expect(colorArray(createCssColor("hsla(0 100% 50% / 0.25)"))).toEqual([1, 0, 0, 0.25]);
  });
});
