import { describe, expect, it } from "vite-plus/test";

import { textUniforms } from "./TextRasterizer";
import { createCssColor } from "../../core/types";

describe("text uniform builder", () => {
  it("positions the baseline and tints the fill", () => {
    const texture = {} as WebGLTexture;
    const uniforms = textUniforms({ x: 100, y: 50 }, 60, 40, 28, texture, {
      fill: createCssColor("#ff0000"),
    });

    expect(uniforms["u_position"]).toEqual([100, 22]);
    expect(uniforms["u_size"]).toEqual([60, 40]);
    expect(uniforms["u_texture"]).toBe(texture);
    expect(uniforms["u_color"]).toEqual([1, 0, 0, 1]);
  });
});
