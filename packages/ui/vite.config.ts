import { defineConfig } from "vite-plus";
import stylexPlugin from "unplugin-stylex/vite";

export default defineConfig({
  plugins: [stylexPlugin()],
  pack: {
    dts: {
      generator: "tsgo",
    },
    exports: true,
  },
  lint: {
    plugins: ["react", "typescript", "oxc"],
    rules: {
      "react/rules-of-hooks": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
