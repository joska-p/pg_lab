import { describe, expect, it } from 'vite-plus/test';

import { validateShaderContract } from '../../renderer/contract.ts';
import { createDefaultCatalog } from '../catalog/index.ts';
import { generate } from '../generator/index.ts';
import { compile } from './compile.ts';
import { buildFuzzCases, checkShaderStructure } from './testing.ts';
import type { CompiledShader, SharingPolicy } from './types.ts';

const catalog = createDefaultCatalog();
const FUZZ_COUNT = Number(import.meta.env.VITE_FUZZ_COUNT ?? 300);
const POLICIES: readonly SharingPolicy[] = ['none', 'shared', 'all'];

function isSourceTooLong(error: unknown): boolean {
    return error instanceof Error && /MAX_SOURCE_LENGTH/.test(error.message);
}

describe(`compiler fuzz, pure (${FUZZ_COUNT} cases x 3 policies)`, () => {
    const cases = buildFuzzCases(catalog, FUZZ_COUNT);

    it('emits structurally valid, consistent GLSL under every policy', () => {
        let skippedNone = 0;

        for (const { label, grammar, seed } of cases) {
            const expression = generate(catalog, grammar, seed);
            const compiled = new Map<SharingPolicy, CompiledShader>();

            for (const policy of POLICIES) {
                try {
                    compiled.set(
                        policy,
                        compile(catalog, expression, {
                            sharing: policy,
                            channels: grammar.channels,
                            motion: grammar.motion,
                        }),
                    );
                } catch (error) {
                    // Only `none` may legitimately blow the source guard (inlined multiplicities).
                    if (policy === 'none' && isSourceTooLong(error)) {
                        skippedNone++;
                        continue;
                    }

                    throw new Error(
                        `[${label}] compile(${policy}) threw: ${error instanceof Error ? error.message : String(error)}`,
                        { cause: error },
                    );
                }
            }

            // Animation is a property of the grammar's motion, not of the vocabulary.
            const expectedAnimated = grammar.motion !== 'off';

            for (const [policy, shader] of compiled) {
                const where = `${label} / ${policy}`;

                expect(checkShaderStructure(shader.source), where).toEqual([]);
                expect(validateShaderContract(shader.source).errors, where).toEqual([]);
                expect(shader.animated, where).toBe(expectedAnimated);
                expect(shader.stats.sourceLength, where).toBe(shader.source.length);

                const variables = shader.source.match(/^\s*float v\d+ =/gm)?.length ?? 0;
                const contexts = shader.source.match(/^\s*vec2 c\d+ =/gm)?.length ?? 0;

                expect(shader.stats.variables, where).toBe(variables);
                expect(shader.stats.contexts, where).toBe(1 + contexts);
            }

            // The vertex graph is a property of the expression, not of the policy.
            const vertexCounts = new Set([...compiled.values()].map((s) => s.stats.vertices));

            expect(vertexCounts.size, label).toBe(1);

            const none = compiled.get('none');
            const all = compiled.get('all');

            if (none) {
                expect(none.stats.variables, label).toBe(0);
            }

            if (all) {
                expect(all.stats.variables, label).toBe(all.stats.vertices);
            }
        }

        // Informational: how often the unshared policy hits the source guard on these cases.
        console.info(
            `fuzz: ${skippedNone}/${cases.length} cases skipped under 'none' (source guard)`,
        );
    });

    it('is deterministic under the default policy', () => {
        for (const { grammar, seed } of cases.slice(0, 50)) {
            const expression = generate(catalog, grammar, seed);
            const options = { channels: grammar.channels };

            expect(compile(catalog, expression, options).source).toBe(
                compile(catalog, expression, options).source,
            );
        }
    });
});
