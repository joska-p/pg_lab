import { Button } from '@repo/ui/components/Button';
import { useNavigate } from 'react-router';

import { experimentPath, interactiveExperiments } from '../experiments';

export function RandomJumpButton() {
    const navigate = useNavigate();

    const handleRandomJump = () => {
        const randomItem =
            interactiveExperiments[Math.floor(Math.random() * interactiveExperiments.length)];
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
