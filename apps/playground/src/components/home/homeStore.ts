import { useMemo } from 'react';
import { create } from 'zustand';

import { EXPERIMENTS, experimentCount, experimentPath } from '../../experiments';
import type { Experiment } from '../../experiments';

export type SortMode = 'registry' | 'alpha' | 'tint';

interface HomeState {
    searchQuery: string;
    sortBy: SortMode;
    selectedTag: string | null;
    setSearchQuery: (searchQuery: string) => void;
    setSortBy: (sortBy: SortMode) => void;
    setSelectedTag: (selectedTag: string | null) => void;
    toggleTag: (tag: string) => void;
    resetFilters: () => void;
}

export const useHomeStore = create<HomeState>((set) => ({
    searchQuery: '',
    sortBy: 'registry',
    selectedTag: null,
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSortBy: (sortBy) => set({ sortBy }),
    setSelectedTag: (selectedTag) => set({ selectedTag }),
    toggleTag: (tag) =>
        set((state) => ({
            selectedTag: state.selectedTag === tag ? null : tag,
        })),
    resetFilters: () => set({ searchQuery: '', selectedTag: null, sortBy: 'registry' }),
}));

const TINT_ORDER: Record<string, number> = {
    aurora: 1,
    aqua: 2,
    solder: 3,
    amber: 4,
    orange: 5,
    purple: 6,
    neutral: 7,
};

export function useFilteredExperiments(): {
    items: readonly Experiment[];
    totalCount: number;
    matchingCount: number;
    hasActiveFilters: boolean;
} {
    const searchQuery = useHomeStore((s) => s.searchQuery);
    const sortBy = useHomeStore((s) => s.sortBy);
    const selectedTag = useHomeStore((s) => s.selectedTag);

    const trimmedQuery = searchQuery.trim().toLowerCase();
    const hasActiveFilters = trimmedQuery.length > 0 || Boolean(selectedTag);

    const items = useMemo(() => {
        let result = EXPERIMENTS.filter((item: Experiment) => {
            if (selectedTag && !item.tags.includes(selectedTag)) {
                return false;
            }

            if (trimmedQuery.length > 0) {
                const matchTitle = item.label.toLowerCase().includes(trimmedQuery);
                const matchSummary = item.summary.toLowerCase().includes(trimmedQuery);
                const matchPath = experimentPath(item).toLowerCase().includes(trimmedQuery);
                const matchTag = item.tags.some((tag) => tag.toLowerCase().includes(trimmedQuery));
                return matchTitle || matchSummary || matchPath || matchTag;
            }

            return true;
        });

        if (sortBy === 'alpha') {
            result = [...result].sort((a, b) => a.label.localeCompare(b.label));
        } else if (sortBy === 'tint') {
            result = [...result].sort((a, b) => {
                const orderA = TINT_ORDER[a.tint] ?? 99;
                const orderB = TINT_ORDER[b.tint] ?? 99;
                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                return a.label.localeCompare(b.label);
            });
        }

        return result;
    }, [trimmedQuery, selectedTag, sortBy]);

    return {
        items,
        totalCount: experimentCount,
        matchingCount: items.length,
        hasActiveFilters,
    };
}
