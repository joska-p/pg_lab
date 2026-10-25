import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Select } from '@repo/ui/components/Select';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { Activity, Suspense, use, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router';

import { EXPERIMENTS, loadControls, loadScene } from './experiments';
import type { ExperimentKey } from './experiments';
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

const experimentKeys = Object.keys(EXPERIMENTS) as ExperimentKey[];
const OPTIONS = experimentKeys.map((value) => ({
    value,
    label: EXPERIMENTS[value].label,
}));

function ExperimentLayout() {
    const shellBackground = useShellBackground();
    const { experiment } = useParams<{ experiment: ExperimentKey }>();
    const navigate = useNavigate();
    const currentKey = experiment ?? 'home';
    const exp = EXPERIMENTS[currentKey];

    useEffect(() => {
        document.title = `${exp.label} · PG_LAB`;
    }, [exp]);

    const handleSelectChange = (value: ExperimentKey) => {
        navigate(`/${value === 'home' ? '' : value}`);
    };

    const sceneModule = use(loadScene(currentKey));
    const controlsModule = use(loadControls(currentKey));
    const { Scene, stageProps } = sceneModule;
    const { Controls } = controlsModule;

    return (
        <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <ShellWrapper background={shellBackground}>
                    <ExperimentShell
                        panel={
                            <Activity>
                                <ControlPanel>
                                    <Select
                                        value={currentKey}
                                        onValueChange={handleSelectChange}
                                        options={OPTIONS}
                                    />
                                    <Controls />
                                </ControlPanel>
                            </Activity>
                        }
                    >
                        <Stage label={exp.stageLabel} {...stageProps}>
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
