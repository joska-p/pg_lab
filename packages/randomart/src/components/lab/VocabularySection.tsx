import { Checkbox } from '@repo/ui/components/Checkbox';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { NumberField } from '@repo/ui/components/NumberField';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';

import type { Operator, OperatorGroup } from '../../core/catalog/index.ts';
import { MAX_WEIGHT, weightOf } from '../../core/grammar/index.ts';
import { setOperatorWeight, useGrammar } from '../../stores/appStore';
import { catalog } from '../../stores/catalogueStore.ts';

const GROUP_ORDER: readonly OperatorGroup[] = [
    'terminal',
    'arithmetic',
    'trigonometry',
    'logic',
    'transform',
];

const GROUP_LABELS: Record<OperatorGroup, string> = {
    terminal: 'Terminals',
    arithmetic: 'Arithmetic',
    trigonometry: 'Trigonometry',
    logic: 'Logic',
    transform: 'Transforms',
};

/** One row, one operator: checkbox and weight are the same state (weight 0 = off). */
function OperatorRow({
    operator,
    weight,
}: {
    readonly operator: Operator;
    readonly weight: number;
}) {
    const enabled = weight > 0;

    return (
        <Stack direction="horizontal" gap="2" justify="between">
            <Checkbox
                label={operator.name}
                checked={enabled}
                onCheckedChange={(checked) => {
                    setOperatorWeight(operator.name, checked ? 1 : 0);
                }}
            />
            <NumberField
                min={0}
                max={MAX_WEIGHT}
                step={0.1}
                value={weight}
                disabled={!enabled}
                onValueChange={(value) => {
                    setOperatorWeight(operator.name, value);
                }}
            />
        </Stack>
    );
}

/** The vocabulary workshop: manual operator selection and relative weights. */
export function VocabularySection() {
    const grammar = useGrammar();

    return (
        <ControlSection title="vocabulary">
            {GROUP_ORDER.map((group) => {
                const operators = catalog
                    .operators()
                    .filter((operator) => operator.group === group);

                if (operators.length === 0) {
                    return null;
                }

                return (
                    <>
                        <Text variant="muted">{GROUP_LABELS[group]}</Text>
                        {operators.map((operator) => (
                            <OperatorRow
                                key={operator.name}
                                operator={operator}
                                weight={weightOf(grammar.weights, operator.name)}
                            />
                        ))}
                    </>
                );
            })}
        </ControlSection>
    );
}
