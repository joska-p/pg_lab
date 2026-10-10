import {
    divOp,
    greaterThanOp,
    ifOp,
    lessThanOp,
    mixOp,
    modOp,
    powOp,
    productOp,
    sumOp,
} from './combinators';
import { constOp, radialOp, randomOp, sweepOp, xOp, yOp } from './terminals';
import { absOp, cosOp, expOp, fractOp, logOp, oscOp, shiftOp, sinOp, sqrtOp } from './transforms';
import type { Operator, OperatorKind } from './types';

export type { EvalContext, Operator, OperatorKind } from './types';

export const OPERATORS = {
    x: xOp,
    y: yOp,
    const: constOp,
    random: randomOp,
    radial: radialOp,
    sweep: sweepOp,
    sin: sinOp,
    cos: cosOp,
    abs: absOp,
    sqrt: sqrtOp,
    exp: expOp,
    log: logOp,
    fract: fractOp,
    sum: sumOp,
    product: productOp,
    mod: modOp,
    pow: powOp,
    div: divOp,
    'less-than': lessThanOp,
    'greater-than': greaterThanOp,
    if: ifOp,
    mix: mixOp,
    osc: oscOp,
    shift: shiftOp,
} satisfies Record<string, Operator>;

export type OperatorId = keyof typeof OPERATORS;

export function getOperator(id: OperatorId): Operator {
    return OPERATORS[id];
}

const KIND_ORDER: OperatorKind[] = ['terminal', 'transform', 'combinator'];

const KIND_LABELS: Record<OperatorKind, string> = {
    terminal: 'Terminals',
    transform: 'Transforms',
    combinator: 'Combinators',
};

export interface OperatorGroup {
    label: string;
    operators: { id: OperatorId; label: string }[];
}

export function getOperatorKinds(): OperatorGroup[] {
    const grouped = new Map<OperatorKind, { id: OperatorId; label: string }[]>();

    for (const kind of KIND_ORDER) {
        grouped.set(kind, []);
    }

    for (const [id, op] of Object.entries(OPERATORS) as [OperatorId, Operator][]) {
        grouped.get(op.kind)!.push({ id, label: op.label });
    }

    return KIND_ORDER.map((cat) => ({
        label: KIND_LABELS[cat],
        operators: grouped.get(cat)!,
    }));
}
