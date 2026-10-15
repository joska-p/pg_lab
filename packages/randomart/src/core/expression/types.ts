import type { Brand } from '../shared/index.ts';

export type Channel = 'r' | 'g' | 'b';

export type Node = Brand<
    {
        readonly op: string;
        readonly params: readonly number[];
        readonly inputs: readonly Node[];
    },
    'Node'
>;

export type Expression = Brand<
    {
        readonly r: Node;
        readonly g: Node;
        readonly b: Node;
    },
    'Expression'
>;

/** Points at a node: a channel plus the input indices to follow from its root (`[]` = the root). */
export interface Address {
    readonly channel: Channel;
    readonly path: readonly number[];
}
