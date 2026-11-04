import type { ColorSpaceId } from '@repo/randomart-core/colors';
import { COLOR_SPACE_IDS, colorSpaces } from '@repo/randomart-core/colors';
import { isOnlyNonTerminal, isOnlyTerminal, weightOf } from '@repo/randomart-core/grammar';
import { OP_NAMES, ops } from '@repo/randomart-core/ops';
import type { OpName } from '@repo/randomart-core/ops';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Grid } from '@repo/ui/components/Grid';
import { Segmented } from '@repo/ui/components/Segmented';
import { Slider } from '@repo/ui/components/Slider';
import { TextInput } from '@repo/ui/components/TextInput';

import { MAX_SEED, createSeed } from '../../seeds';
import {
    resetSeed,
    setActionError,
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
 * Parses a raw seed input into a valid seed number, or null when the input is invalid (empty,
 * non-numeric, non-integer, or out of range). Invalid input is reported through the store instead
 * of throwing, per the throw-vs-repair policy.
 */
function parseSeedInput(value: string): number | null {
    const trimmed = value.trim();
    if (trimmed === '') {
        return null;
    }

    const numeric = Number(trimmed);
    if (!Number.isInteger(numeric) || numeric < 0 || numeric > MAX_SEED) {
        return null;
    }

    return numeric;
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
                <TextInput
                    aria-label="seed"
                    title={`an integer in [0, ${MAX_SEED}]`}
                    value={String(seed)}
                    onValueChange={(value) => {
                        const numeric = parseSeedInput(value);
                        if (numeric === null) {
                            setActionError(
                                `Invalid seed "${value}": must be an integer in [0, ${MAX_SEED}].`,
                            );
                            return;
                        }
                        resetSeed(createSeed(numeric));
                    }}
                />
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
