import { Button } from '@repo/ui-next/components/Button';

import {
    resetFilter,
    toggleOption,
    useVariantFilter,
    type FilterTarget,
} from './variantFilter.store';
import { VARIANT_PROPERTIES, VARIANT_PROPERTY_OPTIONS } from './variants';

function formatOption(option: string | boolean): string {
    if (typeof option === 'boolean') {
        return option ? 'on' : 'off';
    }
    return option;
}

interface VariantFilterSectionProps {
    target: FilterTarget;
    title: string;
}

export function VariantFilterSection({ target, title }: VariantFilterSectionProps) {
    const filter = useVariantFilter(target);

    return (
        <section aria-label={title}>
            <div>
                <h2>{title}</h2>
                <Button
                    type="button"
                    background="soft"
                    color="neutral"
                    aria-label={`Reset ${target} filter`}
                    onClick={() => resetFilter(target)}
                >
                    Reset
                </Button>
            </div>
            {VARIANT_PROPERTIES.map(({ property, label }) => {
                const options = VARIANT_PROPERTY_OPTIONS[property] as readonly (string | boolean)[];
                const selected = filter[property] as readonly (string | boolean)[];
                return (
                    <div key={property}>
                        <div>
                            <span>{label}</span>
                        </div>
                        <div>
                            {options.map((option) => (
                                <label key={String(option)}>
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(option)}
                                        onChange={() => toggleOption(target, property, option)}
                                    />
                                    {formatOption(option)}
                                </label>
                            ))}
                        </div>
                    </div>
                );
            })}
        </section>
    );
}
