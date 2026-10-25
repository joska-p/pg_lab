import { Fragment } from 'react';

import { CAPTAIN_LOGS, sortLogs } from './logs';
import { useLogSortOrder } from './store';
import type { CaptainLog } from './types';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeZone: 'UTC',
});

function formatLogDate(date: string): string {
    return DATE_FORMATTER.format(Date.parse(date));
}

function dayCountBetween(previous: CaptainLog, next: CaptainLog): number {
    return Math.round((Date.parse(next.date) - Date.parse(previous.date)) / MILLISECONDS_PER_DAY);
}

function formatDayCount(count: number): string {
    return count === 1 ? '1 jour' : `${count} jours`;
}

export function CaptainsLogs() {
    const sortOrder = useLogSortOrder();
    const logs = sortLogs(CAPTAIN_LOGS, sortOrder);

    const daysSincePrevious = new Map<string, number>();
    for (let index = 1; index < CAPTAIN_LOGS.length; index += 1) {
        daysSincePrevious.set(
            CAPTAIN_LOGS[index].id,
            dayCountBetween(CAPTAIN_LOGS[index - 1], CAPTAIN_LOGS[index]),
        );
    }

    return (
        <article>
            <h1>Captain's Logs</h1>

            {logs.map((log, index) => {
                const days = daysSincePrevious.get(log.id);

                return (
                    <Fragment key={log.id}>
                        {index > 0 ? <hr /> : null}
                        <section id={log.id} aria-labelledby={`${log.id}-title`}>
                            <h2 id={`${log.id}-title`}>
                                Captain's Log: Stardate {log.stardate}
                                {log.headingSuffix ? ` (${log.headingSuffix})` : ''}
                            </h2>

                            <p>
                                <strong>Date :</strong>{' '}
                                <time dateTime={log.date}>{formatLogDate(log.date)}</time>
                                {days !== undefined ? (
                                    <>
                                        <br />
                                        <strong>Depuis la dernière entrée :</strong>{' '}
                                        {formatDayCount(days)}
                                    </>
                                ) : null}
                                {log.details.map((detail) => (
                                    <Fragment key={detail.label}>
                                        <br />
                                        <strong>{detail.label} :</strong> {detail.value}
                                    </Fragment>
                                ))}
                            </p>

                            {log.content}
                        </section>
                    </Fragment>
                );
            })}
        </article>
    );
}
