import { ControlPanel } from '@repo/ui/components/ControlPanel';

import { Chart } from './chart/Chart';
import { Sketchpad } from './Sketchpad';

function Controls() {
    return (
        <ControlPanel>
            <Sketchpad />
            <Chart />
        </ControlPanel>
    );
}

export { Controls };
