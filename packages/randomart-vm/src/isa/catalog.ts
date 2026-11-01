import { IsaError } from '../spec/errors';
import type { IsaOperator, OperatorDef, ParamRange } from './types';

function zipRecord(names: readonly string[], values: readonly any[]): Record<string, any> {
    const out: Record<string, any> = {};
    for (let i = 0; i < names.length; i++) {
        out[names[i]] = values[i];
    }
    return out;
}

export class Operator implements IsaOperator {
    readonly name: string;
    readonly label: string;
    readonly group: string;
    readonly params: readonly ParamRange[];
    readonly inputNames: readonly string[];
    readonly currentCount: number;
    readonly requires: readonly string[];
    readonly hasInner: boolean;
    #def: OperatorDef;

    constructor(name: string, def: OperatorDef) {
        const current = def.inputs ?? [];
        const inner = def.inner ?? [];
        if (inner.length > 0 && !def.coords) {
            throw new IsaError(`Operator ${name}: inner inputs require coords`);
        }
        this.name = name;
        this.label = def.label ?? name;
        this.group = def.group;
        this.inputNames = Object.freeze([...current, ...inner]);
        this.currentCount = current.length;
        this.hasInner = inner.length > 0;
        this.requires = Object.freeze([...(def.requires ?? [])]);
        this.params = Object.freeze(
            Object.entries(def.params ?? {}).map(([pname, range]) =>
                Object.freeze({ name: pname, ...range }),
            ),
        );
        this.#def = def;
    }

    get arity(): number {
        return this.inputNames.length;
    }

    get isTerminal(): boolean {
        return this.arity === 0;
    }

    glsl(inputs: readonly string[], params: readonly number[], p: string): string {
        return this.#def.glsl({
            p,
            args: zipRecord(this.inputNames, inputs),
            params: zipRecord(
                this.params.map((pr) => pr.name),
                params,
            ),
        });
    }

    coords(inputs: readonly string[], params: readonly number[], p: string): string {
        if (!this.#def.coords) {
            throw new IsaError(`Operator ${this.name} has no coords`);
        }
        return this.#def.coords({
            p,
            args: zipRecord(this.inputNames.slice(0, this.currentCount), inputs),
            params: zipRecord(
                this.params.map((pr) => pr.name),
                params,
            ),
        });
    }
}

export class Catalog {
    #ops = new Map<string, Operator>();

    register(def: OperatorDef): void {
        const op = new Operator(def.name, def);
        this.#ops.set(op.name, op);
    }

    operator(name: string): Operator {
        const op = this.#ops.get(name);
        if (!op) {
            throw new IsaError(`Unknown operator: ${name}`);
        }
        return op;
    }

    has(name: string): boolean {
        return this.#ops.has(name);
    }

    operators(): Operator[] {
        return Array.from(this.#ops.values());
    }

    names(): string[] {
        return Array.from(this.#ops.keys());
    }
}
