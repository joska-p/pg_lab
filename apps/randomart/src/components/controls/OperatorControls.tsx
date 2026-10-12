import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { DEFAULT_TERMINALS, getOperatorKinds, getRule } from '../../core';
import type { OperatorId } from '../../core';
import { toggleOperator } from '../../stores/randomart/actions';
import { useCustomOperators, useSelectedRuleId } from '../../stores/randomart/selectors';

const OPERATOR_KINDS = getOperatorKinds();
const TERMINAL_IDS: OperatorId[] = DEFAULT_TERMINALS.map((terminal) => terminal.type);

const styles = stylex.create({
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: space['2'],
    },
});

function OperatorControls() {
    const selectedRuleId = useSelectedRuleId();
    const customOperatorIds = useCustomOperators();
    const preset = getRule(selectedRuleId);
    const activeOperatorIds = customOperatorIds ?? preset.operatorIds;
    const activeTerminalCount = activeOperatorIds.filter((id) => TERMINAL_IDS.includes(id)).length;

    return (
        <ControlSection title="Operators">
            {OPERATOR_KINDS.map((kind) => (
                <div key={kind.label} {...stylex.props(styles.grid)}>
                    {kind.operators.map((operator) => {
                        const isActive = activeOperatorIds.includes(operator.id);
                        const isLastTerminal =
                            isActive &&
                            TERMINAL_IDS.includes(operator.id) &&
                            activeTerminalCount === 1;

                        return (
                            <Button
                                key={operator.id}
                                color={isActive ? 'aurora' : 'neutral'}
                                disabled={isLastTerminal}
                                onClick={() => {
                                    toggleOperator(operator.id);
                                }}
                            >
                                {operator.label}
                            </Button>
                        );
                    })}
                </div>
            ))}
        </ControlSection>
    );
}

export { OperatorControls };
