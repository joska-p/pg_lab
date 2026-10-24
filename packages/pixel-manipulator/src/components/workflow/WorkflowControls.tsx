import { getManipulations } from '@repo/pixel/worker';
import { ControlSection } from '@repo/ui/components/ControlSection';

import { useWorkflowSteps } from '../../stores/manipulator/selectors';
import { EmptyState } from '../shared/EmptyState';
import { WorkEmptyStateSvg } from './WorkEmptyStateSvg';
import { WorkflowNode } from './WorkflowNode';

function WorkflowControls() {
    const steps = useWorkflowSteps();

    if (steps.length === 0) {
        return (
            <ControlSection title="workflow empty">
                <EmptyState
                    message="Add manipulations to build your pipeline"
                    icon={<WorkEmptyStateSvg />}
                />
            </ControlSection>
        );
    }

    return (
        <ControlSection title="workflow">
            {steps.map((step, index) => {
                const manip = getManipulations()[step.id];

                return (
                    <WorkflowNode
                        key={step.uid}
                        step={step}
                        index={index}
                        name={manip.name}
                        argDefinitions={manip.argDefinitions}
                    />
                );
            })}
        </ControlSection>
    );
}

export { WorkflowControls };
