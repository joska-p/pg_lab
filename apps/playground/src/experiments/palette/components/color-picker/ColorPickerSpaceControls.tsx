import { Slider } from '@repo/ui/components/Slider';
import { Stack } from '@repo/ui/components/Stack';
import { useRef, useState } from 'react';

import { getColorPickerSpace } from '../../core/colorPickerSpaces';
import type { ColorPickerSpaceId } from '../../core/colorPickerSpaces';
import { setPaletteBaseColor } from '../../stores/paletteStore';
import { ColorPickerSpaceCanvas } from './ColorPickerSpaceCanvas';

interface ColorPickerSpaceControlsProps {
    pickerSpaceId?: ColorPickerSpaceId;
    size?: number;
}

function ColorPickerSpaceControls({
    pickerSpaceId = 'oklch',
    size = 200,
}: ColorPickerSpaceControlsProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { zSlider, getColor, xAxis, yAxis } = getColorPickerSpace(pickerSpaceId);
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
            <ColorPickerSpaceCanvas
                ref={canvasRef}
                pickerSpaceId={pickerSpaceId}
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

export { ColorPickerSpaceControls };
