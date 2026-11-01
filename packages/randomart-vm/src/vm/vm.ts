import { compile } from '../codegen/compile';
import type { Compiled } from '../codegen/types';
import { generate } from '../gen/generator';
import { createGrammar } from '../grammar/grammar';
import type { Grammar, GrammarWeights, SizeProfile } from '../grammar/types';
import { serialize } from '../ir/serialize';
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

    compile(expr: any, opts: any = {}): Compiled {
        return compile(this.catalog, expr, opts);
    }

    render(grammar: Grammar, seed: Seed | number | string, opts: any = {}) {
        const expr = this.generate(grammar, seed);
        const compiled = this.compile(expr, opts);
        return { expr, compiled, serialized: serialize(expr) };
    }

    static default() {
        return new Vm();
    }
}

export const vm = new Vm();
