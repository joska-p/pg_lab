import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { FileInput } from '@repo/ui/components/FileInput';

import { processImage } from '../core/process';
import type { PixelTransform } from '../core/process';
import { fileToImageData } from '../core/upload';
import { setOutput, setSource } from '../stores/store';

const TRANSFORMS: readonly PixelTransform[] = [];

function handleImageUpload(file: File): void {
    fileToImageData(file)
        .then((data) => {
            setSource(data);
            setOutput(processImage(data, TRANSFORMS));
        })
        .catch((error: unknown) => {
            console.error(error);
        });
}

export function Controls() {
    return (
        <ControlPanel title="String Art">
            <ControlSection title="Image">
                <FileInput accept="image/*" onFile={handleImageUpload} />
            </ControlSection>
        </ControlPanel>
    );
}
