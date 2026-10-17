import { describe, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/index.ts';
import { generate } from '../generator/index.ts';
import { compile } from './compile.ts';
import { buildFuzzCases } from './testing.ts';
import type { SharingPolicy } from './types.ts';

/**
 * Writes the fuzz shaders to a directory so `glslangValidator` can check them in CI (see
 * `scripts/validate-glsl.sh`). Opt-in:
 *
 *     VITE_DUMP_SHADERS=/abs/dir vp test dump
 *
 * Glaze prepends `#version 300 es` at runtime, so the dump does the same.
 */
const dumpDir = import.meta.env.VITE_DUMP_SHADERS as string | undefined;
const COUNT = Number(import.meta.env.VITE_FUZZ_COUNT ?? 300);
const POLICIES: readonly SharingPolicy[] = ['none', 'shared', 'all'];

describe('shader dump for glslangValidator', () => {
    it.skipIf(!dumpDir)('writes one .frag file per case and policy', async () => {
        const { mkdirSync, writeFileSync } = await import('node:fs');
        const path = await import('node:path');
        const directory = dumpDir ?? '';
        const catalog = createDefaultCatalog();

        mkdirSync(directory, { recursive: true });

        for (const { label, grammar, seed } of buildFuzzCases(catalog, COUNT)) {
            const expression = generate(catalog, grammar, seed);

            for (const policy of POLICIES) {
                try {
                    const { source } = compile(catalog, expression, {
                        sharing: policy,
                        channels: grammar.channels,
                    });

                    writeFileSync(
                        path.join(directory, `${label.replace('#', '-')}-${policy}.frag`),
                        `#version 300 es\n${source}\n`,
                    );
                } catch {
                    // `none` can exceed the source guard: nothing to validate for that case.
                }
            }
        }
    });
});
