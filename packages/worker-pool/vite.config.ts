import { defineConfig } from 'vite-plus';

export default defineConfig({
    pack: {
        // No src/index.ts here: the single public entry is
        // package.json "./worker-pool" -> ./src/worker-pool.ts.
        // exports: false: the dual source/dist map in package.json is
        // hand-written and must not be rewritten.
        entry: ['./src/worker-pool.ts'],
        dts: {
            generator: 'tsgo',
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
