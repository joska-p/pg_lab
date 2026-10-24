import { Checkbox } from '@repo/ui/components/Checkbox';
import { Slider } from '@repo/ui/components/Slider';
import { TextInput } from '@repo/ui/components/TextInput';

import type { ParamDescriptor } from '../../core/types';

type Params = Record<string, ParamDescriptor>;

interface LayerOptionSectionProps {
    params: Params;
    values: Record<string, unknown>;
    onChange: (key: string, value: unknown) => void;
}

export function LayerOptionSection({ params, values, onChange }: LayerOptionSectionProps) {
    return (
        <>
            {Object.entries(params).map(([key, descriptor]) => {
                const currentValue = values[key] ?? descriptor.default;

                if (descriptor.type === 'number') {
                    return (
                        <div key={key} style={{ marginTop: '0.5rem' }}>
                            <Slider
                                label={descriptor.label}
                                value={Number(currentValue)}
                                min={descriptor.min}
                                max={descriptor.max}
                                step={descriptor.step}
                                onValueChange={(value) => {
                                    onChange(key, value);
                                }}
                            />
                        </div>
                    );
                }

                if (descriptor.type === 'color') {
                    return (
                        <div key={key} style={{ marginTop: '0.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                                {descriptor.label}
                            </label>
                            <input
                                type="color"
                                value={(currentValue as string) || '#ffffff'}
                                onChange={(e) => {
                                    onChange(key, e.target.value);
                                }}
                            />
                        </div>
                    );
                }

                if (descriptor.type === 'string') {
                    return (
                        <div key={key} style={{ marginTop: '0.5rem' }}>
                            <TextInput
                                label={descriptor.label}
                                value={currentValue as string}
                                onValueChange={(value) => {
                                    onChange(key, value);
                                }}
                            />
                        </div>
                    );
                }

                if (descriptor.type === 'boolean') {
                    return (
                        <div key={key} style={{ marginTop: '0.5rem' }}>
                            <Checkbox
                                label={descriptor.label}
                                checked={currentValue as boolean}
                                onCheckedChange={(checked) => {
                                    onChange(key, checked);
                                }}
                            />
                        </div>
                    );
                }

                return null;
            })}
        </>
    );
}
