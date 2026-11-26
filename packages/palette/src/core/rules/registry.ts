import type { Rule } from '../types';
import { analogous } from './analogous';
import { complementary } from './complementary';
import { monochromatic } from './monochromatic';
import { triadic } from './triadic';

export const RULES = [
    triadic,
    analogous,
    complementary,
    monochromatic,
] as const satisfies readonly Rule[];

// Derive the types directly from the registry.
export type RuleDefinition = (typeof RULES)[number];
export type RulesId = RuleDefinition['id'];

const RulesById = new Map<string, RuleDefinition>(
    RULES.map((rule): [RulesId, RuleDefinition] => [rule.id, rule]),
);

export function getRule(id: string | undefined): RuleDefinition {
    return RulesById.get(id ?? '') ?? RULES[0];
}
