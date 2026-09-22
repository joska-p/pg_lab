import { createCssColor } from '@repo/glaze/core/render';
import { ColorField } from '@repo/ui/components/ColorField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Select } from '@repo/ui/components/Select';

import { allRules, rules } from '../../engine/rules/registry';
import { setRule, setStateColor } from '../../stores/automa/actions';
import { useRuleId, useStateColors } from '../../stores/automa/selectors';

export function RuleSection() {
    const ruleId = useRuleId();
    const stateColors = useStateColors();
    const rule = rules[ruleId];

    return (
        <ControlSection title="Rule">
            <Select
                label="Rule"
                family="amber"
                value={ruleId}
                onValueChange={setRule}
                options={allRules.map((r) => ({
                    label: r.name,
                    value: r.id,
                }))}
            />
            {stateColors.slice(0, rule.stateCount).map((color, i) => (
                <ColorField
                    key={`stateColor-${String(i)}`}
                    label={`Age ${String(i)}`}
                    value={color}
                    onValueChange={(value) => {
                        setStateColor(i, createCssColor(value));
                    }}
                />
            ))}
        </ControlSection>
    );
}
