import { ControlSection } from '@repo/ui/components/ControlSection';
import { Slider } from '@repo/ui/components/Slider';

import { setMaxDepth, setMinDepth } from '../../stores/randomart/actions';
import { useMaxDepth, useMinDepth } from '../../stores/randomart/selectors';

function DepthControls() {
    const minDepth = useMinDepth();
    const maxDepth = useMaxDepth();

    return (
        <ControlSection title="Depth">
            <Slider
                label="Min"
                min={1}
                max={12}
                step={1}
                value={minDepth}
                onValueChange={setMinDepth}
            />
            <Slider
                label="Max"
                min={1}
                max={16}
                step={1}
                value={maxDepth}
                onValueChange={setMaxDepth}
            />
        </ControlSection>
    );
}

export { DepthControls };
