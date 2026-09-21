import type { ShaderModule } from '../shaders/types';
import type { SeededRandom } from './seeded-random';

export function processArgs(mod: ShaderModule, rng: SeededRandom): Record<string, string> {
    const resolvedArgs: Record<string, string> = { uv: 'uv' };

    if (!mod.params) return resolvedArgs;

    for (const [paramName, rule] of Object.entries(mod.params)) {
        if (rule.type === 'global' || rule.type === 'literal') {
            resolvedArgs[paramName] = String(rule.value);
        } else {
            resolvedArgs[paramName] = rng.range(rule.min, rule.max, rule.precision ?? 3);
        }
    }

    return resolvedArgs;
}
