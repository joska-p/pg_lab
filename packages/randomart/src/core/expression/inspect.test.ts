import { describe, expect, it } from 'vite-plus/test';

import { createDefaultCatalog } from '../catalog/Catalog';
import { generate } from '../generator/generator';
import { grammarRegistry } from '../grammar/registry';
import { createSeed } from '../random/seed';
import { createExpression, createNode, nodeCount } from './expression';
import { formatNodeLabel, formatFormula } from './formula';
import { equals, nodeKey } from './key';
import type { Channel, Expression, Node } from './types';

interface Address {
    readonly channel: Channel;
    readonly path: readonly number[];
}

const CHANNELS: readonly Channel[] = ['r', 'g', 'b'];

type NodeVisitor = (node: Node, address: Address) => void;

function formatAddress(address: Address): string {
    return `${address.channel}${address.path.map((index) => `.in[${index}]`).join('')}`;
}

function getNode(expression: Expression, address: Address): Node {
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

function walk(expression: Expression, visitor: NodeVisitor): void {
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

function usedOperators(expression: Expression): ReadonlySet<string> {
    const names = new Set<string>();

    walk(expression, (node) => {
        names.add(node.operatorName);
    });

    return names;
}

const catalog = createDefaultCatalog();
const x = createNode(catalog, 'x', [], [0, 0, 0]);
const y = createNode(catalog, 'y', [], [0, 0, 0]);
const c03 = createNode(catalog, 'const', [], [0.3]);

describe('nodeKey / equals', () => {
    it('writes the canonical form', () => {
        expect(nodeKey(createNode(catalog, 'add', [x, c03]))).toBe(
            'add[](x[0,0,0](),const[0.3]())',
        );
    });

    it('gives the same key to separately built, structurally equal nodes', () => {
        const a = createNode(catalog, 'sin', [createNode(catalog, 'x', [], [0, 0, 0])]);
        const b = createNode(catalog, 'sin', [createNode(catalog, 'x', [], [0, 0, 0])]);

        expect(a).not.toBe(b);
        expect(nodeKey(a)).toBe(nodeKey(b));
        expect(equals(a, b)).toBe(true);
    });

    it('changes with the operator, a parameter, or the input order', () => {
        const base = createNode(catalog, 'add', [x, y]);

        expect(equals(base, createNode(catalog, 'mul', [x, y]))).toBe(false);
        expect(equals(base, createNode(catalog, 'add', [y, x]))).toBe(false);
        expect(
            equals(
                createNode(catalog, 'const', [], [0.3]),
                createNode(catalog, 'const', [], [0.31]),
            ),
        ).toBe(false);
    });

    it('treats -0 and 0 as the same parameter', () => {
        expect(
            equals(createNode(catalog, 'const', [], [-0]), createNode(catalog, 'const', [], [0])),
        ).toBe(true);
    });
});

describe('addresses, walk, getNode', () => {
    // r = add(x, y)   g = sin(x)   b = const(0.3)
    const add = createNode(catalog, 'add', [x, y]);
    const sinX = createNode(catalog, 'sin', [x]);
    const expression = createExpression(add, sinX, c03);

    it('formats addresses', () => {
        expect(formatAddress({ channel: 'r', path: [] })).toBe('r');
        expect(formatAddress({ channel: 'g', path: [1, 0] })).toBe('g.in[1].in[0]');
    });

    it('walks parents before children, channel by channel', () => {
        const visited: string[] = [];

        walk(expression, (_node, address) => {
            visited.push(formatAddress(address));
        });

        expect(visited).toEqual(['r', 'r.in[0]', 'r.in[1]', 'g', 'g.in[0]', 'b']);
        expect(visited).toHaveLength(nodeCount(expression));
    });

    it('finds every walked node again with getNode', () => {
        const seed = createSeed(42);
        const generated = generate(grammarRegistry.default, seed);
        let count = 0;

        walk(generated, (node, address) => {
            count++;
            expect(getNode(generated, address)).toBe(node);
        });

        expect(count).toBe(nodeCount(generated));
    });

    it('throws on an address that leaves the tree', () => {
        const bad: Address = { channel: 'r', path: [5] };

        expect(() => getNode(expression, bad)).toThrow(/Invalid address r\.in\[5\]/);
        expect(() => getNode(expression, { channel: 'b', path: [0] })).toThrow(/Invalid address/);
    });

    it('collects the operators in use', () => {
        expect([...usedOperators(expression)].sort()).toEqual(['add', 'const', 'sin', 'x', 'y']);
    });
});

describe('formatFormula / formatNodeLabel', () => {
    const tree = createNode(catalog, 'add', [createNode(catalog, 'sin', [x]), c03]);

    it('writes automatic functional notation', () => {
        expect(formatFormula(tree)).toBe('add(sin(x(0, 0, 0)), const(0.3))');
    });

    it('elides non-terminals below maxDepth but keeps terminals', () => {
        expect(formatFormula(tree, 1)).toBe('add(sin(…), const(0.3))');
        expect(formatFormula(tree, 0)).toBe('add(…)');
    });

    it('labels a node alone', () => {
        expect(formatNodeLabel(x)).toBe('x(0, 0, 0)');
        expect(formatNodeLabel(c03)).toBe('const(0.3)');
        expect(formatNodeLabel(tree)).toBe('add');
    });
});
