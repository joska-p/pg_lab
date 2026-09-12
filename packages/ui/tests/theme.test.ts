import { describe, expect, test } from "vite-plus/test";
import {
  blur,
  borderWidth,
  color,
  motion,
  radius,
  shadow,
  space,
  styles,
  typography,
  zIndex,
} from "../src/index.ts";

const publicExports = Object.keys(await import("../src/index.ts"));

const keysOf = (value: object) => Object.keys(value).filter((key) => !key.startsWith("__"));

describe("theme", () => {
  test("exports all semantic token groups", () => {
    expect(publicExports).toEqual(
      expect.arrayContaining([
        "color",
        "space",
        "radius",
        "typography",
        "shadow",
        "blur",
        "borderWidth",
        "motion",
        "zIndex",
        "styles",
      ]),
    );
  });

  test("does not export the raw palette", () => {
    expect(publicExports).not.toContain("palette");
  });

  test("color tokens are the semantic contract", () => {
    expect(keysOf(color)).toEqual([
      "background",
      "surface",
      "surfaceElevated",
      "text",
      "textMuted",
      "textDisabled",
      "border",
      "borderHover",
      "borderActive",
      "accent",
      "accentHover",
      "accentActive",
      "onAccent",
      "success",
      "warning",
      "error",
    ]);
    for (const value of Object.values(color)) {
      expect(value).toBeTruthy();
    }
  });

  test("spacing scale is small and present", () => {
    expect(keysOf(space)).toEqual(["xs", "sm", "md", "lg", "xl"]);
    for (const value of Object.values(space)) {
      expect(value).toBeTruthy();
    }
  });

  test("radius scale is small and present", () => {
    expect(keysOf(radius)).toEqual(["sm", "md", "lg"]);
  });

  test("typography exposes families, roles, lines, and weights", () => {
    expect(keysOf(typography)).toEqual([
      "fontSans",
      "fontMono",
      "sizeBody",
      "sizeLabel",
      "sizeValue",
      "sizeCaption",
      "lineBody",
      "lineLabel",
      "lineValue",
      "lineCaption",
      "weightRegular",
      "weightMedium",
      "weightSemibold",
    ]);
    for (const value of Object.values(typography)) {
      expect(value).toBeDefined();
    }
  });

  test("semantic color keys never expose palette naming", () => {
    const rawPaletteNames = [
      "bg0",
      "bg0Hard",
      "bg1",
      "fg1",
      "fg3",
      "orange",
      "orangeActive",
      "green",
      "yellow",
      "red",
      "black",
    ];
    for (const key of keysOf(color)) {
      expect(rawPaletteNames.some((name) => key.includes(name))).toBe(false);
    }
  });
});

describe("style variants", () => {
  test("provides meaningful visual states", () => {
    const names = ["interactive", "active", "selected", "disabled", "focusRing"] as const;
    for (const name of names) {
      expect(styles[name]).toBeDefined();
    }
  });

  test("shadow and blur define restrained elevation", () => {
    expect(keysOf(shadow)).toEqual(["panel", "overlay"]);
    expect(keysOf(blur)).toEqual(["panel", "overlay"]);
  });

  test("motion defines durations and easings", () => {
    expect(keysOf(motion)).toEqual([
      "durationFast",
      "durationNormal",
      "durationSlow",
      "easingOut",
      "easingInOut",
    ]);
  });

  test("border width defines a restrained scale", () => {
    expect(keysOf(borderWidth)).toEqual(["hairline"]);
  });

  test("layering scale is semantic and minimal", () => {
    expect(keysOf(zIndex)).toEqual(["base", "canvas", "overlay", "panel", "modal"]);
  });
});
