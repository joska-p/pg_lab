interface Rule<TId extends string = string> {
    readonly id: TId;
    readonly name: string;
    readonly stateCount: number;
    readonly birth: readonly boolean[];
    readonly survive: readonly boolean[];
}

interface ParseRuleProps<TId extends string> {
    readonly id: TId;
    readonly name: string;
    readonly notation: string; // e.g., 'B2/S34/C8' or 'B3/S23'
}

function parseRule<const TId extends string>({
    id,
    name,
    notation,
}: ParseRuleProps<TId>): Rule<TId> {
    const birth = Array<boolean>(9).fill(false);
    const survive = Array<boolean>(9).fill(false);

    // Split by slash: e.g. ['B2', 'S34', 'C8']
    const parts = notation.toUpperCase().split('/');
    const bPart = parts.find((p) => p.startsWith('B'))?.replace('B', '') ?? '';
    const sPart = parts.find((p) => p.startsWith('S'))?.replace('S', '') ?? '';
    const cPart = parts.find((p) => p.startsWith('C'))?.replace('C', '') ?? '2';

    for (const ch of bPart) {
        birth[Number(ch)] = true;
    }

    for (const ch of sPart) {
        survive[Number(ch)] = true;
    }

    return {
        id,
        name,
        stateCount: Math.max(2, Number(cPart)),
        birth,
        survive,
    };
}

const conwayRule = parseRule({ id: 'conway', name: "Conway's Game of Life", notation: 'B3/S23' });
const starWars = parseRule({ id: 'star-wars', name: 'Star Wars', notation: 'B2/S345/C4' });
const transburst = parseRule({ id: 'transburst', name: 'Transburst', notation: 'B25/S23/C12' });
const seeds = parseRule({ id: 'seeds', name: 'Seeds', notation: 'B2/S' });
const dayAndNight = parseRule({ id: 'day-night', name: 'Day & Night', notation: 'B3678/S34678' });

const allRules = [conwayRule, starWars, transburst, seeds, dayAndNight] as const;

type RuleId = (typeof allRules)[number]['id'];

const rules = allRules.reduce(
    (acc, rule) => {
        acc[rule.id] = rule;

        return acc;
    },
    {} as Record<RuleId, Rule<RuleId>>,
);

export { allRules, rules };
export type { Rule, RuleId };
