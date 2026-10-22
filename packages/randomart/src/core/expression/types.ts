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

// ---------------------------------------------------------------------------
// Serialization DTOs (plain JSON representations)
// ---------------------------------------------------------------------------

/** Plain JSON form of a node: `op` first, then optional `params` and `in` when non-empty. */
export interface NodeData {
    readonly op: string;
    readonly params?: readonly number[];
    readonly in?: readonly NodeData[];
}

export interface ExpressionData {
    readonly r: NodeData;
    readonly g: NodeData;
    readonly b: NodeData;
}
