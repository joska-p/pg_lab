import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';

import { clearOutputs } from '../../stores/manipulator/actions';
import { UploadZone } from './UploadZone/UploadZone';

function ImageSourceControls() {
    return (
        <ControlSection title="image source">
            <UploadZone />
            <Button
                onClick={() => {
                    clearOutputs();
                }}
            >
                Clear Outputs
            </Button>
        </ControlSection>
    );
}

export { ImageSourceControls };
