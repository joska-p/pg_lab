import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';
import { ExperimentWrapper } from '@repo/ui/components/ExperimentWrapper';
import * as stylex from '@stylexjs/stylex';
import { Suspense, use, useState } from 'react';
import type { ReactNode } from 'react';

import { loadExperiment } from '../experiments';
import type { ExperimentDefinition, ShellExperiment } from '../experiments';
import { StudioHeader } from './StudioHeader';

const styles = stylex.create({
    page: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    workspace: {
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        position: 'relative',
        display: 'flex',
    },
});

const noop = () => undefined;

/* -------------------------------------------------------------------------- */
/* Frame : le chrome commun (titre, header, zone de travail, erreurs, loading) */
/* -------------------------------------------------------------------------- */

interface FrameProps {
    readonly experiment: ShellExperiment;
    readonly hasPanel?: boolean;
    readonly panelCollapsed?: boolean;
    readonly onTogglePanel?: () => void;
    readonly children: ReactNode;
}

function Page({
    experiment,
    hasPanel = false,
    panelCollapsed = false,
    onTogglePanel = noop,
    children,
}: FrameProps) {
    return (
        <ExperimentWrapper>
            {/* React 19 : <title> est remonté dans <head>, plus besoin d'effet. */}
            <title>{`${experiment.label} · PG_LAB`}</title>

            <div {...stylex.props(styles.page)}>
                <StudioHeader
                    currentExperiment={experiment}
                    hasPanel={hasPanel}
                    panelCollapsed={panelCollapsed}
                    onTogglePanel={onTogglePanel}
                />
                <div {...stylex.props(styles.workspace)}>
                    {/* key : l'erreur d'une expérience ne doit pas survivre à la navigation. */}
                    <ErrorBoundary key={experiment.id} showStack={import.meta.env.DEV}>
                        <Suspense
                            fallback={
                                <ExperimentLayout stageLabel={experiment.stageLabel}>
                                    <p>Loading…</p>
                                </ExperimentLayout>
                            }
                        >
                            {children}
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </div>
        </ExperimentWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* StaticPage : home, 404… du contenu simple, sans panneau de contrôles        */
/* -------------------------------------------------------------------------- */

interface StaticPageProps {
    readonly experiment: ShellExperiment;
    readonly children: ReactNode;
}

export function StaticPage({ experiment, children }: StaticPageProps) {
    return (
        <Page experiment={experiment}>
            <ExperimentLayout stageLabel={experiment.stageLabel}>{children}</ExperimentLayout>
        </Page>
    );
}

/* -------------------------------------------------------------------------- */
/* ExperimentPage : une expérience du registre (Scene + Controls en lazy)      */
/* -------------------------------------------------------------------------- */

interface LoadedExperimentProps {
    readonly experiment: ExperimentDefinition;
    readonly panelCollapsed: boolean;
    readonly onCollapsedChange: (collapsed: boolean) => void;
}

function LoadedExperiment({
    experiment,
    panelCollapsed,
    onCollapsedChange,
}: LoadedExperimentProps) {
    const { Experiment } = use(loadExperiment(experiment));

    return <Experiment collapsed={panelCollapsed} onCollapsedChange={onCollapsedChange} />;
}

interface ExperimentPageProps {
    readonly experiment: ExperimentDefinition;
}

export function ExperimentPage({ experiment }: ExperimentPageProps) {
    const [panelCollapsed, setPanelCollapsed] = useState(false);

    return (
        <Page
            experiment={experiment}
            hasPanel={true}
            panelCollapsed={panelCollapsed}
            onTogglePanel={() => setPanelCollapsed((collapsed) => !collapsed)}
        >
            <LoadedExperiment
                experiment={experiment}
                panelCollapsed={panelCollapsed}
                onCollapsedChange={setPanelCollapsed}
            />
        </Page>
    );
}
