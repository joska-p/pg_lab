export interface NextStepOptions {
    /** 1-based — the fixed initial 0 term is never passed in. */
    index: number;
    current: number;
    sequence: number[];
    seen: Set<number>;
    seed?: string;
}

export interface SequenceRule<TId extends string = string, TName extends string = string> {
    name: TName;
    id: TId;
    description: string;
    /** 0 = uncapped. */
    maxSteps: number;
    getNext: (options: NextStepOptions) => number;
}
