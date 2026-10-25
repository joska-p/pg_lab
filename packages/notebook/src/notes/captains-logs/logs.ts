import { log2026089 } from './logs/stardate-2026-089';
import { log2026186 } from './logs/stardate-2026-186';
import { log2026187 } from './logs/stardate-2026-187';
import { log2026188 } from './logs/stardate-2026-188';
import { log2026231 } from './logs/stardate-2026-231';
import { log2026235 } from './logs/stardate-2026-235';
import { log2026238 } from './logs/stardate-2026-238';
import { log2026239 } from './logs/stardate-2026-239';
import { log2026240 } from './logs/stardate-2026-240';
import { log2026241 } from './logs/stardate-2026-241';
import { log2026242 } from './logs/stardate-2026-242';
import { log2026248 } from './logs/stardate-2026-248';
import { log2026264 } from './logs/stardate-2026-264';
import { log2026265 } from './logs/stardate-2026-265';
import { log2026272 } from './logs/stardate-2026-272';
import { log2026296 } from './logs/stardate-2026-296';
import { log2026298 } from './logs/stardate-2026-298';
import type { CaptainLog, LogSortOrder } from './types';

/** Chronological order is the canonical order, used to derive days between entries. */
export const CAPTAIN_LOGS: readonly CaptainLog[] = [
    log2026089,
    log2026186,
    log2026187,
    log2026188,
    log2026231,
    log2026235,
    log2026238,
    log2026239,
    log2026240,
    log2026241,
    log2026242,
    log2026248,
    log2026264,
    log2026265,
    log2026272,
    log2026296,
    log2026298,
];

export function sortLogs(
    logs: readonly CaptainLog[],
    sortOrder: LogSortOrder,
): readonly CaptainLog[] {
    return [...logs].sort((a, b) =>
        sortOrder === 'newest-first' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
    );
}
