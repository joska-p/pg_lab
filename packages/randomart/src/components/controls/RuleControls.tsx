import { Checkbox } from '@repo/ui/components/Checkbox';
import { Select } from '@repo/ui/components/Select';
import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { listRuleGroups } from '../../core';
import { selectRule, setCorrelatedRGB } from '../../stores/randomart/actions';
import { useCorrelatedRGB, useSelectedRuleId } from '../../stores/randomart/selectors';

const RULE_OPTIONS = listRuleGroups().flatMap((group) =>
    group.rules.map((rule) => ({
        label: `${group.label}: ${rule.label}`,
        value: rule.id,
    })),
);

const styles = stylex.create({
    row: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        alignItems: 'end',
        gap: space['2'],
    },
    select: {
        gridColumn: 'span 2',
    },
});

function RuleControls() {
    const selectedRuleId = useSelectedRuleId();
    const correlatedRGB = useCorrelatedRGB();

    return (
        <div {...stylex.props(styles.row)}>
            <Checkbox label="linked" checked={correlatedRGB} onCheckedChange={setCorrelatedRGB} />

            <Select
                value={selectedRuleId}
                onValueChange={selectRule}
                options={RULE_OPTIONS}
                style={styles.select}
            />
        </div>
    );
}

export { RuleControls };
