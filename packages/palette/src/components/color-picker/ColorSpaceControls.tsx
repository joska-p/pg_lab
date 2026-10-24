import { Slider } from '@repo/ui/components/Slider';
import { Stack } from '@repo/ui/components/Stack';
import { useRef, useState } from 'react';

import { colorSpaces } from '../../core/colorSpaces';
import type { ColorSpacesKey } from '../../core/colorSpaces';
import { setPaletteBaseColor } from '../../stores/paletteStore';
import { ColorSpaceCanvas } from './ColorSpaceCanvas';

interface ColorSpaceControlsProps {
    spaceId?: ColorSpacesKey;
    size?: number;
}

function ColorSpaceControls({ spaceId = 'oklch', size = 200 }: ColorSpaceControlsProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { zSlider, getColor, xAxis, yAxis } = colorSpaces[spaceId];
    const { min, max, step } = zSlider;
    const [zValue, setZValue] = useState<number>(max / 2);

    const handlePointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (event.buttons !== 1) {
            return;
        }

        const rect = canvasRef.current?.getBoundingClientRect();

        if (!rect) {
            return;
        }

        const pixelX = Math.max(0, Math.min(size, event.clientX - rect.left));
        const pixelY = Math.max(0, Math.min(size, event.clientY - rect.top));

        const xValue = xAxis.min + (pixelX / size) * (xAxis.max - xAxis.min);
        const yValue = yAxis.max - (pixelY / size) * (yAxis.max - yAxis.min);

        setPaletteBaseColor(getColor(xValue, yValue, zValue));
    };

    return (
        <Stack gap="3">
            <ColorSpaceCanvas
                ref={canvasRef}
                spaceId={spaceId}
                zValue={zValue}
                size={size}
                onPick={handlePointer}
            />

            <Slider
                label={zSlider.label}
                min={min}
                max={max}
                step={step ?? 1}
                value={zValue}
                onValueChange={setZValue}
            />
        </Stack>
    );
}

export { ColorSpaceControls };
