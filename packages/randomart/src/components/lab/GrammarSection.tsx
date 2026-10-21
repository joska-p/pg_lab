import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { Segmented } from '@repo/ui/components/Segmented';
import { Select } from '@repo/ui/components/Select';
import { Slider } from '@repo/ui/components/Slider';
import { TextInput } from '@repo/ui/components/TextInput';

import { catalog } from '../../core/catalog/default';
import type { Operator } from '../../core/catalog/operators/Operator';
import type { OperatorId } from '../../core/catalog/operators/registry';
import { COLOR_SPACE_IDS, COLOR_SPACES } from '../../core/color/color';
import { CONFIG } from '../../core/config/config';
import {
    constraintsOf,
    isLastNonTerminal,
    isLastTerminal,
    weightOf,
} from '../../core/grammar/grammar';
import { GRAMMAR_PRESETS, presetIdOf } from '../../core/grammar/presets';
import { SIZE_PROFILE_IDS } from '../../core/grammar/quantized';
import { createSeed } from '../../core/random/seed';
import {
    applyGrammar,
    drawGrammar,
    resetSeed,
    setGrammarShareDepth,
    setGrammarSize,
    setGrammarSpace,
    setGrammarWeight,
    useGrammar,
    useSeed,
} from '../../stores/lab/labStore';

const CUSTOM_PRESET = 'custom';
const PRESET_OPTIONS = [
    ...GRAMMAR_PRESETS.map((preset) => ({ value: preset.id, label: preset.label })),
    { value: CUSTOM_PRESET, label: 'Custom' },
];

/**
 * Display-only grouping: the model has no families, but a flat list of 17 sliders is unreadable.
 * The catalog's own `group` is reused here, so a new operator lands in the right section.
 */
const GROUP_LABELS: Record<Operator['group'], string> = {
    terminal: 'terminals',
    arithmetic: 'arithmetic',
    trigonometry: 'trigonometry',
    logic: 'logic',
    transform: 'warp',
};

const OPERATOR_GROUPS = (Object.keys(GROUP_LABELS) as Operator['group'][])
    .map((group) => ({
        group,
        label: GROUP_LABELS[group],
        operators: catalog.operators().filter((operator) => operator.group === group),
    }))
    .filter((bucket) => bucket.operators.length > 0);

const SPACE_OPTIONS = COLOR_SPACE_IDS.map((id) => ({ value: id, label: COLOR_SPACES[id].label }));

/**
 * The grammar workshop: one point of the quantized space — an integer weight per operator, a size
 * profile, a shared-trunk depth and a color space. A preset is a named grammar; the select reads
 * "Custom" as soon as a knob moves away from every preset. A slider whose zero would break a
 * structural invariant (the last terminal or the last non-terminal) starts at 1.
 */
export function GrammarSection() {
    const grammar = useGrammar();
    const seed = useSeed();

    const presetId = presetIdOf(grammar);
    const preset = GRAMMAR_PRESETS.find((candidate) => candidate.id === presetId);
    const maxShareDepth = constraintsOf(grammar.size).maxDepth;
    const mono = grammar.shareDepth >= maxShareDepth;

    function mustStayOn(operator: Operator): boolean {
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

                <Select
                    title={preset?.description ?? 'A grammar that is not one of the presets.'}
                    value={presetId ?? CUSTOM_PRESET}
                    options={PRESET_OPTIONS}
                    onValueChange={(id) => {
                        const chosen = GRAMMAR_PRESETS.find((candidate) => candidate.id === id);

                        if (chosen) {
                            applyGrammar(chosen.grammar);
                        }
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
                <Segmented
                    color="orange"
                    value={grammar.space}
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
                                max={CONFIG.grammar.maxWeight}
                                onValueChange={(weight) => {
                                    setGrammarWeight(operator.name as OperatorId, weight);
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
