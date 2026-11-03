import type { Brand } from '../shared/brand';

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

export interface NodeData {
    readonly op: string;
    readonly params?: readonly number[];
    readonly in?: readonly NodeData[];
}

export interface ExpressionData {
    readonly version: number;
    readonly r: NodeData;
    readonly g: NodeData;
    readonly b: NodeData;
}
