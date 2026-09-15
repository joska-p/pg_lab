# UI Setup Contract

How `@repo/ui` (StyleX design tokens + components) is distributed to apps in
this monorepo, and how to scaffold a new app that honors the contract.

Related: `component-authoring.md` (adding components), `coding-conventions.md`.
StyleX reference: <https://stylexjs.com>.

---

## 1. The contract in one paragraph

`@repo/ui` is **internal-only** and ships **StyleX source, not compiled CSS**.
Every app compiles the UI source itself with `unplugin-stylex`, using the
shared `stylexPreset` owned by the library. Each app therefore emits exactly
one small, deduplicated `stylex.css` containing only the styles it uses. This
scales to many apps and to per-page static output (Astro): no global CSS
bundle, no rebuild-the-lib-before-dev ordering.

## 2. Library side (`packages/ui`)

- `package.json` `exports` point at `./src` (`.`, `./tokens/*`, `./consts/*`,
  `./foundations/*`, `./effects/*`, `./intents/*`, `./components/*`, `./stylex-preset`). Never at `dist` for JS: `dist` output
  from `vp pack` is uncompiled w.r.t. StyleX and nothing imports it at runtime.
- `@stylexjs/stylex` is a `peerDependency`, never inlined or bundled. Inlining
  it duplicates the runtime (and its compile-time stubs) once per app.
- `vite.config.ts` carries **no** Vite transform plugins. `vp pack` runs
  tsdown, not Vite, so a `stylexPlugin()` there would silently do nothing for
  the library build. The `pack` block is kept for `dts` only, with
  `exports: false` so `vp pack` never rewrites the source-pointing `exports`
  map (this has bitten us: with `exports: true`, pack replaced the map with
  `./dist/index.mjs` and every subpath import broke).
- `tsconfig.json` uses `moduleResolution: bundler`, matching the apps.
- Imports are **extensionless** (`../theme/tokens.stylex`, never
  `../theme/tokens.stylex.ts`). The `.ts`-suffixed form only worked by accident
  via `allowImportingTsExtensions` and diverges between `bundler` and
  `nodenext` resolution.
- `stylex-preset.ts` is the single source of truth for compiler options
  (currently `useCSSLayers: true`). Apps must spread it into `unplugin-stylex`
  so classnames, layers and CSS output stay deterministic across the repo.

## 3. App side (`apps/*`)

Every app needs, as in `apps/dev`:

- Dependencies: `@repo/ui: workspace:*`, `react`, `react-dom` (+
  `@stylexjs/stylex` and `unplugin-stylex` in `devDependencies` — do not rely
  on hoisting).
- `vite.config.ts`, in plugin order:
  ```ts
  import stylexPlugin from "unplugin-stylex/vite";
  import { stylexPreset } from "@repo/ui/stylex-preset";

  plugins: lazyPlugins(() => [
    stylexPlugin(stylexPreset), // first: compiles StyleX before other transforms
    babel({ presets: [reactCompilerPreset()] }),
    react(),
  ]),
  resolve: { dedupe: ["@stylexjs/stylex", "react", "react-dom"] },
  optimizeDeps: { exclude: ["@repo/ui"] },
  server: { fs: { allow: ["../.."] } },
  ```
- Why `optimizeDeps.exclude` + `server.fs.allow`? They are **canonical Vite
  monorepo settings for compiler-plugin libraries**, not hacks. Without the
  exclude, Vite pre-bundles `@repo/ui` with esbuild (no StyleX transform) and
  the raw `defineConsts`/`defineVars`/`create` calls reach the browser. Without
  `fs.allow`, Vite cannot serve/transform sources living outside the app root
  (`packages/ui/src`).
- Consume a single entry style: either `@repo/ui` or the `@repo/ui/theme/*`
  subpaths, never a mix of `dist` and `src` for the same package.
- Local `stylex.create` in an app must import theme/behavior values from
  their defining files (`@repo/ui/tokens/colors.stylex`,
  `@repo/ui/tokens/shadows.stylex`, `@repo/ui/effects/glass.stylex`),
  never from the `@repo/ui` barrel: the StyleX compiler cannot resolve
  `defineVars` through a re-export (build error `Could not resolve the path
to the imported file`). Components themselves stay on the barrel.

## 4. Scaffolding a new app

Do not copy-paste by hand. Run from the workspace root:

```bash
vp run new-app -- <name>
# e.g. vp run new-app -- website
```

This copies `tools/app-template/` to `apps/<name>`, substitutes the name, and
prints the follow-up steps (`vp install`, then `vp -C apps/<name> dev`). The
template mirrors `apps/dev` (same lint block, same plugin order, same
`optimizeDeps`/`fs.allow`), with a minimal smoke-test `App.tsx` that renders
one `@repo/ui` component through the shared tokens.

If the template drifts from `apps/dev`, fix the template — `apps/dev` is the
reference implementation.

## 5. Verification

After wiring (or after generating):

```text
vp -C apps/<name> dev      # no "Unexpected 'stylex.*' call at runtime"
curl localhost:<port>/stylex.css   # 200, starts with "@layer ..."
vp -C apps/<name> build    # emits dist/assets/stylex.css; bundle contains
                           # no "defineConsts(" calls, only atomic classes
vp check                   # fmt + lint + types green
```

## 6. Troubleshooting

| Symptom                                                   | Likely cause                                                                                                                                               | Fix                                                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `Unexpected 'stylex.defineConsts' call at runtime` in dev | `@repo/ui` pre-bundled without the plugin                                                                                                                  | `optimizeDeps.exclude: ["@repo/ui"]`                                                      |
| Same error, exclude already set                           | `useCSSLayers` passed at top level (`stylexPlugin({ useCSSLayers })`) instead of nested (`stylexPlugin({ stylex: { useCSSLayers } })`), or preset not used | Spread `stylexPreset`                                                                     |
| `TS2307: Cannot find module '@repo/ui/theme/…'`           | `vp pack` rewrote `exports` to `dist`                                                                                                                      | `pack.exports: false` in the lib config, restore source-pointing `exports`                |
| Styles missing in production build only                   | `runtimeInjection` defaults to off outside dev; `stylex.css` asset not linked                                                                              | Emit + link `stylex.css` (the plugin's `transformIndexHtml` handles the default filename) |
| Two copies of React/StyleX at runtime                     | Missing `resolve.dedupe`                                                                                                                                   | Add the `dedupe` list from section 3                                                      |

## 7. Future static site (Astro)

Same recipe per page: consume `@repo/ui` source, compile with
`unplugin-stylex` (Astro entry) using `stylexPreset`. Each static page then
ships only its own atomic CSS. Do not introduce a global prebuilt UI
stylesheet — it would force every page to pay for every app.
