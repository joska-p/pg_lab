import { createTemplate } from 'bingo';
import { z } from 'zod';

import pkgJson from '../package.json' with { type: 'json' };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function packageJson(name: string): string {
    return JSON.stringify(
        {
            name: `@repo/${name}`,
            version: '0.0.0',
            private: true,
            type: 'module',
            exports: {
                './App': './src/App.tsx',
                './Experiment': './src/Experiment.tsx',
            },
            scripts: {
                dev: 'vp dev',
                lint: 'vp lint',
            },
            dependencies: {
                '@repo/ui': 'workspace:*',
                react: 'catalog:',
                'react-dom': 'catalog:',
                zustand: 'catalog:',
            },
            devDependencies: {
                '@stylexjs/stylex': 'catalog:',
                '@types/react': 'catalog:',
                '@types/react-dom': 'catalog:',
                typescript: 'catalog:',
                vite: 'catalog:',
                'vite-plus': 'catalog:',
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

const viteConfig = `import { defineAppConfig } from '../../vite.config.ts';

export default defineAppConfig();`;

const tsconfig = `{
    "files": [],
    "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}`;

const tsconfigApp = `{
    "$schema": "https://json.schemastore.org/tsconfig",
    "extends": "../../tsconfig.app",
    "include": ["src"]
}`;

const tsconfigNode = `{
    "$schema": "https://json.schemastore.org/tsconfig",
    "extends": "../../tsconfig.node",
    "include": ["vite.config.ts"]}`;

const mainTsx = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

const styleCss = `@import '../node_modules/@repo/ui/src/styles.css';`;

function sceneTsx(name: string): string {
    return `export function Scene() {
    return <h1>${name}</h1>;
}
`;
}

function controlsTsx(name: string): string {
    return `import { ControlPanel } from '@repo/ui/components/ControlPanel';

export function Controls() {
    return <ControlPanel title="${name}" />;
}
`;
}

function experimentTsx(name: string): string {
    return `import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';

import { Controls } from './components/Controls';
import { Scene } from './components/Scene';

export function Experiment() {
    return (
        <ExperimentLayout stageLabel="${name}" panel={<Controls />}>
            <Scene />
        </ExperimentLayout>
    );
}
`;
}

const appTsx = `import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentWrapper } from '@repo/ui/components/ExperimentWrapper';

import { Experiment } from './Experiment';

export function App() {
    return (
        <ExperimentWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <Experiment />
            </ErrorBoundary>
        </ExperimentWrapper>
    );
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
            .regex(/^[a-z][a-z0-9-]*$/, 'Must be kebab-case (e.g. my-experiment)')
            .describe('Mini-app name (kebab-case, becomes @repo/<name>)'),
    },

    async produce({ options }) {
        const { name } = options;

        return {
            files: {
                'package.json': packageJson(name),
                'index.html': indexHtml(name),
                'vite.config.ts': viteConfig,
                'tsconfig.json': tsconfig,
                'tsconfig.app.json': tsconfigApp,
                'tsconfig.node.json': tsconfigNode,
                '.gitignore': gitignore,
                src: {
                    'main.tsx': mainTsx,
                    'App.tsx': appTsx,
                    'Experiment.tsx': experimentTsx(name),
                    'style.css': styleCss,
                    components: {
                        'Scene.tsx': sceneTsx(name),
                        'Controls.tsx': controlsTsx(name),
                    },
                },
                public: {},
            },
            suggestions: [`cd packages/${name}`, `vp dev`],
        };
    },
});
