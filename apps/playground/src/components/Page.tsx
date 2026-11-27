import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';
import { ExperimentWrapper } from '@repo/ui/components/ExperimentWrapper';
import { Suspense } from 'react';
import type { ReactNode } from 'react';

import type { PageMeta } from '../experiments';
import { StudioHeader } from './StudioHeader';

interface PageProps {
    readonly page: PageMeta;
    readonly children: ReactNode;
}

export function Page({ page, children }: PageProps) {
    return (
        <ExperimentWrapper>
            {/* React 19 : <title> est remonté dans <head>, plus besoin d'effet. */}
            <title>{`${page.label} · PG_LAB`}</title>

            <StudioHeader currentPage={page} />

            <ErrorBoundary key={page.id} showStack={import.meta.env.DEV}>
                <Suspense
                    fallback={
                        <ExperimentLayout stageLabel={page.stageLabel}>
                            <p>Loading…</p>
                        </ExperimentLayout>
                    }
                >
                    {children}
                </Suspense>
            </ErrorBoundary>
        </ExperimentWrapper>
    );
}
