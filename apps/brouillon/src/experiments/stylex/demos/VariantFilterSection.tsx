import * as stylex from '@stylexjs/stylex';

import { space } from '../ui/const.stylex';
import { fieldText, heading } from '../ui/typography.stylex';
import {
    resetFilter,
    toggleOption,
    useVariantFilter,
    type FilterTarget,
} from './variantFilter.store';
import { VARIANT_PROPERTIES, VARIANT_PROPERTY_OPTIONS } from './variants';

const filterStyles = stylex.create({
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space['2'],
        marginBlock: space['2'],
    },
    group: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
        marginBlock: space['2'],
    },
    groupRow: {
        display: 'flex',
        alignItems: 'center',
        gap: space['2'],
    },
    options: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: space['2'],
    },
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: space['1'],
    },
});

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
            <div {...stylex.props(filterStyles.titleRow)}>
                <h4 {...stylex.props(heading.level2)}>{title}</h4>
                <button
                    type="button"
                    aria-label={`Reset ${target} filter`}
                    onClick={() => resetFilter(target)}
                >
                    Reset
                </button>
            </div>
            {VARIANT_PROPERTIES.map(({ property, label }) => {
                const options = VARIANT_PROPERTY_OPTIONS[property] as readonly (string | boolean)[];
                const selected = filter[property] as readonly (string | boolean)[];
                return (
                    <div key={property} {...stylex.props(filterStyles.group)}>
                        <div {...stylex.props(filterStyles.groupRow)}>
                            <span {...stylex.props(fieldText.value)}>{label}</span>
                        </div>
                        <div {...stylex.props(filterStyles.options)}>
                            {options.map((option) => (
                                <label
                                    key={String(option)}
                                    {...stylex.props(filterStyles.option, fieldText.label)}
                                >
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
