/** `vertex` / `fragment` : échec de compilation d'un étage ; `link` : échec de l'édition de liens. */
export type ShaderStage = 'vertex' | 'fragment' | 'link';

/** Le journal du pilote peut être énorme sur un shader généré : on le tronque. */
const MAX_LOG_LENGTH = 4000;

/**
 * Refus du pilote GPU (compilation ou liaison). C'est un cas normal pour un shader généré, pas un
 * bug : les appelants peuvent le traiter comme une valeur via `catchShaderError`. Reste une
 * `Error`, donc le code qui attrapait déjà les exceptions continue de fonctionner.
 */
export class ShaderError extends Error {
    readonly stage: ShaderStage;
    /** Journal brut du pilote (tronqué). */
    readonly log: string;

    constructor(stage: ShaderStage, log: string) {
        const truncated = log.slice(0, MAX_LOG_LENGTH);
        const verb = stage === 'link' ? 'link' : 'compile';

        super(`Glaze: shader "${stage}" ${verb} failed: ${truncated}`);
        this.name = 'ShaderError';
        this.stage = stage;
        this.log = truncated;
    }
}

export type ShaderAttempt<T> = { ok: true; value: T } | { ok: false; error: ShaderError };

/**
 * Exécute `run` en n'attrapant que `ShaderError` : un vrai bug ou l'absence de WebGL continuent de
 * lever, pour ne jamais être masqués.
 */
export function catchShaderError<T>(run: () => T): ShaderAttempt<T> {
    try {
        return { ok: true, value: run() };
    } catch (error) {
        if (error instanceof ShaderError) {
            return { ok: false, error };
        }

        throw error;
    }
}
