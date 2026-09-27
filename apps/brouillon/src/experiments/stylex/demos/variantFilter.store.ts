import { create } from 'zustand';

import { DEFAULT_CARD_FILTER, DEFAULT_COMPONENT_FILTER, type VariantFilter } from './variants';

export type FilterTarget = 'card' | 'component';
export type VariantProperty = keyof VariantFilter;

interface VariantFilterState {
    filters: Record<FilterTarget, VariantFilter>;
}

const DEFAULT_FILTERS: Record<FilterTarget, VariantFilter> = {
    card: DEFAULT_CARD_FILTER,
    component: DEFAULT_COMPONENT_FILTER,
};

const variantFilterStore = create<VariantFilterState>(() => ({
    filters: DEFAULT_FILTERS,
}));

export function useVariantFilter(target: FilterTarget): VariantFilter {
    return variantFilterStore((s) => s.filters[target]);
}

export function useCardFilter(): VariantFilter {
    return useVariantFilter('card');
}

export function useComponentFilter(): VariantFilter {
    return useVariantFilter('component');
}

function updateFilter(
    target: FilterTarget,
    update: (filter: VariantFilter) => VariantFilter,
): void {
    variantFilterStore.setState((state) => ({
        filters: { ...state.filters, [target]: update(state.filters[target]) },
    }));
}

export function toggleOption(
    target: FilterTarget,
    property: VariantProperty,
    option: string | boolean,
): void {
    updateFilter(target, (filter) => {
        const selected = filter[property] as readonly unknown[];
        const next = selected.includes(option)
            ? selected.filter((item) => item !== option)
            : [...selected, option];
        return { ...filter, [property]: next };
    });
}

export function resetFilter(target: FilterTarget): void {
    updateFilter(target, () => DEFAULT_FILTERS[target]);
}
