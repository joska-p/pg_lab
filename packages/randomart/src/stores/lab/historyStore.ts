import { create } from 'zustand';

import type { ProvenanceCheck } from '../../core/artwork/provenance';
import type { Expression } from '../../core/expression/types';
import type { Grammar } from '../../core/grammar/types';
import type { Seed } from '../../core/random/seed';

/** One explored state: replay from (grammar, seed); imported artworks keep expression as reference. */
export interface HistoryEntry {
    readonly id: number;
    readonly seed: Seed;
    readonly grammar: Grammar;
    readonly nodes: number;
    readonly expression?: Expression;
    readonly provenanceCheck?: ProvenanceCheck;
}

interface HistoryState {
    history: readonly HistoryEntry[];
    currentId: number;
}

const store = create<HistoryState>(() => ({
    history: [],
    currentId: 0,
}));

let nextEntryId = 1;

export function nextHistoryId(): number {
    return nextEntryId++;
}

export function useHistory(): readonly HistoryEntry[] {
    return store((s) => s.history);
}

export function useCurrentId(): number {
    return store((s) => s.currentId);
}

export function getHistory(): readonly HistoryEntry[] {
    return store.getState().history;
}

export function getCurrentId(): number {
    return store.getState().currentId;
}

export function getHistoryEntry(id: number): HistoryEntry | undefined {
    return store.getState().history.find((candidate) => candidate.id === id);
}

export function selectHistoryEntry(id: number): void {
    store.setState({ currentId: id });
}

/**
 * Prepends entry. `replaces=true` drops current entry first (coalesces grammar edits). Capped at
 * `limit`.
 */
export function pushHistoryEntry(entry: HistoryEntry, replaces: boolean, limit: number): void {
    const { history, currentId } = store.getState();
    const kept = replaces ? history.filter((candidate) => candidate.id !== currentId) : history;

    store.setState({ history: [entry, ...kept].slice(0, limit), currentId: entry.id });
}

export function replaceHistory(history: readonly HistoryEntry[], currentId: number): void {
    store.setState({ history, currentId });
}
