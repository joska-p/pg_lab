import { Button } from '@repo/ui/components/Button';
import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Segmented } from '@repo/ui/components/Segmented';
import { Select } from '@repo/ui/components/Select';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { Suspense, use, useEffect } from 'react';

import {
    EMPTY_CONTROLS,
    EXPERIMENTS,
    loadControls,
    loadScene,
    type ExperimentEntry,
} from './experiments';
import { useTheme, setTheme, usePageName, setPageName } from './stores/appStore';
import type { PageName } from './stores/appStore';
import { useHashRoute } from './useHashRoute';

const MENU_LABEL = 'Menu';

const PAGE_OPTIONS: { value: PageName; label: string }[] = [
    { value: 'menu', label: MENU_LABEL },
    ...Object.values(EXPERIMENTS).map((entry) => ({
        value: entry.id as PageName,
        label: entry.label,
    })),
];

function LoadingFallback() {
    return (
        <ShellWrapper>
            <Stage label="loading">
                <p>Loading…</p>
            </Stage>
        </ShellWrapper>
    );
}

function MenuPage() {
    const theme = useTheme();
    const pageName = usePageName();

    return (
        <ShellWrapper>
            <ExperimentShell
                panel={
                    <ControlPanel title="Controls">
                        <ControlSection title="Theme">
                            <Segmented<'light' | 'dark' | 'system'>
                                options={['light', 'dark', 'system']}
                                value={theme}
                                onValueChange={setTheme}
                            />
                        </ControlSection>
                        <ControlSection title="Navigation">
                            <Select<PageName>
                                value={pageName}
                                onValueChange={setPageName}
                                options={PAGE_OPTIONS}
                            />
                        </ControlSection>
                    </ControlPanel>
                }
            >
                <Stage label="playground">
                    <h1>playground</h1>
                </Stage>
            </ExperimentShell>
        </ShellWrapper>
    );
}

function ExperimentView({ entry }: { entry: ExperimentEntry }) {
    const sceneModule = use(loadScene(entry.id));
    const controlsModule = use(entry.loadControls ? loadControls(entry.id) : EMPTY_CONTROLS);
    const { Scene, stageProps } = sceneModule;
    const { Controls } = controlsModule;

    return (
        <ShellWrapper>
            <ExperimentShell
                panel={
                    <ControlPanel title={entry.panelTitle}>
                        <ControlSection title="Navigation">
                            <Button onClick={() => setPageName('menu')}>← Menu</Button>
                        </ControlSection>
                        <Controls />
                    </ControlPanel>
                }
            >
                <Stage label={entry.stageLabel} {...stageProps}>
                    <Scene />
                </Stage>
            </ExperimentShell>
        </ShellWrapper>
    );
}

function App() {
    const theme = useTheme();
    const pageName = usePageName();
    useHashRoute();

    useEffect(() => {
        document.documentElement.style.colorScheme = theme === 'system' ? 'light dark' : theme;
    }, [theme]);

    useEffect(() => {
        document.title = pageName === 'menu' ? 'PG_LAB' : `${EXPERIMENTS[pageName].label} · PG_LAB`;
    }, [pageName]);

    return (
        <Suspense fallback={<LoadingFallback />}>
            <ErrorBoundary showStack={import.meta.env.DEV}>
                {pageName === 'menu' ? (
                    <MenuPage />
                ) : (
                    <ExperimentView entry={EXPERIMENTS[pageName]} />
                )}
            </ErrorBoundary>
        </Suspense>
    );
}

export default App;
