import type { Address, Channel, Expression, Node } from './types';

const CHANNELS: readonly Channel[] = ['r', 'g', 'b'];

type NodeVisitor = (node: Node, address: Address) => void;

/** `g.in[1].in[0]`: the channel, then each input index followed. Also usable as a stable key. */
export function formatAddress(address: Address): string {
    return `${address.channel}${address.path.map((index) => `.in[${index}]`).join('')}`;
}

/** Returns the addressed node; throws if the path leaves the tree. */
export function getNode(expression: Expression, address: Address): Node {
    let node: Node = expression[address.channel];

    for (const [step, index] of address.path.entries()) {
        const child: Node | undefined = node.inputs[index];

        if (child === undefined) {
            throw new Error(
                `Invalid address ${formatAddress(address)}: no input ${index} at step ${step + 1}`,
            );
        }

        node = child;
    }

    return node;
}

/**
 * Visits every node of every channel (r, then g, then b), parents before children, inputs in order.
 * A node shared in memory is visited once per occurrence: this walks the tree, not the graph.
 */
export function walk(expression: Expression, visitor: NodeVisitor): void {
    const visit = (node: Node, channel: Channel, path: readonly number[]): void => {
        visitor(node, { channel, path });

        node.inputs.forEach((child, index) => {
            visit(child, channel, [...path, index]);
        });
    };

    for (const channel of CHANNELS) {
        visit(expression[channel], channel, []);
    }
}

export function usedOperators(expression: Expression): ReadonlySet<string> {
    const names = new Set<string>();

    walk(expression, (node) => {
        names.add(node.operatorName);
    });

    return names;
}
