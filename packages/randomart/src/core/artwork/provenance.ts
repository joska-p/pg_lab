import type { Catalog } from '../catalog/Catalog';
import { equals } from '../expression/key';
import type { Expression } from '../expression/types';
import { GENERATOR_VERSION, generate } from '../generator/generator';
import type { Artwork } from './types';

/**
 * - `none`: no provenance (nothing to check).
 * - `version-mismatch`: `generatorVersion` differs from the current one — the seed no longer replays;
 *   the expression keeps the reference.
 * - `matches` / `differs`: regenerate with `(grammar, seed)` and compare the `nodeKey` of the three
 *   channels.
 */
export type ProvenanceCheck = 'none' | 'matches' | 'differs' | 'version-mismatch';

function sameExpression(a: Expression, b: Expression): boolean {
    return equals(a.r, b.r) && equals(a.g, b.g) && equals(a.b, b.b);
}

/** Informs the UI ("regenerable" or "hand-edited"); the expression is never replaced by this. */
export function checkProvenance(catalog: Catalog, artwork: Artwork): ProvenanceCheck {
    const { provenance, expression } = artwork;

    if (!provenance) {
        return 'none';
    }

    if (provenance.generatorVersion !== GENERATOR_VERSION) {
        return 'version-mismatch';
    }

    const regenerated = generate(catalog, provenance.grammar, provenance.seed);

    return sameExpression(regenerated, expression) ? 'matches' : 'differs';
}
