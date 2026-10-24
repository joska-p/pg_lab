import { getManipulations } from '@repo/pixel/worker';
import { Button } from '@repo/ui/components/Button';
import { Grid } from '@repo/ui/components/Grid';
import { Select } from '@repo/ui/components/Select';
import { useState } from 'react';

import { addWorkflowStep } from '../../stores/manipulator/actions';

const manipulationIds = Object.keys(getManipulations());

function ManipulationSelector() {
    const [manipulationId, setManipulationId] = useState(manipulationIds[0]);

    const manipulationOptions = manipulationIds.map((id) => ({
        label: getManipulations()[id].name,
        value: id,
    }));

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
                    addWorkflowStep(manipulationId);
                }}
            >
                Add to Workflow
            </Button>
        </Grid>
    );
}

export { ManipulationSelector };
