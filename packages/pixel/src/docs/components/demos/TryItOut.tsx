import { Slider } from '@repo/ui/components/Slider';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { fieldText } from '@repo/ui/recipes/typography';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { colors } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';

import { processImageInWorker } from '../../../worker/process-image-in-worker';
import type { ManipInfo } from '../../data/pipeline-docs-data';
import { imageDataToUrl } from '../../imageLoader';

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['4'],
    },
    sliderBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
    },
    sliderRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
    },
    sliderHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: typography.fontSizeXs,
    },
    valueReadout: {
        fontVariantNumeric: 'tabular-nums',
        opacity: 0.6,
    },
    errorBox: {
        borderRadius: '0.375rem',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${colors.error} 30%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${colors.error} 10%, transparent)`,
        padding: '0.75rem',
        fontSize: typography.fontSizeXs,
        color: colors.error,
    },
    resultRow: {
        display: 'flex',
        alignItems: 'center',
        gap: space['4'],
    },
    imageWrapper: {
        width: '5rem',
        flexShrink: 0,
    },
    image: {
        width: '100%',
        borderRadius: '0.25rem',
        borderWidth: '1px',
        borderStyle: 'solid' as const,
        borderColor: `color-mix(in oklab, ${colors.neutral} 25%, transparent)`,
    },
    dimensions: {
        opacity: 0.6,
        fontSize: typography.fontSizeXs,
    },
});

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
        <div {...stylex.props(styles.root)}>
            {manip.params && manip.params.length > 0 && (
                <div {...stylex.props(styles.sliderBlock)}>
                    {manip.params.map((param) => {
                        const value: number =
                            paramValues[`${manip.id}:${param.key}`] ?? param.default;

                        return (
                            <div key={param.key} {...stylex.props(styles.sliderRow)}>
                                <div {...stylex.props(styles.sliderHeader)}>
                                    <label
                                        htmlFor={`${manip.id}-${param.key}`}
                                        {...stylex.props(fieldText.label)}
                                    >
                                        {param.label}
                                    </label>
                                    <span {...stylex.props(fieldText.value, styles.valueReadout)}>
                                        {value.toFixed(param.step >= 1 ? 0 : 2)}
                                    </span>
                                </div>
                                <Slider
                                    id={`${manip.id}-${param.key}`}
                                    min={param.min}
                                    max={param.max}
                                    step={param.step}
                                    value={value}
                                    onValueChange={(v) => {
                                        onParamChange(manip.id, param.key, v);
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {error && <div {...stylex.props(styles.errorBox)}>{error}</div>}

            {result && (
                <div {...stylex.props(styles.resultRow)}>
                    <div {...stylex.props(styles.imageWrapper)}>
                        <img
                            src={imageDataToUrl(result) ?? ''}
                            alt={`${manip.label} result`}
                            style={{ imageRendering: 'pixelated' }}
                            {...stylex.props(
                                styles.image,
                                surfaceStyles({ background: 'none', border: 'subtle' }),
                            )}
                        />
                    </div>
                    <div {...stylex.props(styles.dimensions)}>
                        {result.width}×{result.height}
                    </div>
                </div>
            )}
        </div>
    );
}

export { TryItOut };
