import { Grid } from '@repo/ui/components/Grid';
import { Select } from '@repo/ui/components/Select';
import { Slider } from '@repo/ui/components/Slider';
import { TextInput } from '@repo/ui/components/TextInput';

import { allRules } from '../../engine/rules/registry';
import { setSeed, setSequenceRule, setSequenceSteps } from '../../stores/sequence/actions';
import { useSeed, useSequenceRule, useSequenceSteps } from '../../stores/sequence/selectors';

export function SequenceSection() {
    const sequenceRule = useSequenceRule();
    const steps = useSequenceSteps();
    const seed = useSeed();

    return (
        <Grid columns="1" gap="6">
            <Select
                value={sequenceRule.id}
                onValueChange={(val) => {
                    const selectedRule = allRules.find((rule) => rule.id === val);

                    if (selectedRule) {
                        setSequenceRule({
                            sequenceRule: selectedRule,
                        });
                    }
                }}
                options={allRules.map((rule) => ({
                    label: rule.name,
                    value: rule.id,
                }))}
            />
            <Slider
                label="Steps"
                value={steps}
                min={1}
                max={sequenceRule.maxSteps}
                step={1}
                onValueChange={(value) => {
                    setSequenceSteps({ steps: value });
                }}
            />
            <TextInput
                label="Seed"
                value={seed}
                onValueChange={(value) => {
                    setSeed(value);
                }}
            />
        </Grid>
    );
}
