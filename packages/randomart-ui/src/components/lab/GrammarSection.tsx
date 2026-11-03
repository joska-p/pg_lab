import type { ColorSpaceId } from '@repo/randomart-vm/color/registry';
import { colorSpaceIds, colorSpaceRegistry } from '@repo/randomart-vm/color/registry';
import {
    constraintsOf,
    isLastNonTerminal,
    isLastTerminal,
    weightOf,
} from '@repo/randomart-vm/grammar/grammar';
import { SIZE_PROFILE_IDS } from '@repo/randomart-vm/grammar/quantized';
import { grammarRegistry, presetOf } from '@repo/randomart-vm/grammar/registry';
import type { GrammarRegistryId } from '@repo/randomart-vm/grammar/registry';
import type { IsaOperator } from '@repo/randomart-vm/isa/types';
import { createSeed } from '@repo/randomart-vm/rng/seed';
import { vm } from '@repo/randomart-vm/vm/vm';
import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { Segmented } from '@repo/ui/components/Segmented';
import { Select } from '@repo/ui/components/Select';
import { Slider } from '@repo/ui/components/Slider';
import { TextInput } from '@repo/ui/components/TextInput';

import {
    applyGrammar,
    drawGrammar,
    resetSeed,
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

const GROUP_LABELS: Record<IsaOperator['group'], string> = {
    terminal: 'terminals',
    arithmetic: 'arithmetic',
    trigonometry: 'trigonometry',
    logic: 'logic',
    transform: 'warp',
};

const OPERATOR_GROUPS = (Object.keys(GROUP_LABELS) as IsaOperator['group'][])
    .map((group) => ({
        group,
        label: GROUP_LABELS[group],
        operators: vm.catalog.operators().filter((operator) => operator.group === group),
    }))
    .filter((bucket) => bucket.operators.length > 0);

const SPACE_OPTIONS = colorSpaceIds.map((id) => ({
    value: id,
    label: colorSpaceRegistry[id].label,
}));

export function GrammarSection() {
    const grammar = useGrammar();
    const seed = useSeed();
    const maxWeight = useMaxWeight();

    const presetId = presetOf(grammar);
    const preset = presetId ? grammarRegistry[presetId] : CUSTOM_PRESET;

    const maxShareDepth = constraintsOf(grammar.size).maxDepth;
    const mono = grammar.shareDepth >= maxShareDepth;

    function mustStayOn(operator: IsaOperator): boolean {
        return operator.isTerminal
            ? isLastTerminal(grammar.weights, operator.name)
            : isLastNonTerminal(grammar.weights, operator.name);
    }

    return (
        <Grid columns="1" gap="3" justifyItem="stretch" alignItem="stretch">
            <Grid columns="2" gap="2">
                <TextInput
                    title="type a seed number"
                    value={String(seed)}
                    onValueChange={(value) => {
                        resetSeed(createSeed(Number(value)));
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
                        {operators.map((operator) => (
                            <Slider
                                color="orange"
                                key={operator.name}
                                label={operator.name}
                                value={weightOf(grammar.weights, operator.name)}
                                min={mustStayOn(operator) ? 1 : 0}
                                max={maxWeight}
                                onValueChange={(weight) => {
                                    setGrammarWeight(operator.name, weight);
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
