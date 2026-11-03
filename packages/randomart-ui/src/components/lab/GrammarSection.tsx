import type { ColorSpaceId } from '@repo/randomart-core/colors';
import { COLOR_SPACE_IDS, colorSpaces } from '@repo/randomart-core/colors';
import {
    SIZE_PROFILE_IDS,
    SIZE_PROFILES,
    grammarRegistry,
    isOnlyNonTerminal,
    isOnlyTerminal,
    presetOf,
    weightOf,
} from '@repo/randomart-core/grammar';
import type { GrammarRegistryId } from '@repo/randomart-core/grammar';
import { OP_NAMES, ops } from '@repo/randomart-core/ops';
import type { OpName } from '@repo/randomart-core/ops';
import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { Segmented } from '@repo/ui/components/Segmented';
import { Select } from '@repo/ui/components/Select';
import { Slider } from '@repo/ui/components/Slider';
import { TextInput } from '@repo/ui/components/TextInput';

import { MAX_SEED, createSeed } from '../../seeds';
import {
    applyGrammar,
    drawGrammar,
    resetSeed,
    setActionError,
    setGrammarShareDepth,
    setGrammarSize,
    setGrammarSpace,
    setGrammarWeight,
    useGrammar,
    useMaxWeight,
    useSeed,
} from '../../stores/vmStore';

const CUSTOM_PRESET = {
    id: 'custom',
    label: 'Custom',
    description: "'A grammar that is not one of the presets.'",
} as const;

type PresetOptionValue = GrammarRegistryId | typeof CUSTOM_PRESET.id;

const PRESET_OPTIONS: readonly { value: PresetOptionValue; label: string }[] = [
    ...(Object.keys(grammarRegistry) as GrammarRegistryId[]).map((id) => ({
        value: id,
        label: grammarRegistry[id].label,
    })),
    { value: CUSTOM_PRESET.id, label: CUSTOM_PRESET.label },
];

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

    const presetId = presetOf(grammar);
    const preset = presetId ? grammarRegistry[presetId] : CUSTOM_PRESET;

    const maxShareDepth = SIZE_PROFILES[grammar.size].maxDepth;
    const mono = grammar.shareDepth >= maxShareDepth;

    function mustStayOn(name: OpName): boolean {
        return ops[name].arity === 0
            ? isOnlyTerminal(grammar, name)
            : isOnlyNonTerminal(grammar, name);
    }

    return (
        <Grid columns="1" gap="3" justifyItem="stretch" alignItem="stretch">
            <Grid columns="2" gap="2">
                <TextInput
                    title="type a seed number"
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
                <Button
                    title="generate a new random seed"
                    color="solder"
                    onClick={() => {
                        resetSeed();
                    }}
                >
                    ⟳
                </Button>

                <Select<PresetOptionValue>
                    title={preset.description}
                    value={presetId ?? CUSTOM_PRESET.id}
                    options={PRESET_OPTIONS}
                    onValueChange={(id) => {
                        if (id === CUSTOM_PRESET.id) {
                            return;
                        }

                        applyGrammar(grammarRegistry[id]);
                    }}
                />

                <Button
                    title="generate a new random grammar"
                    color="orange"
                    onClick={() => {
                        drawGrammar();
                    }}
                >
                    ⟳
                </Button>
            </Grid>

            <Grid columns="1" gap="6">
                <Segmented<ColorSpaceId>
                    color="orange"
                    value={grammar.space as ColorSpaceId}
                    options={SPACE_OPTIONS}
                    onValueChange={setGrammarSpace}
                />

                {OPERATOR_GROUPS.map(({ group, operators }) => (
                    <Grid key={group} columns="1" gap="2" justifyItem="stretch" alignItem="stretch">
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
                ))}
            </Grid>

            <Slider
                color="orange"
                label="size"
                value={SIZE_PROFILE_IDS.indexOf(grammar.size)}
                min={0}
                max={SIZE_PROFILE_IDS.length - 1}
                onValueChange={(value) => setGrammarSize(SIZE_PROFILE_IDS[value])}
            />

            <Slider
                color="orange"
                label={mono ? 'share (mono)' : 'share'}
                value={grammar.shareDepth}
                min={0}
                max={maxShareDepth}
                onValueChange={setGrammarShareDepth}
            />
        </Grid>
    );
}
