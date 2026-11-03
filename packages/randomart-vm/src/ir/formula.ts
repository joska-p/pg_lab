import type { Node } from './types';

/** Shortest JavaScript form that reads back exactly; `-0` is written `0`. */
export function formatNumber(value: number): string {
    return String(Object.is(value, -0) ? 0 : value);
}

/** One-line label of a node alone: `sin`, `const(0.3)`. No knowledge of specific operators. */
export function formatNodeLabel(node: Node): string {
    const name = node.op;
    if (node.params.length === 0) {
        return name;
    }

    return `${name}(${node.params.map(formatNumber).join(', ')})`;
}

/**
 * Automatic functional notation built from operator names: `add(sin(x), const(0.3))`. Parameters
 * come before inputs. Below `maxDepth` levels, a non-terminal is elided as `op(…)`; terminals are
 * always shown in full.
 */
export function formatFormula(node: Node, maxDepth: number = Number.POSITIVE_INFINITY): string {
    const name = node.op;
    if (node.inputs.length === 0) {
        return formatNodeLabel(node);
    }

    if (maxDepth <= 0) {
        return `${name}(…)`;
    }

    const args = [
        ...node.params.map(formatNumber),
        ...node.inputs.map((child) => formatFormula(child, maxDepth - 1)),
    ];

    return `${name}(${args.join(', ')})`;
}
