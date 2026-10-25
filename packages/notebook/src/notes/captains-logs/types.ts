import type { ReactNode } from 'react';

export type LogSortOrder = 'newest-first' | 'oldest-first';

export interface LogDetail {
    label: string;
    value: ReactNode;
}

export interface CaptainLog {
    id: string;
    stardate: string;
    date: string;
    headingSuffix?: string;
    details: readonly LogDetail[];
    content: ReactNode;
}
