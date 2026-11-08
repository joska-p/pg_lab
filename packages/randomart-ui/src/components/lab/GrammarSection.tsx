import type { ColorSpaceId } from '@repo/randomart-core/colors';
import { COLOR_SPACES } from '@repo/randomart-core/colors';
import {
    MAX_WEIGHT,
    isMonoGrammar,
    isOnlyNonTerminal,
    isOnlyTerminal,
    maxFeasibleMinDepth,
    minimumNodes,
    weightOf,
} from '@repo/randomart-core/grammar';
import { OP_NAMES, isTerminal, groupOf } from '@repo/randomart-core/ops';
import type { OpFamily, OpName } from '@repo/randomart-core/ops';
import { MAX_SEED_LENGTH, parseSeed } from '@repo/randomart-core/seed';
import type { Seed } from '@repo/randomart-core/seed';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Grid } from '@repo/ui/components/Grid';
import { Segmented } from '@repo/ui/components/Segmented';
import { Slider } from '@repo/ui/components/Slider';
import { TextInput } from '@repo/ui/components/TextInput';
import { useState } from 'react';

import {
    withMaxDepth,
    withMaxNodes,
    withMinDepth,
    withShareDepth,
    withSpace,
    withWeight,
} from '../../artwork/grammarEdits';
import { editGrammar, newSeed, useGrammar, useSeed } from '../../stores/artworkStore';

const GROUP_LABELS = {
    terminal: 'terminals',
    arithmetic: 'arithmetic',
    trigonometry: 'trigonometry',
    logic: 'logic',
    transform: 'warp',
} as const satisfies Record<OpFamily, string>;

/** Display order of the operator groups. `GROUP_LABELS` guarantees every family has a label. */
const OP_FAMILIES = [
    'terminal',
    'arithmetic',
    'trigonometry',
    'logic',
    'transform',
] as const satisfies readonly OpFamily[];

const OPERATOR_GROUPS = OP_FAMILIES.map((family) => ({
    group: family,
    label: GROUP_LABELS[family],
    operators: OP_NAMES.filter((name) => groupOf(name) === family),
})).filter((bucket) => bucket.operators.length > 0);

const SPACE_OPTIONS = COLOR_SPACES.map(({ id, label }) => ({
    value: id,
    label,
}));

/** Slider bounds: keep every slider inside the feasible region of its grammar. */
const MAX_MIN_DEPTH = 8;
const MAX_MAX_DEPTH = 10;
const MAX_NODES = 100;

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

export function GrammarSection() {
    const grammar = useGrammar();
    const seed = useSeed();

    const mono = isMonoGrammar(grammar);

    function mustStayOn(name: OpName): boolean {
        return isTerminal(name) ? isOnlyTerminal(grammar, name) : isOnlyNonTerminal(grammar, name);
    }

    return (
        <Grid columns="1" gap="6">
            <ControlSection title="seed">
                <SeedInput key={seed} seed={seed} />
            </ControlSection>

            <ControlSection title="color">
                <Segmented<ColorSpaceId>
                    color="orange"
                    value={grammar.space}
                    options={SPACE_OPTIONS}
                    onValueChange={(space) => {
                        editGrammar((current) => withSpace(current, space));
                    }}
                />
            </ControlSection>

            {OPERATOR_GROUPS.map(({ group, label, operators }) => (
                <ControlSection key={group} title={label}>
                    <Grid columns="1" gap="2" justifyItem="stretch" alignItem="stretch">
                        {operators.map((name) => (
                            <Slider
                                color="orange"
                                key={name}
                                label={name}
                                value={weightOf(grammar, name)}
                                min={mustStayOn(name) ? 1 : 0}
                                max={MAX_WEIGHT}
                                onValueChange={(weight) => {
                                    editGrammar((current) => withWeight(current, name, weight));
                                }}
                            />
                        ))}
                    </Grid>
                </ControlSection>
            ))}

            <ControlSection title="structure">
                <Grid columns="1" gap="2">
                    <Slider
                        color="orange"
                        label="min depth"
                        value={grammar.minDepth}
                        min={1}
                        max={maxFeasibleMinDepth(grammar, MAX_MIN_DEPTH)}
                        onValueChange={(value) => {
                            editGrammar((current) => withMinDepth(current, value));
                        }}
                    />
                    <Slider
                        color="orange"
                        label="max depth"
                        value={grammar.maxDepth}
                        min={1}
                        max={MAX_MAX_DEPTH}
                        onValueChange={(value) => {
                            editGrammar((current) => withMaxDepth(current, value));
                        }}
                    />
                    <Slider
                        color="orange"
                        label="max nodes"
                        value={grammar.maxNodes}
                        min={minimumNodes(grammar)}
                        max={MAX_NODES}
                        onValueChange={(value) => {
                            editGrammar((current) => withMaxNodes(current, value));
                        }}
                    />
                    <Slider
                        color="orange"
                        label={mono ? 'share (mono)' : 'share'}
                        value={grammar.shareDepth}
                        min={0}
                        max={grammar.maxDepth}
                        onValueChange={(value) => {
                            editGrammar((current) => withShareDepth(current, value));
                        }}
                    />
                </Grid>
            </ControlSection>
        </Grid>
    );
}
