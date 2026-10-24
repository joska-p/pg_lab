import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';

import { WORKFLOW_PRESETS } from '../../core/workflows/workflows';
import { setWorkflowSteps } from '../../stores/manipulator/actions';

function PresetSelector() {
    function loadPreset(index: number) {
        const preset = WORKFLOW_PRESETS[index];

        setWorkflowSteps(
            preset.steps.map((step) => ({
                ...step,
                options: step.options ?? {},
                uid: crypto.randomUUID(),
            })),
        );
    }

    return (
        <Grid>
            {WORKFLOW_PRESETS.map((preset, index) => (
                <Button
                    key={preset.name}
                    onClick={() => {
                        loadPreset(index);
                    }}
                >
                    {preset.name}
                </Button>
            ))}
        </Grid>
    );
}

export { PresetSelector };
