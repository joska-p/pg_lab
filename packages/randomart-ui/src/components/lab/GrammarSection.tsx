import type { ColorSpaceId } from '@repo/randomart-core/colors';
import { COLOR_SPACE_IDS, colorSpaces } from '@repo/randomart-core/colors';
import { isOnlyNonTerminal, isOnlyTerminal, weightOf } from '@repo/randomart-core/grammar';
import { OP_NAMES, ops } from '@repo/randomart-core/ops';
import type { OpName } from '@repo/randomart-core/ops';
import { MAX_SEED_LENGTH, parseSeed } from '@repo/randomart-core/seed';
import type { Seed } from '@repo/randomart-core/seed';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Grid } from '@repo/ui/components/Grid';
import { Segmented } from '@repo/ui/components/Segmented';
import { Slider } from '@repo/ui/components/Slider';
import { TextInput } from '@repo/ui/components/TextInput';
import { useState } from 'react';

import {
    resetSeed,
    setGrammarShareDepth,
    setGrammarSpace,
    setGrammarWeight,
    setGrammarMaxDepth,
    setGrammarMaxNodes,
    setGrammarMinDepth,
    useGrammar,
    useMaxWeight,
    useSeed,
} from '../../stores/randomartStore';

const GROUP_LABELS = {
    terminal: 'terminals',
    arithmetic: 'arithmetic',
    trigonometry: 'trigonometry',
    logic: 'logic',
    transform: 'warp',
} as const;

type OperatorGroup = keyof typeof GROUP_LABELS;

function groupOf(name: OpName): OperatorGroup {
    const { arity, family } = ops[name];
    return arity === 0 ? 'terminal' : (family ?? 'arithmetic');
}

const OPERATOR_GROUPS = (Object.keys(GROUP_LABELS) as OperatorGroup[])
    .map((group) => ({
        group,
        label: GROUP_LABELS[group],
        operators: OP_NAMES.filter((name) => groupOf(name) === group),
    }))
    .filter((bucket) => bucket.operators.length > 0);

const SPACE_OPTIONS = COLOR_SPACE_IDS.map((id) => ({
    value: id,
    label: colorSpaces[id].label,
}));

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
        resetSeed(parsed);
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
    const maxWeight = useMaxWeight();

    const mono = grammar.shareDepth >= grammar.maxDepth;

    function mustStayOn(name: OpName): boolean {
        return ops[name].arity === 0
            ? isOnlyTerminal(grammar, name)
            : isOnlyNonTerminal(grammar, name);
    }

    return (
        <Grid columns="1" gap="6">
            <ControlSection title="seed">
                <SeedInput key={seed} seed={seed} />
            </ControlSection>

            <ControlSection title="color">
                <Segmented<ColorSpaceId>
                    color="orange"
                    value={grammar.space as ColorSpaceId}
                    options={SPACE_OPTIONS}
                    onValueChange={setGrammarSpace}
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
                                max={maxWeight}
                                onValueChange={(weight) => {
                                    setGrammarWeight(name, weight);
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
                        max={8}
                        onValueChange={setGrammarMinDepth}
                    />
                    <Slider
                        color="orange"
                        label="max depth"
                        value={grammar.maxDepth}
                        min={1}
                        max={10}
                        onValueChange={setGrammarMaxDepth}
                    />
                    <Slider
                        color="orange"
                        label="max nodes"
                        value={grammar.maxNodes}
                        min={4}
                        max={100}
                        onValueChange={setGrammarMaxNodes}
                    />
                    <Slider
                        color="orange"
                        label={mono ? 'share (mono)' : 'share'}
                        value={grammar.shareDepth}
                        min={0}
                        max={grammar.maxDepth}
                        onValueChange={setGrammarShareDepth}
                    />
                </Grid>
            </ControlSection>
        </Grid>
    );
}
