import stylexPlugin from 'unplugin-stylex/vite';
import { defineConfig } from 'vite-plus';

const ignorePatterns = ['dist/**', '**/vendor/*.js', '.agents/skills/impeccable'];

export default defineConfig({
    create: {
        templates: [
            {
                name: 'new-mini-app',
                description: 'Scaffold a new mini-app from the specimen template.',
                template: './tools/new-mini-app',
            },
        ],
    },
    plugins: [stylexPlugin()],
    staged: {
        '*': 'vp check --fix',
    },
    fmt: {
        ignorePatterns,
        tabWidth: 4,
        singleQuote: true,
        sortImports: true,
        jsdoc: true,
    },
    lint: {
        ignorePatterns,
        jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
        rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
        options: { typeAware: true, typeCheck: true },
    },
    run: {
        cache: true,
    },
});
