import { Button } from '@repo/ui/components/Button';
import { Card } from '@repo/ui/components/Card';
import { Stage } from '@repo/ui/components/Stage';
import { useNavigate } from 'react-router';

import { EXPERIMENTS } from '../../experiments';
import type { ExperimentKey } from '../../experiments';

const experiments = Object.entries(EXPERIMENTS)
    .map(([key, experiment]) => ({ key: key as ExperimentKey, label: experiment.label }))
    .filter((experiment) => experiment.label != 'Home');

export function Scene() {
    const navigate = useNavigate();

    return (
        <Stage label="playground">
            <Card>
                {experiments.map((experiment) => (
                    <Button key={experiment.key} onClick={() => navigate(`/${experiment.key}`)}>
                        {experiment.label}
                    </Button>
                ))}
            </Card>
        </Stage>
    );
}
