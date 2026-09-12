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
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
