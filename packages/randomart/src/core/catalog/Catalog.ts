import { DEPENDENCIES } from './dependencies.ts';
import type { DependencySpec } from './dependencies.ts';
import { Operator } from './operators/Operator.ts';
import { OPERATOR_SPECS } from './operators/registry.ts';
import type { OperatorSpec } from './operators/types.ts';

export type ShaderDependency = DependencySpec & { readonly name: string };

/** A registry of operator specs and shader dependencies, keyed by name. */
export class Catalog {
    readonly #operators: ReadonlyMap<string, Operator>;
    readonly #dependencies: ReadonlyMap<string, ShaderDependency>;
    readonly #operatorList: readonly Operator[];
    readonly #terminalList: readonly Operator[];
    readonly #dependencyList: readonly ShaderDependency[];

    constructor(
        operators: Readonly<Record<string, OperatorSpec>>,
        dependencies: Readonly<Record<string, DependencySpec>>,
    ) {
        const operatorEntries: [string, Operator][] = Object.entries(operators).map(
            ([name, spec]) => [name, new Operator(name, spec)],
        );
        const dependencyEntries: [string, ShaderDependency][] = Object.entries(dependencies).map(
            ([name, spec]) => [name, { name, ...spec }],
        );

        this.#operators = new Map(operatorEntries);
        this.#dependencies = new Map(dependencyEntries);
        this.#operatorList = Object.freeze(operatorEntries.map(([, operator]) => operator));
        this.#terminalList = Object.freeze(
            this.#operatorList.filter((operator) => operator.isTerminal),
        );
        this.#dependencyList = Object.freeze(dependencyEntries.map(([, dependency]) => dependency));
    }

    operator(name: string): Operator {
        const found = this.#operators.get(name);

        if (!found) {
            throw new Error(`Unknown operator: "${name}"`);
        }

        return found;
    }

    operators(): readonly Operator[] {
        return this.#operatorList;
    }

    terminals(): readonly Operator[] {
        return this.#terminalList;
    }

    dependencies(): readonly ShaderDependency[] {
        return this.#dependencyList;
    }

    /** Transitive closure, dependencies first (GLSL needs declaration before use). */
    dependencyClosure(ids: readonly string[]): readonly ShaderDependency[] {
        const ordered: ShaderDependency[] = [];
        const done = new Set<string>();
        const path: string[] = [];

        const visit = (id: string): void => {
            if (done.has(id)) {
                return;
            }

            if (path.includes(id)) {
                throw new Error(
                    `Dependency cycle: ${[...path.slice(path.indexOf(id)), id].join(' → ')}`,
                );
            }

            const dependency = this.#dependencies.get(id);

            if (!dependency) {
                throw new Error(`Unknown dependency: "${id}"`);
            }

            path.push(id);

            if (dependency.kind === 'function') {
                dependency.requires?.forEach(visit);
            }

            path.pop();
            done.add(id);
            ordered.push(dependency);
        };

        ids.forEach(visit);

        return Object.freeze(ordered);
    }
}

export const createDefaultCatalog = (): Catalog => new Catalog(OPERATOR_SPECS, DEPENDENCIES);
