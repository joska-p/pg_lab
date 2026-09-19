import { describe, expect, it } from "vite-plus/test";

import { colorArray, parseColor } from "./color";
import { createCssColor } from "../../core/types";

describe("parseColor", () => {
  it("parses #rrggbb", () => {
    expect(parseColor(createCssColor("#ff8000"))).toEqual({
      r: 1,
      g: 0.5019607843137255,
      b: 0,
      a: 1,
    });
  });

  it("parses #rgb shorthand", () => {
    expect(parseColor(createCssColor("#f80"))).toEqual({
      r: 1,
      g: 0.5333333333333333,
      b: 0,
      a: 1,
    });
  });

  it("parses #rrggbbaa with alpha", () => {
    expect(parseColor(createCssColor("#ff000080"))).toEqual({
      r: 1,
      g: 0,
      b: 0,
      a: 0.5019607843137255,
    });
  });

  it("parses rgb() and rgba()", () => {
    expect(parseColor(createCssColor("rgb(255, 128, 0)"))).toEqual({
      r: 1,
      g: 0.5019607843137255,
      b: 0,
      a: 1,
    });
    expect(parseColor(createCssColor("rgba(255, 128, 0, 0.5)"))).toEqual({
      r: 1,
      g: 0.5019607843137255,
      b: 0,
      a: 0.5,
    });
  });

  it("parses hsl()", () => {
    const color = parseColor(createCssColor("hsl(120, 100%, 50%)"));

    expect(color.r).toBeCloseTo(0);
    expect(color.g).toBeCloseTo(1);
    expect(color.b).toBeCloseTo(0);
  });

  it("parses named colors", () => {
    expect(parseColor(createCssColor("red"))).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(parseColor(createCssColor("transparent"))).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it("colorArray returns a flat rgba tuple", () => {
    expect(colorArray(createCssColor("#ff0000"))).toEqual([1, 0, 0, 1]);
  });

  it("throws on invalid color format instead of silent magenta fallback", () => {
    expect(() => parseColor(createCssColor("not-a-color"))).toThrow(/unrecognized color format/);
  });
});
