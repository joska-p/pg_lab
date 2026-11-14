import type { Camera2D } from '@repo/surface/core/Camera2D';
import { useCamera2D } from '@repo/surface/react/useCamera2D';
import { Button } from '@repo/ui/components/Button';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Readout } from '@repo/ui/components/Readout';
import { Stack } from '@repo/ui/components/Stack';
import { useState } from 'react';

import { cameraToComplex, complexToCamera } from '../core/camera';
import { computeMaxIterations } from '../core/iterationPolicy';
import { CURATED_PRESETS } from '../core/presets';
import type { CameraPreset } from '../core/presets';

type CameraSectionProps = {
    iterationBase: number;
    iterationScale: number;
    iterationCap: number;
} & ({ camera: Camera2D; rig?: never } | { rig: Camera2D; camera?: never });

function formatCenter(value: number): string {
    return value.toPrecision(8);
}

function formatZoom(zoom: number): string {
    return zoom >= 10000 ? zoom.toExponential(2) : zoom.toFixed(1);
}

function applyView(camera: Camera2D, centerRe: number, centerIm: number, zoom: number): void {
    const clampedZoom = Math.min(Math.max(zoom, camera.minZoom), camera.maxZoom);
    const viewport = camera.getViewport();
    const width = viewport?.width ?? 1;
    const height = viewport?.height ?? 1;
    const { x, y } = complexToCamera(centerRe, centerIm, clampedZoom, width, height);

    camera.patch({ x, y, zoom: clampedZoom });
}

export function CameraSection(props: CameraSectionProps) {
    const { iterationBase, iterationScale, iterationCap } = props;
    const camera = props.camera ?? props.rig;
    useCamera2D(camera);
    const [captured, setCaptured] = useState<CameraPreset[]>([]);

    const { x, y, zoom } = camera;
    const viewport = camera.getViewport();
    const width = viewport?.width ?? 1;
    const height = viewport?.height ?? 1;
    const { centerRe, centerIm } = cameraToComplex(x, y, zoom, width, height);
    const maxIterations = computeMaxIterations(zoom, iterationBase, iterationScale, iterationCap);

    function captureCurrentView(): void {
        const vp = camera.getViewport();
        const w = vp?.width ?? 1;
        const h = vp?.height ?? 1;
        const view = cameraToComplex(camera.x, camera.y, camera.zoom, w, h);

        setCaptured((previous) => [
            ...previous,
            {
                id: `captured-${previous.length + 1}`,
                label: `Captured ${previous.length + 1}`,
                centerRe: view.centerRe,
                centerIm: view.centerIm,
                zoom: camera.zoom,
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
                <Stack direction="horizontal" gap="2">
                    {CURATED_PRESETS.map((preset) => (
                        <Button
                            key={preset.id}
                            onClick={() =>
                                applyView(camera, preset.centerRe, preset.centerIm, preset.zoom)
                            }
                        >
                            {preset.label}
                        </Button>
                    ))}
                    {captured.map((preset) => (
                        <Button
                            key={preset.id}
                            onClick={() =>
                                applyView(camera, preset.centerRe, preset.centerIm, preset.zoom)
                            }
                        >
                            {preset.label}
                        </Button>
                    ))}
                    <Button onClick={captureCurrentView}>Capture current view</Button>
                    <Button onClick={() => camera.reset()}>Reset view</Button>
                </Stack>
            </ControlSection>
        </>
    );
}
