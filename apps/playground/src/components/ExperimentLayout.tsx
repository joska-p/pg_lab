import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import * as stylex from '@stylexjs/stylex';
import { Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type { ShellExperiment } from '../experiments';
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

export interface Chrome {
    readonly panelCollapsed: boolean;
    readonly onTogglePanel: () => void;
}

interface ExperimentLayoutProps {
    readonly currentExperiment: ShellExperiment;
    readonly hasPanel: boolean;
    readonly children: (chrome: Chrome) => ReactNode;
}

export function ExperimentLayout({ currentExperiment, hasPanel, children }: ExperimentLayoutProps) {
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const onTogglePanel = () => setPanelCollapsed((prev) => !prev);

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
                    onTogglePanel={onTogglePanel}
                />
                <div {...stylex.props(styles.workspace)}>
                    <Suspense fallback={<LoadingFallback />}>
                        <ErrorBoundary showStack={import.meta.env.DEV}>
                            {children({ panelCollapsed, onTogglePanel })}
                        </ErrorBoundary>
                    </Suspense>
                </div>
            </div>
        </ShellWrapper>
    );
}
