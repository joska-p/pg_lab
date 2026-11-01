import { compile } from '../codegen/compile';
import type { CompileOptions } from '../codegen/compile';
import type { Compiled } from '../codegen/types';
import { generate } from '../gen/generator';
import { createGrammar } from '../grammar/grammar';
import type { Grammar, GrammarWeights, SizeProfile } from '../grammar/types';
import { serialize } from '../ir/serialize';
import type { Expression } from '../ir/types';
import type { Catalog } from '../isa/catalog';
import { defaultCatalog } from '../isa/default';
import type { Seed } from '../rng/types';

export interface VmOptions {
    catalog?: Catalog;
}

export class Vm {
    catalog: Catalog;
    constructor(opts: VmOptions = {}) {
        this.catalog = opts.catalog ?? defaultCatalog;
    }

    createGrammar(opts: {
        weights: GrammarWeights;
        size: SizeProfile;
        shareDepth: number;
        space?: string;
        label?: string;
        description?: string;
    }): Grammar {
        return createGrammar(this.catalog, opts);
    }

    generate(grammar: Grammar, seed: Seed | number | string) {
        return generate(this.catalog, grammar, seed);
    }

    compile(expr: Expression, opts: CompileOptions = {}): Compiled {
        return compile(this.catalog, expr, opts);
    }

    render(grammar: Grammar, seed: Seed | number | string, opts: CompileOptions = {}) {
        const expr = this.generate(grammar, seed);
        const compiled = this.compile(expr, { space: grammar.space, ...opts });
        return { expr, compiled, serialized: serialize(expr) };
    }

    static default() {
        return new Vm();
    }
}

export const vm = new Vm();
