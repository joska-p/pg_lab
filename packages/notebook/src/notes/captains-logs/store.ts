import { create } from 'zustand';

import type { LogSortOrder } from './types';

interface CaptainsLogsState {
    sortOrder: LogSortOrder;
}

const captainsLogsStore = create<CaptainsLogsState>(() => ({
    sortOrder: 'newest-first',
}));

export function useLogSortOrder(): LogSortOrder {
    return captainsLogsStore((state) => state.sortOrder);
}

export function setLogSortOrder(sortOrder: LogSortOrder): void {
    captainsLogsStore.setState({ sortOrder });
}
