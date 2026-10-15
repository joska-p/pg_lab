import type { Node } from './types.ts';

/** Shortest JavaScript form that reads back exactly; `-0` is written `0`. */
export function formatNumber(value: number): string {
    return String(Object.is(value, -0) ? 0 : value);
}

// Nodes are frozen, so a key never goes stale; shared nodes are computed once.
const keyCache = new WeakMap<Node, string>();

/**
 * Canonical, deterministic key: `op[p1,p2](key1,key2,…)`, e.g. `add[](x[](),const[0.3]())`. Two
 * nodes have the same key if and only if they have the same operator, parameters and inputs. The
 * key says "same subtree" only: it carries no coordinate context (the compiler adds that).
 */
export function nodeKey(node: Node): string {
    const cached = keyCache.get(node);

    if (cached !== undefined) {
        return cached;
    }

    const params = node.params.map(formatNumber).join(',');
    const inputs = node.inputs.map(nodeKey).join(',');
    const key = `${node.op}[${params}](${inputs})`;

    keyCache.set(node, key);

    return key;
}

export function equals(a: Node, b: Node): boolean {
    return a === b || nodeKey(a) === nodeKey(b);
}
