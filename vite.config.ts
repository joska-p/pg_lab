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
        rules: {
            'vite-plus/prefer-vite-plus-imports': 'error',
            'oxc/branches-sharing-code': 'error',
            'import/no-cycle': 'error',
            'import/no-default-export': 'error',
            'import/no-duplicates': 'error',
            'import/no-relative-parent-imports': 'error',
            'import/no-unassigned-import': 'error',
            'typescript/adjacent-overload-signatures': 'error',
            'typescript/consistent-type-assertions': 'error',
            'typescript/consistent-type-definitions': 'error',
            'typescript/consistent-type-exports': 'error',
            'typescript/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],
            'typescript/consistent-indexed-object-style': ['error', 'record'],
            'typescript/dot-notation': 'error',
            // 'typescript/explicit-function-return-type': 'error',
            // 'typescript/explicit-member-accessibility': 'error',
            // 'typescript/explicit-module-boundary-types': 'error',
            'typescript/no-confusing-non-null-assertion': 'error',
            'typescript/no-explicit-any': 'error',
            'typescript/no-inferrable-types': 'error',
            'typescript/no-unnecessary-template-expression': 'error',
            'typescript/no-unnecessary-type-arguments': 'error',
            'typescript/no-unnecessary-type-assertion': 'error',
            'typescript/no-non-null-asserted-nullish-coalescing': 'error',
            // 'typescript/no-unnecessary-condition': 'error',
        },
        options: { typeAware: true, typeCheck: true },
    },
    run: {
        cache: true,
    },
});
