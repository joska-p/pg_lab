import { defineConfig } from "vite-plus";

// @repo/ui ships StyleX source for consumers to compile, so no Vite
// transform plugins belong here (vp pack runs tsdown, not Vite).
// pack must not rewrite package.json exports: they intentionally point
// at ./src so every app compiles the same source with the shared preset.
export default defineConfig({
  pack: {
    dts: {
      generator: "tsgo",
    },
    exports: false,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
