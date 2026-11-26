import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import * as stylex from '@stylexjs/stylex';
import { Suspense, use } from 'react';
import type { ReactNode } from 'react';

import { loadControls, loadScene } from '../experiments';
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

/* -------------------------------------------------------------------------- */
/* Frame : le chrome commun (titre, header, zone de travail, erreurs, loading) */
/* -------------------------------------------------------------------------- */

interface FrameProps {
    readonly experiment: ShellExperiment;
    readonly hasPanel?: boolean;
    readonly children: ReactNode;
}

function Page({ experiment, hasPanel = false, children }: FrameProps) {
    return (
        <ShellWrapper>
            {/* React 19 : <title> est remonté dans <head>, plus besoin d'effet. */}
            <title>{`${experiment.label} · PG_LAB`}</title>

            <div {...stylex.props(styles.page)}>
                <StudioHeader currentExperiment={experiment} hasPanel={hasPanel} />
                <div {...stylex.props(styles.workspace)}>
                    {/* key : l'erreur d'une expérience ne doit pas survivre à la navigation. */}
                    <ErrorBoundary key={experiment.id} showStack={import.meta.env.DEV}>
                        <Suspense
                            fallback={
                                <ExperimentShell stageLabel={experiment.stageLabel}>
                                    <p>Loading…</p>
                                </ExperimentShell>
                            }
                        >
                            {children}
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </div>
        </ShellWrapper>
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
            <ExperimentShell stageLabel={experiment.stageLabel}>{children}</ExperimentShell>
        </Page>
    );
}

/* -------------------------------------------------------------------------- */
/* ExperimentPage : une expérience du registre (Scene + Controls en lazy)      */
/* -------------------------------------------------------------------------- */

interface LoadedExperimentProps {
    readonly experiment: ExperimentDefinition;
}

function LoadedExperiment({ experiment }: LoadedExperimentProps) {
    // On lance les deux imports AVANT de suspendre, sinon les controls ne
    // démarrent qu'une fois la scène résolue (waterfall).
    const scenePromise = loadScene(experiment);
    const controlsPromise = loadControls(experiment);

    const { Scene, stageProps } = use(scenePromise);
    const controlsModule = use(controlsPromise);
    const Controls = controlsModule?.Controls;

    return (
        <ExperimentShell
            stageLabel={experiment.stageLabel}
            stageProps={stageProps}
            panel={
                Controls ? (
                    <ControlPanel title={experiment.panelTitle}>
                        <Controls />
                    </ControlPanel>
                ) : undefined
            }
        >
            <Scene />
        </ExperimentShell>
    );
}

interface ExperimentPageProps {
    readonly experiment: ExperimentDefinition;
}

export function ExperimentPage({ experiment }: ExperimentPageProps) {
    return (
        <Page experiment={experiment} hasPanel={experiment.loadControls !== undefined}>
            <LoadedExperiment experiment={experiment} />
        </Page>
    );
}
