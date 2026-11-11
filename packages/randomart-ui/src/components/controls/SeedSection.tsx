import { MAX_SEED_LENGTH, parseSeed } from '@repo/randomart-core/seed';
import type { Seed } from '@repo/randomart-core/seed';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { TextInput } from '@repo/ui/components/TextInput';
import { useState } from 'react';

import { newSeed, useSeed } from '../../stores/artworkStore';

/**
 * Seed input is a draft until the user leaves the field or presses Enter. Each keystroke used to
 * commit (and create an "entry"); now intermediate values stay local, so the field can be cleared
 * and retyped without an error or a commit.
 */
function SeedInput({ seed }: { readonly seed: Seed }) {
    const [draft, setDraft] = useState<string>(seed);
    const [error, setError] = useState<string | null>(null);

    function commit(): void {
        const parsed = parseSeed(draft);
        if (parsed === null) {
            setError(`Enter a non-empty seed of at most ${MAX_SEED_LENGTH} characters.`);
            return;
        }

        setError(null);
        if (parsed === seed) {
            setDraft(seed); // canonicalise the whitespace the user typed
            return;
        }
        newSeed(parsed);
    }

    return (
        <TextInput
            aria-label="seed"
            title={`any non-empty string of at most ${MAX_SEED_LENGTH} characters`}
            value={draft}
            invalid={error !== null}
            errorMessage={error ?? undefined}
            onValueChange={(value) => {
                setDraft(value);
                setError(null);
            }}
            onBlur={commit}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    event.currentTarget.blur();
                }
            }}
        />
    );
}

export function SeedSection() {
    const seed = useSeed();

    return (
        <ControlSection title="seed">
            <SeedInput key={seed} seed={seed} />
        </ControlSection>
    );
}
