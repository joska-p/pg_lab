import type { ClockStore } from '@repo/glaze/react/types';
import { create } from 'zustand';

import { simpleEdgeNetlist } from '../assets/netlists/simpleEdge';
import { twoParallelNetlist } from '../assets/netlists/twoParallel';
import { twoSeriesNetlist } from '../assets/netlists/twoSeries';
import type { Netlist } from '../engine/core/netlist';

export interface NetlistEntry {
    readonly key: string;
    readonly label: string;
    readonly netlist: Netlist;
}

export const NETLIST_ENTRIES: readonly NetlistEntry[] = [
    { key: 'simple-edge', label: 'Simple edge', netlist: simpleEdgeNetlist },
    { key: 'two-series', label: 'Two in series', netlist: twoSeriesNetlist },
    { key: 'two-parallel', label: 'Two in parallel', netlist: twoParallelNetlist },
] as const;

export type NetlistKey = (typeof NETLIST_ENTRIES)[number]['key'];

function findEntry(key: NetlistKey): NetlistEntry {
    const entry = NETLIST_ENTRIES.find((e) => e.key === key);
    if (!entry) {
        throw new Error(`Unknown netlist key: ${key}`);
    }
    return entry;
}

interface ExperimentState {
    readonly netlistKey: NetlistKey;
    readonly clockStore: ClockStore | null;
}

const initialState: ExperimentState = {
    netlistKey: 'simple-edge',
    clockStore: null,
};

const experimentStore = create<ExperimentState>(() => initialState);

export function useNetlistKey(): NetlistKey {
    return experimentStore((s) => s.netlistKey);
}

export function useNetlist(): Netlist {
    return experimentStore((s) => findEntry(s.netlistKey).netlist);
}

export function useNetlistEntry(): NetlistEntry {
    return experimentStore((s) => findEntry(s.netlistKey));
}

export function setNetlistKey(key: NetlistKey): void {
    experimentStore.setState({ netlistKey: key });
}

export function useClockStore(): ClockStore | null {
    return experimentStore((s) => s.clockStore);
}

export function setClockStore(clockStore: ClockStore): void {
    experimentStore.setState({ clockStore });
}

export function detachClock(): void {
    experimentStore.setState({ clockStore: null });
}
