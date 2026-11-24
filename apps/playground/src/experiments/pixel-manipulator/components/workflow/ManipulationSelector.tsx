import { getManipulations } from '@repo/pixel/worker';
import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { Select } from '@repo/ui/components/Select';
import { useState } from 'react';

import { addWorkflowStep } from '../../stores/manipulator/actions';

const manipulationIds = Object.keys(getManipulations());

function ManipulationSelector() {
    const [manipulationId, setManipulationId] = useState<string | undefined>(manipulationIds[0]);

    const manipulationOptions = manipulationIds
        .map((id) => {
            const manip = getManipulations()[id];

            if (!manip) {
                return null;
            }

            return { label: manip.name, value: id };
        })
        .filter((option): option is { label: string; value: string } => option !== null);

    return (
        <Grid columns="2">
            <Select
                value={manipulationId}
                onValueChange={(val) => {
                    setManipulationId(val);
                }}
                options={manipulationOptions}
            />

            <Button
                onClick={() => {
                    if (!manipulationId) {
                        return;
                    }

                    addWorkflowStep(manipulationId);
                }}
            >
                Add to Workflow
            </Button>
        </Grid>
    );
}

export { ManipulationSelector };
