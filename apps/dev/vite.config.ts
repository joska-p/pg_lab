import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import { lazyPlugins } from "vite-plus";
import stylexPlugin from "unplugin-stylex/vite";
import babel from "@rolldown/plugin-babel";
import { stylexPreset } from "@repo/ui/stylex-preset";

// https://vite.dev/config/
export default defineConfig({
  base: "/pg_lab",
  lint: {
    plugins: ["react", "typescript", "oxc"],
    rules: {
      "react/rules-of-hooks": "error",
      "react/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  plugins: lazyPlugins(() => [
    stylexPlugin(stylexPreset),
    babel({
      presets: [reactCompilerPreset()],
    }),
    react(),
  ]),
  resolve: {
    dedupe: ["@stylexjs/stylex", "react", "react-dom"],
  },
  optimizeDeps: {
    exclude: ["@repo/ui"],
  },
  server: {
    fs: {
      allow: ["../.."],
    },
  },
});
