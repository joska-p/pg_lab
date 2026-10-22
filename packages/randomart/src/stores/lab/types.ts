import type { ProvenanceCheck } from '../../core/artwork/types';
import type { Expression } from '../../core/expression/types';
import type { Grammar } from '../../core/grammar/types';
import type { Seed } from '../../core/random/types';

/** One explored state: replay from (grammar, seed); imported artworks keep expression as reference. */
export interface HistoryEntry {
    readonly id: number;
    readonly seed: Seed;
    readonly grammar: Grammar;
    readonly nodes: number;
    readonly expression?: Expression;
    readonly provenanceCheck?: ProvenanceCheck;
}
