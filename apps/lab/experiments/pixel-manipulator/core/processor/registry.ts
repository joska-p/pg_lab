import type { ManipulationDefinition } from './types';

export class Registry {
    private readonly manipulationsMap = new Map<string, ManipulationDefinition>();

    static from(definitions: readonly ManipulationDefinition[]) {
        const registry = new Registry();

        for (const definition of definitions) {
            registry.register(definition);
        }

        return registry;
    }

    register(definition: ManipulationDefinition) {
        if (!definition.id) {
            throw new Error(`[pixel] Manipulation must have a non-empty string identifier`);
        }

        if (definition.access === 'neighborhood' && definition.radius < 0) {
            throw new Error(
                `[pixel] Neighborhood manipulation "${definition.id}" must declare a non-negative radius`,
            );
        }

        if (this.manipulationsMap.has(definition.id)) {
            console.warn(`[pixel] Overwriting existing manipulation "${definition.id}"`);
        }

        this.manipulationsMap.set(definition.id, definition);
    }

    get(identifier: string) {
        const definition = this.manipulationsMap.get(identifier);

        if (!definition) {
            throw new Error(`[pixel] Manipulation "${identifier}" is not registered.`);
        }

        return definition;
    }
}
