import { Button } from '@repo/ui/components/Button';
import { useNavigate } from 'react-router';

import { EXPERIMENTS, experimentPath } from '../experiments';

export function RandomJumpButton() {
    const navigate = useNavigate();

    const handleRandomJump = () => {
        const randomItem = EXPERIMENTS[Math.floor(Math.random() * EXPERIMENTS.length)];
        if (randomItem) {
            void navigate(experimentPath(randomItem));
        }
    };

    return (
        <Button
            color="solder"
            background="solid"
            border="subtle"
            radius="md"
            elevation="raised"
            onClick={handleRandomJump}
            title="Explorer une experience au hasard"
        >
            hasard
        </Button>
    );
}
