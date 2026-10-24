import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';

import { resetViewport } from '../../stores/ui/actions';

export function ViewportSection() {
    return (
        <ControlSection title="Viewport">
            <Button onClick={resetViewport}>Reset</Button>
        </ControlSection>
    );
}
