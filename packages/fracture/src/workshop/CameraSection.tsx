import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Readout } from '@repo/ui/components/Readout';
import { Stack } from '@repo/ui/components/Stack';
import { useState, useSyncExternalStore } from 'react';

import { cameraToComplex, complexToCamera } from '../core/camera';
import { computeMaxIterations } from '../core/iterationPolicy';
import type { CameraRig } from '../core/observedCamera';
import { CURATED_PRESETS, type CameraPreset } from '../core/presets';

interface CameraSectionProps {
    rig: CameraRig;
    iterationBase: number;
    iterationScale: number;
    iterationCap: number;
}

function formatCenter(value: number): string {
    return value.toPrecision(8);
}

function formatZoom(zoom: number): string {
    return zoom >= 10000 ? zoom.toExponential(2) : zoom.toFixed(1);
}

function applyView(rig: CameraRig, centerRe: number, centerIm: number, zoom: number): void {
    const clampedZoom = Math.min(Math.max(zoom, rig.minZoom), rig.maxZoom);
    const { width, height } = rig.getViewport();
    const { x, y } = complexToCamera(centerRe, centerIm, clampedZoom, width, height);

    rig.controls.patch({ x, y, zoom: clampedZoom });
}

export function CameraSection({
    rig,
    iterationBase,
    iterationScale,
    iterationCap,
}: CameraSectionProps) {
    useSyncExternalStore(
        (notify) => rig.subscribe(notify),
        () => rig.getVersion(),
    );
    const [captured, setCaptured] = useState<CameraPreset[]>([]);

    const { x, y, zoom } = rig.camera;
    const { width, height } = rig.getViewport();
    const { centerRe, centerIm } = cameraToComplex(x, y, zoom, width, height);
    const maxIterations = computeMaxIterations(zoom, iterationBase, iterationScale, iterationCap);

    function captureCurrentView(): void {
        const view = cameraToComplex(
            rig.camera.x,
            rig.camera.y,
            rig.camera.zoom,
            rig.getViewport().width,
            rig.getViewport().height,
        );

        setCaptured((previous) => [
            ...previous,
            {
                id: `captured-${previous.length + 1}`,
                label: `Captured ${previous.length + 1}`,
                centerRe: view.centerRe,
                centerIm: view.centerIm,
                zoom: rig.camera.zoom,
            },
        ]);
    }

    return (
        <>
            <ControlSection title="View">
                <Stack gap="2">
                    <Readout label="centerRe" value={formatCenter(centerRe)} />
                    <Readout label="centerIm" value={formatCenter(centerIm)} />
                    <Readout label="zoom" value={formatZoom(zoom)} />
                    <Readout label="iterations" value={String(maxIterations)} />
                </Stack>
            </ControlSection>

            <ControlSection title="Presets">
                <Stack direction="horizontal" gap="2" wrap>
                    {CURATED_PRESETS.map((preset) => (
                        <Button
                            key={preset.id}
                            onClick={() =>
                                applyView(rig, preset.centerRe, preset.centerIm, preset.zoom)
                            }
                        >
                            {preset.label}
                        </Button>
                    ))}
                    {captured.map((preset) => (
                        <Button
                            key={preset.id}
                            onClick={() =>
                                applyView(rig, preset.centerRe, preset.centerIm, preset.zoom)
                            }
                        >
                            {preset.label}
                        </Button>
                    ))}
                    <Button onClick={captureCurrentView}>Capture current view</Button>
                    <Button onClick={() => rig.controls.reset()}>Reset view</Button>
                </Stack>
            </ControlSection>
        </>
    );
}
