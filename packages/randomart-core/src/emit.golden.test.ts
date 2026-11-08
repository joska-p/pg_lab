import { describe, expect, it } from 'vite-plus/test';

import { COLOR_SPACE_IDS } from './colors';
import { compile } from './emit';
import { generate } from './generate';
import { getGrammarPreset, GRAMMAR_PRESETS } from './grammar';
import { seedOf } from './testing/fixtures';

describe('emit golden', () => {
    for (const preset of GRAMMAR_PRESETS) {
        it(`preset ${preset.id}`, () => {
            const compiled = compile(generate(preset.grammar, seedOf(42)), {
                space: preset.grammar.space,
            });
            expect(compiled.source).toMatchSnapshot();
        });
    }

    for (const space of COLOR_SPACE_IDS) {
        it(`space ${space}`, () => {
            const compiled = compile(generate(getGrammarPreset('default').grammar, seedOf(7)), {
                space,
            });
            expect(compiled.source).toMatchSnapshot();
        });
    }
});
