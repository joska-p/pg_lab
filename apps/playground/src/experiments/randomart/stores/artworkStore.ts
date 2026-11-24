import type { ColorSpaceId } from '@repo/randomart-core/colors';
import { drawGrammar, getGrammarPreset, grammarKey } from '@repo/randomart-core/grammar';
import type { Grammar, GrammarPreset } from '@repo/randomart-core/grammar';
import { createRng } from '@repo/randomart-core/rng';
import { createSeed } from '@repo/randomart-core/seed';
import type { Seed } from '@repo/randomart-core/seed';
import { create } from 'zustand';

import { buildArtwork, draftOf, isSameDraft, recompileArtwork } from '../artwork/artwork';
import type { Artwork } from '../artwork/artwork';
import { createBatcher } from '../artwork/batcher';
import { resolveIntents } from '../artwork/intents';
import type { Intent } from '../artwork/intents';
import { randomSeed } from '../randomSeed';
import { clearActionError, reportErrors } from './errorStore';

interface ArtworkState {
    readonly artwork: Artwork;
}

const DEFAULT_PRESET = getGrammarPreset('default');

const store = create<ArtworkState>(() => ({
    artwork: buildArtwork(DEFAULT_PRESET.grammar, createSeed('42'), DEFAULT_PRESET.space),
}));

/**
 * Resolve a frame's worth of intents, then generate and compile once. A failed producer is reported
 * and skipped; a failed build leaves the previous artwork in place.
 */
function flush(intents: readonly Intent[]): void {
    const { artwork } = store.getState();
    const { draft, errors } = resolveIntents(draftOf(artwork), intents);
    reportErrors(errors);

    if (draft === null) {
        return;
    }

    if (isSameDraft(draft, draftOf(artwork))) {
        if (errors.length === 0) {
            clearActionError();
        }
        return;
    }

    try {
        // A space-only change keeps the expression: generation depends only on (grammar, seed).
        const sameExpression =
            draft.seed === artwork.seed &&
            grammarKey(draft.grammar) === grammarKey(artwork.grammar);

        store.setState({
            artwork: sameExpression
                ? recompileArtwork(artwork, draft.space)
                : buildArtwork(draft.grammar, draft.seed, draft.space),
        });
        if (errors.length === 0) {
            clearActionError();
        }
    } catch (error) {
        reportErrors([...errors, error]);
    }
}

const enqueue = createBatcher<Intent>((run) => {
    requestAnimationFrame(run);
}, flush);

// ── selectors: the artwork is the single source of truth ───────────────────────────────────────
export function useIsAnimated(): boolean {
    return store((state) => state.artwork.shader.animated);
}

export function useSeed(): Seed {
    return store((state) => state.artwork.seed);
}

export function useGrammar(): Grammar {
    return store((state) => state.artwork.grammar);
}

export function useSpace(): ColorSpaceId {
    return store((state) => state.artwork.space);
}

export function useExpression() {
    return store((state) => state.artwork.expression);
}

export function useCompiledShader() {
    return store((state) => state.artwork.shader);
}

// ── commands: each one is a producer evaluated against the latest draft ────────────────────────
export function newSeed(seed: Seed = randomSeed()): void {
    enqueue((draft) => ({ ...draft, seed }));
}

export function applyPreset(preset: GrammarPreset): void {
    enqueue((draft) => ({ ...draft, grammar: preset.grammar, space: preset.space }));
}

export function setSpace(space: ColorSpaceId): void {
    enqueue((draft) => ({ ...draft, space }));
}

export function randomizeGrammar(): void {
    // Drawn now, so the producer itself stays deterministic. The current space is kept.
    const rngSeed = randomSeed();
    enqueue((draft) => ({ ...draft, grammar: drawGrammar(createRng(rngSeed)) }));
}

export function editGrammar(change: (grammar: Grammar) => Grammar): void {
    enqueue((draft) => ({ ...draft, grammar: change(draft.grammar) }));
}
