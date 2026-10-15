import { formatNumber } from './key.ts';
import type { Node } from './types.ts';

/** One-line label of a node alone: `sin`, `const(0.3)`. No knowledge of specific operators. */
export function formatNodeLabel(node: Node): string {
    if (node.params.length === 0) {
        return node.op;
    }

    return `${node.op}(${node.params.map(formatNumber).join(', ')})`;
}

/**
 * Automatic functional notation built from operator names: `add(sin(x), const(0.3))`. Parameters
 * come before inputs. Below `maxDepth` levels, a non-terminal is elided as `op(…)`; terminals are
 * always shown in full.
 */
export function formatFormula(node: Node, maxDepth: number = Number.POSITIVE_INFINITY): string {
    if (node.inputs.length === 0) {
        return formatNodeLabel(node);
    }

    if (maxDepth <= 0) {
        return `${node.op}(…)`;
    }

    const args = [
        ...node.params.map(formatNumber),
        ...node.inputs.map((child) => formatFormula(child, maxDepth - 1)),
    ];

    return `${node.op}(${args.join(', ')})`;
}
