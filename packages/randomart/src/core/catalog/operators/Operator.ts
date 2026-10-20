import type { ParamRange } from '../../config/index.ts';
import type { OperatorGroup, OperatorSpec } from './types.ts';

const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1;

const zip = <V>(names: readonly string[], values: readonly V[]): Record<string, V> =>
    Object.fromEntries(names.map((name, i) => [name, values[i]]));

/**
 * A spec turned into something the generator, compiler and UI can query. Positional at the boundary
 * (inputs = `[...inputs, ...inner]`, the order used by nodes and the compiler), named inside the
 * spec. Multiplicities are probed once, here, with sentinels at the params' minimum (a multiplicity
 * must not depend on params; `catalog.test.ts` asserts that).
 */
export class Operator {
    readonly name: string;
    readonly label: string;
    readonly group: OperatorGroup;
    readonly params: readonly (ParamRange & { readonly name: string })[];
    /** `inputs` then `inner`: the positional order used by nodes and the compiler. */
    readonly inputNames: readonly string[];
    /** Number of `current` inputs; the rest are `inner`. */
    readonly currentCount: number;
    readonly requires: readonly string[];
    readonly #spec: OperatorSpec;
    readonly #multiplicity: readonly number[];
    readonly #coordsMultiplicity: readonly number[];

    constructor(name: string, spec: OperatorSpec) {
        const current = spec.inputs ?? [];
        const inner = spec.inner ?? [];

        if (inner.length > 0 !== (spec.coords !== undefined)) {
            throw new Error(`Operator "${name}": \`inner\` and \`coords\` go together`);
        }

        this.name = name;
        this.label = spec.label;
        this.group = spec.group;
        this.params = Object.freeze(
            Object.entries(spec.params ?? {}).map(([paramName, range]) =>
                Object.freeze({ name: paramName, ...range }),
            ),
        );
        this.inputNames = Object.freeze([...current, ...inner]);
        this.currentCount = current.length;
        this.requires = Object.freeze([...(spec.requires ?? [])]);
        this.#spec = spec;

        const sentinels = this.inputNames.map((_, i) => `@${i}@`);
        const minimums = this.params.map((param) => param.min);
        const glslText = this.glsl(sentinels, minimums, '@p@');
        const currentSentinels = sentinels.slice(0, this.currentCount);
        const coordsText = spec.coords ? this.coords(currentSentinels, minimums, '@p@') : '';

        this.#multiplicity = sentinels.map((sentinel) => count(glslText, sentinel));
        this.#coordsMultiplicity = currentSentinels.map((sentinel) => count(coordsText, sentinel));

        sentinels.forEach((_, i) => {
            if (this.#multiplicity[i] + (this.#coordsMultiplicity[i] ?? 0) === 0) {
                throw new Error(`Operator "${name}": input "${this.inputNames[i]}" is never used`);
            }
        });
    }

    get arity(): number {
        return this.inputNames.length;
    }

    get isTerminal(): boolean {
        return this.arity === 0;
    }

    get hasInner(): boolean {
        return this.arity > this.currentCount;
    }

    scopeOf(index: number): 'current' | 'inner' {
        return index < this.currentCount ? 'current' : 'inner';
    }

    /** Times input `index` is written in `glsl`. */
    multiplicity(index: number): number {
        return this.#multiplicity[index];
    }

    /** Times current input `index` is written in `coords`. */
    coordsMultiplicity(index: number): number {
        return this.#coordsMultiplicity[index] ?? 0;
    }

    glsl(inputs: readonly string[], params: readonly number[], p: string): string {
        return this.#spec.glsl({
            p,
            args: zip(this.inputNames, inputs),
            params: zip(this.#paramNames(), params),
        });
    }

    /** `current` inputs only. */
    coords(inputs: readonly string[], params: readonly number[], p: string): string {
        if (!this.#spec.coords) {
            throw new Error(`Operator "${this.name}" has no coords`);
        }

        return this.#spec.coords({
            p,
            args: zip(this.inputNames.slice(0, this.currentCount), inputs),
            params: zip(this.#paramNames(), params),
        });
    }

    #paramNames(): string[] {
        return this.params.map((param) => param.name);
    }
}
