import { usePixel } from '../../../react/usePixel';
import { imageDataToUrl } from '../helpers';

const STEPS = [
    { id: 'brightness', options: { value: 1.2 } },
    { id: 'contrast', options: { value: 1.3 } },
    { id: 'sharpen', options: { strength: 1.5 } },
] as const;

function ChainDemo({ sourceData }: { sourceData: ImageData | null }) {
    const result = usePixel(sourceData, STEPS);

    return (
        <div className="space-y-3">
            <p className="text-muted-foreground text-xs">
                Runs brightness → contrast → sharpen in a single off-thread invocation. All three
                pixel ops are fused into one pass.
            </p>
            <div className="grid grid-cols-4 gap-3">
                {result.map((imageData, index) => (
                    <div key={index}>
                        <p className="text-muted-foreground mb-1 text-[10px] font-medium uppercase">
                            {index === 0 ? 'Source' : (STEPS[index - 1]?.id ?? '')}
                        </p>
                        <img
                            src={imageDataToUrl(imageData) ?? ''}
                            alt={`step ${String(index)}`}
                            className="border-border w-full rounded border"
                            style={{ imageRendering: 'pixelated' }}
                        />
                        <p className="text-muted-foreground mt-0.5 text-[10px]">
                            {imageData.width}×{imageData.height}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export { ChainDemo };
