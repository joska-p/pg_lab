import type { OperatorId } from '../operators/registry';
import { classicRule, fatRule, flowRule, paperRule } from './rule-definitions';

/** Only `classic` for now — the union is ready for more. */
export type RuleKind = 'classic';

export interface Rule {
    readonly id: string;
    readonly label: string;
    readonly kind: RuleKind;
    readonly operatorIds: OperatorId[];
    readonly maxDepth: number;
    readonly minDepth: number;
}

export const RULES = {
    classic: classicRule,
    paper: paperRule,
    flow: flowRule,
    fat: fatRule,
} satisfies Record<string, Rule>;

export type RuleId = keyof typeof RULES;
export const ruleIds: RuleId[] = Object.keys(RULES) as RuleId[];

export const DEFAULT_RULE_ID: RuleId = 'classic';

export function listRules(): Rule[] {
    return Object.values(RULES);
}

export function getRule(id: RuleId): Rule {
    return RULES[id];
}

export function hasRule(id: RuleId): boolean {
    return id in RULES;
}

const RULE_KIND_ORDER: RuleKind[] = ['classic'];

const RULE_KIND_LABELS: Record<RuleKind, string> = {
    classic: 'Classic',
};

export interface RuleGroup {
    label: string;
    rules: { id: RuleId; label: string }[];
}

export function listRuleGroups(): RuleGroup[] {
    const grouped = new Map<RuleKind, { id: RuleId; label: string }[]>();

    for (const cat of RULE_KIND_ORDER) {
        grouped.set(cat, []);
    }

    for (const rule of Object.values(RULES)) {
        grouped.get(rule.kind)!.push({ id: rule.id, label: rule.label });
    }

    return RULE_KIND_ORDER.map((cat) => ({
        label: RULE_KIND_LABELS[cat],
        rules: grouped.get(cat)!,
    }));
}
