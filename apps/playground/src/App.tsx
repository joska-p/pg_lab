import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Select } from '@repo/ui/components/Select';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { ThemeToggle } from '@repo/ui/components/ThemeToggle';
import { Activity, Suspense, use, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router';

import { experimentOptions, getExperiment, loadControls, loadScene } from './experiments';
import type { ExperimentId } from './experiments';
import { useShellBackground } from './stores/appStore';

function LoadingFallback() {
    const shellBackground = useShellBackground();

    return (
        <ShellWrapper background={shellBackground}>
            <Stage label="loading">
                <p>Loading…</p>
            </Stage>
        </ShellWrapper>
    );
}

function Navbar() {
    const { experiment } = useParams();
    const navigate = useNavigate();

    const currentExperiment = getExperiment(experiment);

    useEffect(() => {
        document.title = `${currentExperiment.label} · PG_LAB`;
    }, [currentExperiment]);

    const handleSelectChange = (value: ExperimentId) => {
        void navigate(`/${value === 'home' ? '' : value}`);
    };

    return (
        <>
            <Select
                value={currentExperiment.id}
                onValueChange={handleSelectChange}
                options={experimentOptions}
            />
            <ThemeToggle />
        </>
    );
}

function ExperimentLayout() {
    const shellBackground = useShellBackground();
    const { experiment } = useParams();

    const currentExperiment = getExperiment(experiment);

    useEffect(() => {
        document.title = `${currentExperiment.label} · PG_LAB`;
    }, [currentExperiment]);

    const sceneModule = use(loadScene(currentExperiment));
    const controlsModule = use(loadControls(currentExperiment));

    const { Scene, stageProps } = sceneModule;
    const { Controls } = controlsModule;

    return (
        <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ShellWrapper background={shellBackground}>
                    <ExperimentShell
                        panel={
                            <Activity>
                                <ControlPanel action={<Navbar />}>
                                    <Controls />
                                </ControlPanel>
                            </Activity>
                        }
                    >
                        <Stage label={currentExperiment.stageLabel} {...stageProps}>
                            <Activity>
                                <Scene />
                            </Activity>
                        </Stage>
                    </ExperimentShell>
                </ShellWrapper>
            </ErrorBoundary>
        </Suspense>
    );
}

export function App() {
    return (
        <Routes>
            <Route path="/" element={<ExperimentLayout />} />
            <Route path="/:experiment" element={<ExperimentLayout />} />
        </Routes>
    );
}
