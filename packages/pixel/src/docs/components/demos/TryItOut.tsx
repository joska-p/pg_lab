import { Card } from '@repo/ui/components/Card';
import { Slider } from '@repo/ui/components/Slider';
import { Text } from '@repo/ui/components/Text';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';
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

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['4'],
    },
    params: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
    },
    param: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
    },
    labelRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightMedium,
        color: surface.foreground,
    },
    value: {
        fontSize: typography.fontSizeXs,
        fontFamily: typography.fontFamilyMono,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
    error: {
        borderRadius: '6px',
        borderWidth: '1px',
        borderStyle: 'solid',
        padding: space['3'],
        fontSize: typography.fontSizeXs,
    },
    errorBorder: {
        borderColor: `color-mix(in oklab, ${surface.foreground} 30%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 10%, transparent)`,
        color: surface.foreground,
    },
    result: {
        display: 'flex',
        alignItems: 'center',
        gap: space['4'],
    },
    image: {
        width: '80px',
        height: '80px',
        flexShrink: 0,
        borderRadius: '6px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        imageRendering: 'pixelated',
        display: 'block',
    },
    size: {
        margin: 0,
        fontSize: typography.fontSizeXs,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
});

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
        <div {...stylex.props(styles.root)}>
            {manip.params && manip.params.length > 0 && (
                <div {...stylex.props(styles.params)}>
                    {manip.params.map((parameter) => {
                        const value: number =
                            paramValues[`${manip.id}:${parameter.key}`] ?? parameter.default;

                        return (
                            <div key={parameter.key} {...stylex.props(styles.param)}>
                                <div {...stylex.props(styles.labelRow)}>
                                    <label
                                        htmlFor={`${manip.id}-${parameter.key}`}
                                        {...stylex.props(styles.label)}
                                    >
                                        {parameter.label}
                                    </label>
                                    <span {...stylex.props(styles.value)}>
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
                <Card color="error" background="soft" border="strong" radius="md">
                    <Text variant="muted">{error}</Text>
                </Card>
            )}

            {result && (
                <div {...stylex.props(styles.result)}>
                    <div>
                        <img
                            src={imageDataToUrl(result) ?? ''}
                            alt={`${manip.label} result`}
                            {...stylex.props(styles.image)}
                        />
                    </div>
                    <p {...stylex.props(styles.size)}>
                        {result.width}×{result.height}
                    </p>
                </div>
            )}
        </div>
    );
}

export { TryItOut };
