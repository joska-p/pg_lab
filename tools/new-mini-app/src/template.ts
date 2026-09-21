import { createTemplate } from "bingo";
import { z } from "zod";

import pkgJson from "../package.json" with { type: "json" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function packageJson(name: string): string {
  return JSON.stringify(
    {
      name: `@repo/${name}`,
      version: "0.0.0",
      private: true,
      type: "module",
      scripts: {
        dev: "vp dev",
        build: "tsc -b && vp build",
        preview: "vp preview",
      },
      dependencies: {
        "@repo/ui": "workspace:*",
        react: "catalog:",
        "react-dom": "catalog:",
        zustand: "catalog:",
      },
      devDependencies: {
        "@rolldown/plugin-babel": "catalog:",
        "@stylexjs/stylex": "catalog:",
        "@types/node": "catalog:",
        "@types/react": "catalog:",
        "@types/react-dom": "catalog:",
        "@vitejs/plugin-react": "catalog:",
        typescript: "catalog:",
        "unplugin-stylex": "catalog:",
        vite: "catalog:",
        "vite-plus": "catalog:",
      },
    },
    null,
    2,
  );
}

function indexHtml(name: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

const viteConfig = `import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import { lazyPlugins } from "vite-plus";
import stylexPlugin from "unplugin-stylex/vite";
import babel from "@rolldown/plugin-babel";
import { stylexPreset } from "@repo/ui/stylex-preset";

// https://vite.dev/config/
export default defineConfig({
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
`;

const tsconfig = `{
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "lib": ["ES2023", "DOM"],
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
`;

const mainTsx = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

const styleCss = `@import "../node_modules/@repo/ui/src/styles.css"`;

function appTsx(name: string): string {
  return `import { useEffect } from "react";
import { ShellWrapper } from "@repo/ui/components/ShellWrapper";
import { useTheme, setTheme } from "./stores/appStore";
import { ControlPanel } from "@repo/ui/components/ControlPanel";
import { ExperimentShell } from "@repo/ui/components/ExperimentShell";
import { Stage } from "@repo/ui/components/Stage";
import { ControlSection } from "@repo/ui/components/ControlSection";
import { Segmented } from "@repo/ui/components/Segmented";
import { ErrorBoundary } from "@repo/ui/components/ErrorBoundary";

export function App() {
  const theme = useTheme();

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === "system" ? "light dark" : theme;
  }, [theme]);

  return (
    <ShellWrapper>
      <ErrorBoundary showStack={import.meta.env.DEV}>
        <ExperimentShell
          panel={
            <ControlPanel title="${name} controls">
              <ControlSection title="Theme">
                <Segmented<"light" | "dark" | "system">
                  options={["light", "dark", "system"]}
                  value={theme}
                  onValueChange={setTheme}
                />
              </ControlSection>
            </ControlPanel>
          }
        >
          <Stage label="${name}">
            <h1>${name}</h1>
          </Stage>
        </ExperimentShell>
      </ErrorBoundary>
    </ShellWrapper>
  );
}
`;
}

const appStoreTsx = `import { create } from "zustand";

type theme = "light" | "dark" | "system";

type appStore = {
  theme: theme;
};

const appStore = create<appStore>(() => ({
  theme: "dark",
}));

export function useTheme(): theme {
  return appStore((s) => s.theme);
}

export function setTheme(theme: theme): void {
  appStore.setState({ theme });
}
`;

const gitignore = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

export default createTemplate({
  about: {
    name: pkgJson.name,
    description: pkgJson.description,
  },

  options: {
    name: z
      .string()
      .regex(/^[a-z][a-z0-9-]*$/, "Must be kebab-case (e.g. my-experiment)")
      .describe("Mini-app name (kebab-case, becomes @repo/<name>)"),
  },

  async produce({ options }) {
    const { name } = options;

    return {
      files: {
        "package.json": packageJson(name),
        "index.html": indexHtml(name),
        "vite.config.ts": viteConfig,
        "tsconfig.json": tsconfig,
        ".gitignore": gitignore,
        src: {
          "main.tsx": mainTsx,
          "App.tsx": appTsx(name),
          "style.css": styleCss,
          stores: {
            "appStore.tsx": appStoreTsx,
          },
        },
        public: {},
      },
      suggestions: [`cd packages/${name}`, `vp dev`],
    };
  },
});
