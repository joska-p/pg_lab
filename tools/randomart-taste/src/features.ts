import type { ColorSpaceId } from '@repo/randomart-core/colors';
import { lower } from '@repo/randomart-core/lower';
import type { LoweredVertex } from '@repo/randomart-core/lower';
import type { OpName } from '@repo/randomart-core/ops';
import { isMonoExpression, usesTime } from '@repo/randomart-core/tree';
import type { Expression, Node } from '@repo/randomart-core/tree';

/** Statistics over the modulated terminals (`x` / `y` with `amp > 0`); all zero when there are none. */
export interface ModulationStats {
    readonly count: number;
    readonly meanAmp: number;
    readonly meanCycles: number;
}

/**
 * What an expression is made of, independent of the grammar that drew it. Counts are taken on the
 * lowered DAG, so a subtree shared by the three channels (or reused inside one) counts once.
 */
export interface ExpressionFeatures {
    /** Only operators that occur are present, like `Grammar.weights`; read through `countOf`. */
    readonly operatorCounts: Readonly<Partial<Record<OpName, number>>>;
    /** Distinct vertices plus warp contexts after sharing identical subtrees. */
    readonly dagNodes: number;
    /** Node count of the largest channel tree: the quantity `Grammar.maxNodes` bounds. */
    readonly treeNodes: number;
    /** Depth of the deepest channel tree. */
    readonly depth: number;
    /** Realized share depth: levels from the root where r, g and b use the same operator. */
    readonly sharedDepth: number;
    readonly mono: boolean;
    readonly animated: boolean;
    readonly space: ColorSpaceId;
    readonly modulation: ModulationStats;
}

/** Occurrences of an operator in the DAG; absent operators count zero. */
export function countOf(features: ExpressionFeatures, name: OpName): number {
    return features.operatorCounts[name] ?? 0;
}

function depthOf(node: Node): number {
    return 1 + Math.max(0, ...node.inputs.map(depthOf));
}

function sizeOf(node: Node): number {
    return 1 + node.inputs.reduce((total, child) => total + sizeOf(child), 0);
}

function sameOperator(a: Node, b: Node): boolean {
    if (a.op !== b.op) {
        return false;
    }

    const names = Object.keys(a.params);

    if (names.length !== Object.keys(b.params).length) {
        return false;
    }

    return names.every((name) => a.params[name] === b.params[name]);
}

/**
 * Levels from the root where the three nodes agree on operator and parameters. A fully shared
 * branch (it ends on an identical terminal) is unbounded; the caller caps the result by the depth.
 */
function sharedDepthOf(r: Node, g: Node, b: Node): number {
    if (!sameOperator(r, g) || !sameOperator(g, b)) {
        return 0;
    }

    let shallowest = Number.POSITIVE_INFINITY;

    for (const [index, child] of r.inputs.entries()) {
        const green = g.inputs[index];
        const blue = b.inputs[index];

        if (green === undefined || blue === undefined) {
            return 1;
        }

        shallowest = Math.min(shallowest, sharedDepthOf(child, green, blue));
    }

    return 1 + shallowest;
}

function modulationOf(vertices: readonly LoweredVertex[]): ModulationStats {
    let count = 0;
    let ampTotal = 0;
    let cyclesTotal = 0;

    for (const vertex of vertices) {
        const amp = vertex.params.amp ?? 0;

        if ((vertex.op === 'x' || vertex.op === 'y') && amp > 0) {
            count++;
            ampTotal += amp;
            cyclesTotal += vertex.params.cycles ?? 1;
        }
    }

    if (count === 0) {
        return { count: 0, meanAmp: 0, meanCycles: 0 };
    }

    return { count, meanAmp: ampTotal / count, meanCycles: cyclesTotal / count };
}

/** Pure description of an expression, ready to be flattened into a regression row. */
export function featuresOf(expression: Expression, space: ColorSpaceId): ExpressionFeatures {
    const { steps } = lower(expression);
    const operatorCounts: Partial<Record<OpName, number>> = {};
    const vertices: LoweredVertex[] = [];

    for (const step of steps) {
        const node = step.kind === 'vertex' ? step.vertex : step.context;

        operatorCounts[node.op] = (operatorCounts[node.op] ?? 0) + 1;

        if (step.kind === 'vertex') {
            vertices.push(step.vertex);
        }
    }

    const { r, g, b } = expression;
    const depth = Math.max(depthOf(r), depthOf(g), depthOf(b));

    return {
        operatorCounts,
        dagNodes: steps.length,
        treeNodes: Math.max(sizeOf(r), sizeOf(g), sizeOf(b)),
        depth,
        sharedDepth: Math.min(sharedDepthOf(r, g, b), depth),
        mono: isMonoExpression(expression),
        animated: usesTime(expression),
        space,
        modulation: modulationOf(vertices),
    };
}
