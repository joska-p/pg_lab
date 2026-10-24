import { getManipulations } from '@repo/pixel/worker';
import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Grid } from '@repo/ui/components/Grid';
import { Select } from '@repo/ui/components/Select';
import { useState } from 'react';

import { WORKFLOW_PRESETS } from '../../core/workflows/workflows';
import {
    addWorkflowStep,
    clearWorkflowSteps,
    executeWorkflow,
    setWorkflowSteps,
} from '../../stores/manipulator/actions';
import { useIsProcessing } from '../../stores/manipulator/selectors';
import { ImageSourceControls } from '../upload/ImageSourceControls';
import { WorkflowControls } from '../workflow/WorkflowControls';

function ControlsPanel() {
    const isProcessing = useIsProcessing();
    const [selectedManip, setSelectedManip] = useState(
        () => Object.keys(getManipulations())[0] ?? '',
    );

    const manipulationIds = Object.keys(getManipulations());
    const manipulationOptions = manipulationIds.map((id) => ({
        label: getManipulations()[id].name,
        value: id,
    }));

    return (
        <>
            <ImageSourceControls />
            <ControlSection title="presets">
                <Grid columns="2">
                    {WORKFLOW_PRESETS.map((preset) => (
                        <Button
                            key={preset.name}
                            onClick={() => {
                                setWorkflowSteps(
                                    preset.steps.map((step) => ({
                                        ...step,
                                        options: step.options ?? {},
                                        uid: crypto.randomUUID(),
                                    })),
                                );
                            }}
                        >
                            {preset.name}
                        </Button>
                    ))}
                </Grid>
            </ControlSection>

            <ControlSection title="manipulation">
                <Grid columns="2">
                    <Select
                        id="select-manip"
                        value={selectedManip}
                        onValueChange={(val) => {
                            setSelectedManip(val);
                        }}
                        options={manipulationOptions}
                    />

                    <Button
                        id="add-step"
                        onClick={() => {
                            addWorkflowStep(selectedManip);
                        }}
                    >
                        Add to Workflow
                    </Button>
                </Grid>
            </ControlSection>

            <WorkflowControls />

            <Grid columns="2">
                <Button disabled={isProcessing} onClick={() => void executeWorkflow()}>
                    Execute workflow
                </Button>
                <Button
                    disabled={isProcessing}
                    onClick={() => {
                        clearWorkflowSteps();
                    }}
                >
                    Clear Workflow
                </Button>
            </Grid>
        </>
    );
}

export { ControlsPanel };
