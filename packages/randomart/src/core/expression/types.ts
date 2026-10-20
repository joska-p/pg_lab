import type { Brand } from '../shared/shared';

export type Channel = 'r' | 'g' | 'b';

export type Node = Brand<
    {
        readonly operatorName: string;
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

/**
 * Points at a node: a channel plus the input indices to follow from its root (`[]` = the root).
 *
 * @lintignore
 */
export interface Address {
    readonly channel: Channel;
    readonly path: readonly number[];
}
