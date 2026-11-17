/**
 * The package has one failure mode: an input violates a documented invariant (unknown operator,
 * malformed expression, grammar without terminals, oversized shader). `RandomArtError` itself is
 * thrown for programming errors (invalid grammar options, malformed expression). Subclasses mark
 * failures that callers can recover from.
 */
export class RandomArtError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'RandomArtError';
    }
}

/** A grammar whose minimum tree size exceeds its node budget. Recoverable: draw another one. */
export class InfeasibleGrammarError extends RandomArtError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'InfeasibleGrammarError';
    }
}

/** `drawGrammar` found no feasible grammar for the given pins within its attempt budget. */
export class GrammarDrawError extends RandomArtError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'GrammarDrawError';
    }
}
