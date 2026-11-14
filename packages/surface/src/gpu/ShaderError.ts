/** `vertex` / `fragment`: compilation stage failure; `link`: link stage failure. */
export type ShaderStage = 'vertex' | 'fragment' | 'link';

const MAX_LOG_LENGTH = 4000;

/**
 * GPU driver refusal (compile or link). Expected for user-generated shaders — not a bug. Callers
 * can treat this as a value. Still an `Error` so catch-all handlers work.
 */
export class ShaderError extends Error {
    readonly stage: ShaderStage;
    /** Raw driver log (truncated). */
    readonly log: string;

    constructor(stage: ShaderStage, log: string) {
        const truncated = log.slice(0, MAX_LOG_LENGTH);
        const verb = stage === 'link' ? 'link' : 'compile';

        super(`Surface: shader "${stage}" ${verb} failed: ${truncated}`);
        this.name = 'ShaderError';
        this.stage = stage;
        this.log = truncated;
    }
}
