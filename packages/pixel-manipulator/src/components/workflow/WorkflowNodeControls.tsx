import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';

import { moveWorkflowStep, removeWorkflowStep } from '../../stores/manipulator/actions';
import { useWorkflowSteps } from '../../stores/manipulator/selectors';

interface WorkflowNodeControlsProps {
    index: number;
}

function WorkflowNodeControls({ index }: WorkflowNodeControlsProps) {
    const steps = useWorkflowSteps();
    const isFirst = index === 0;
    const isLast = index === steps.length - 1;

    return (
        <Grid columns="3">
            <Button
                disabled={isFirst}
                onClick={() => {
                    moveWorkflowStep(index, -1);
                }}
                aria-label="Move up"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="m18 15-6-6-6 6" />
                </svg>
            </Button>
            <Button
                disabled={isLast}
                onClick={() => {
                    moveWorkflowStep(index, 1);
                }}
                aria-label="Move down"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </Button>
            <Button
                onClick={() => {
                    removeWorkflowStep(index);
                }}
                aria-label="Remove step"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </Button>
        </Grid>
    );
}

export { WorkflowNodeControls };
