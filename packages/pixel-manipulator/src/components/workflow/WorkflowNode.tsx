import type { ArgDefinition } from '@repo/pixel/processor';
import { Slider } from '@repo/ui/components/Slider';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';

import { updateStepOptions } from '../../stores/manipulator/actions';
import type { WorkflowStep } from '../../stores/manipulator/types';
import { WorkflowNodeControls } from './WorkflowNodeControls';

interface WorkflowNodeProps {
    step: WorkflowStep;
    index: number;
    name: string;
    argDefinitions: readonly ArgDefinition[];
}

const styles = stylex.create({
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
    },
    title: {
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
    },
    label: {
        fontSize: typography.fontSizeSm,
    },
});

function getNumberOption(options: Record<string, unknown>, key: string, fallback: number): number {
    const value = options[key];

    return typeof value === 'number' ? value : fallback;
}

function WorkflowNode({ step, index, name, argDefinitions }: WorkflowNodeProps) {
    return (
        <div {...stylex.props(styles.card)}>
            <h4 {...stylex.props(styles.title)}>{name}</h4>
            <WorkflowNodeControls index={index} />
            {argDefinitions.map((def) => (
                <div key={def.key} {...stylex.props(styles.field)}>
                    <span {...stylex.props(styles.label)}>{def.label}</span>
                    <Slider
                        value={getNumberOption(step.options, def.key, def.min)}
                        min={def.min}
                        max={def.max}
                        step={def.step}
                        onValueChange={(value) => {
                            updateStepOptions(index, { [def.key]: value });
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

export { WorkflowNode };
export type { WorkflowNodeProps };
