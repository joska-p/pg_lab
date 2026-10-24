import { Slider } from '@repo/ui/components/Slider';
import { useEffect, useState } from 'react';

import { processImageInWorker } from '../../../worker/process-image-in-worker';
import type { ManipInfo } from '../data/pipeline-docs-data';
import { imageDataToUrl } from '../helpers';

interface TryItOutProps {
    sourceData: ImageData | null;
    manip: ManipInfo;
    paramValues: Record<string, number>;
    onParamChange: (id: string, key: string, value: number) => void;
}

function TryItOut({ sourceData, manip, paramValues, onParamChange }: TryItOutProps) {
    const [result, setResult] = useState<ImageData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sourceData) {
            return;
        }

        let cancelled = false;

        const options: Record<string, number> = {};

        if (manip.params) {
            for (const p of manip.params) {
                options[p.key] = paramValues[`${manip.id}:${p.key}`] ?? p.default;
            }
        }

        processImageInWorker({
            sourceImageData: sourceData,
            steps: [{ id: manip.id, options }],
        })
            .then((snapshots) => {
                if (!cancelled && snapshots[0]) {
                    setResult(snapshots[0]);
                }
            })
            .catch((cause: unknown) => {
                if (!cancelled) {
                    setError(String(cause));
                }
            });

        return () => {
            cancelled = true;
        };
    }, [sourceData, manip.id, manip.params, paramValues, manip]);

    return (
        <div className="space-y-4">
            {manip.params && manip.params.length > 0 && (
                <div className="space-y-3">
                    {manip.params.map((parameter) => {
                        const value: number =
                            paramValues[`${manip.id}:${parameter.key}`] ?? parameter.default;

                        return (
                            <div key={parameter.key}>
                                <div className="mb-1 flex items-center justify-between text-xs">
                                    <label
                                        htmlFor={`${manip.id}-${parameter.key}`}
                                        className="font-medium"
                                    >
                                        {parameter.label}
                                    </label>
                                    <span className="text-muted-foreground tabular-nums">
                                        {value.toFixed(parameter.step >= 1 ? 0 : 2)}
                                    </span>
                                </div>
                                <Slider
                                    id={`${manip.id}-${parameter.key}`}
                                    min={parameter.min}
                                    max={parameter.max}
                                    step={parameter.step}
                                    value={value}
                                    onValueChange={(value: number) => {
                                        onParamChange(manip.id, parameter.key, value);
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {error && (
                <div className="text-destructive rounded-md border border-red-400/30 bg-red-950/20 p-3 text-xs">
                    {error}
                </div>
            )}

            {result && (
                <div className="flex items-center gap-4">
                    <div className="w-20 shrink-0">
                        <img
                            src={imageDataToUrl(result) ?? ''}
                            alt={`${manip.label} result`}
                            className="border-border w-full rounded border"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>
                    <div className="text-muted-foreground text-xs">
                        {result.width}×{result.height}
                    </div>
                </div>
            )}
        </div>
    );
}

export { TryItOut };
