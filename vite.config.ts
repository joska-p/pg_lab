import stylexPlugin from "unplugin-stylex/vite";
import { defineConfig } from "vite-plus";

const ignorePatterns = ["dist/**", "**/vendor/*.js", ".agents/skills/impeccable"];

export default defineConfig({
  plugins: [stylexPlugin()],
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns,
  },
  lint: {
    ignorePatterns,
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
});
