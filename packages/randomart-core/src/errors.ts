/**
 * The package has one failure mode: an input violates a documented invariant (unknown operator,
 * malformed expression, grammar without terminals, oversized shader). A single error class keeps
 * `instanceof` checks meaningful for consumers.
 */
export class RandomArtError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'RandomArtError';
    }
}
