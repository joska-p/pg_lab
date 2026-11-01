import type { Brand } from '../shared/brand';

export type SizeProfile = 'tiny' | 'small' | 'medium' | 'large';

export interface SizeConstraints {
    readonly minDepth: number;
    readonly maxDepth: number;
    readonly maxNodes: number;
}

export interface GrammarWeights {
    readonly [op: string]: number | undefined;
}

export type Grammar = Brand<
    {
        readonly id: string;
        readonly label: string;
        readonly description: string;
        readonly weights: GrammarWeights;
        readonly size: SizeProfile;
        readonly shareDepth: number;
        readonly space: string;
    },
    'Grammar'
>;

export interface GrammarData {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly weights: Record<string, number>;
    readonly size: SizeProfile;
    readonly shareDepth: number;
    readonly space: string;
}
