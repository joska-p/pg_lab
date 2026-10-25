import { createCssColor } from '@repo/glaze/core/render';
import type { CpuSurface } from '@repo/glaze/cpu/CpuSurface';
import { CpuCanvas } from '@repo/glaze/react/CpuCanvas';
import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { FileInput } from '@repo/ui/components/FileInput';
import { Segmented } from '@repo/ui/components/Segmented';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { useEffect } from 'react';

import { computeFit, toPixelAligned } from './core/fit';
import { processImage } from './core/process';
import type { PixelTransform } from './core/process';
import { blit, toBlittableImage } from './core/render';
import { fileToImageData } from './core/upload';
import { useTheme, setTheme } from './stores/appStore';
import { useOutput, setOutput, setSource } from './stores/store';

const TRANSFORMS: readonly PixelTransform[] = [];
const BACKGROUND = createCssColor('#000000'); // hoisté, sinon recréé à chaque frame

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

export function App() {
    const theme = useTheme();
    const output = useOutput();

    const blittableOutput = output ? toBlittableImage(output) : null;

    useEffect(() => {
        document.documentElement.style.colorScheme = theme === 'system' ? 'light dark' : theme;
    }, [theme]);

    function handleOnFrame(surface: CpuSurface): void {
        if (!blittableOutput) {
            return;
        }

        // Lecture de l'état moteur DANS la frame → dimensions fraîches au resize
        const placement = toPixelAligned(computeFit(blittableOutput, surface));

        surface.clear(BACKGROUND);
        blit(surface, blittableOutput, placement);
    }

    return (
        <ShellWrapper>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ExperimentShell
                    panel={
                        <ControlPanel title="string-art controls">
                            <ControlSection title="Theme">
                                <Segmented<'light' | 'dark' | 'system'>
                                    options={['light', 'dark', 'system']}
                                    value={theme}
                                    onValueChange={setTheme}
                                />
                            </ControlSection>

                            <ControlSection title="Image">
                                <FileInput accept="image/*" onFile={handleImageUpload} />
                            </ControlSection>
                        </ControlPanel>
                    }
                >
                    <Stage label="string-art">
                        <CpuCanvas
                            style={{ width: '100%', height: '100%' }}
                            onFrame={handleOnFrame}
                        />
                    </Stage>
                </ExperimentShell>
            </ErrorBoundary>
        </ShellWrapper>
    );
}
