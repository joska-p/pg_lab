import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { getBehaviorKinds } from '../../core';
import { toggleBehavior } from '../../stores/randomart/actions';
import { useActiveBehaviorIds } from '../../stores/randomart/selectors';

const BEHAVIOR_KINDS = getBehaviorKinds();

const styles = stylex.create({
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: space['2'],
    },
});

function BehaviorControls() {
    const activeBehaviorIds = useActiveBehaviorIds();

    return (
        <ControlSection title="Behaviors">
            {BEHAVIOR_KINDS.map((kind) => (
                <div key={kind.label} {...stylex.props(styles.grid)}>
                    {kind.behaviors.map((behavior) => {
                        const isActive = activeBehaviorIds.includes(behavior.id);

                        return (
                            <Button
                                key={behavior.id}
                                color={isActive ? 'aurora' : 'neutral'}
                                onClick={() => {
                                    toggleBehavior(behavior.id);
                                }}
                            >
                                {behavior.label}
                            </Button>
                        );
                    })}
                </div>
            ))}
        </ControlSection>
    );
}

export { BehaviorControls };
