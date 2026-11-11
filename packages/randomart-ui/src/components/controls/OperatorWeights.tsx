import {
    MAX_WEIGHT,
    isOnlyNonTerminal,
    isOnlyTerminal,
    weightOf,
} from '@repo/randomart-core/grammar';
import { OP_NAMES, groupOf, isTerminal } from '@repo/randomart-core/ops';
import type { OpFamily, OpName } from '@repo/randomart-core/ops';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Grid } from '@repo/ui/components/Grid';
import { Slider } from '@repo/ui/components/Slider';

import { withWeight } from '../../artwork/grammarEdits';
import { editGrammar, useGrammar } from '../../stores/artworkStore';

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

/** Fine control: per-operator weight sliders, grouped by family. */
export function OperatorWeights() {
    const grammar = useGrammar();

    function mustStayOn(name: OpName): boolean {
        return isTerminal(name) ? isOnlyTerminal(grammar, name) : isOnlyNonTerminal(grammar, name);
    }

    return (
        <>
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
        </>
    );
}
