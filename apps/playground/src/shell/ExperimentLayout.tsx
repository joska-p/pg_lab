import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import * as stylex from '@stylexjs/stylex';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { ExperimentContent } from './ExperimentContent';
import { getExperiment } from './experiments';
import { StudioHeader } from './StudioHeader';

const styles = stylex.create({
    workbench: {
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

function LoadingFallback() {
    return (
        <ShellWrapper>
            <ExperimentShell stageLabel="loading">
                <p>Loading…</p>
            </ExperimentShell>
        </ShellWrapper>
    );
}

export function ExperimentLayout() {
    const { experiment } = useParams();
    const [panelCollapsed, setPanelCollapsed] = useState(false);

    const currentExperiment = getExperiment(experiment);
    const hasPanel = currentExperiment.loadControls != null;

    useEffect(() => {
        document.title = `${currentExperiment.label} · PG_LAB`;
    }, [currentExperiment]);

    return (
        <ShellWrapper>
            <div {...stylex.props(styles.workbench)}>
                <StudioHeader
                    currentExperiment={currentExperiment}
                    hasPanel={hasPanel}
                    panelCollapsed={panelCollapsed}
                    onTogglePanel={() => setPanelCollapsed((prev) => !prev)}
                />
                <div {...stylex.props(styles.workspace)}>
                    <Suspense fallback={<LoadingFallback />}>
                        <ErrorBoundary showStack={import.meta.env.DEV}>
                            <ExperimentContent
                                currentExperiment={currentExperiment}
                                panelCollapsed={panelCollapsed}
                                onCollapsedChange={setPanelCollapsed}
                            />
                        </ErrorBoundary>
                    </Suspense>
                </div>
            </div>
        </ShellWrapper>
    );
}
