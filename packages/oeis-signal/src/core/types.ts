export interface Budget {
    maxTerms: number;
}

export interface Signal {
    next(): IteratorResult<number>;

    take(count: number): number[];

    readonly produced: number;
}

export interface Module {
    readonly id: string;
    readonly name: string;
    readonly description: string;

    createSignal(budget: Budget): Signal;
}
