import { Suspense, lazy } from 'react';
import { useParams } from 'react-router';

import { ExperimentContent } from './components/ExperimentContent';
import { ExperimentLayout } from './components/ExperimentLayout';
import { NotFound } from './components/NotFound';
import { getExperiment } from './experiments';
import type { ShellExperiment } from './experiments';

const HomeScene = lazy(() => import('./components/home/Scene').then((m) => ({ default: m.Scene })));
const Loading = () => <p>Loading…</p>;

const HOME_EXPERIMENT: ShellExperiment = {
    id: 'home',
    label: 'Maison',
    stageLabel: 'home',
    tint: 'aqua',
    summary: '',
    mark: 'home',
};

const NOT_FOUND_EXPERIMENT: ShellExperiment = {
    id: '404',
    label: 'Introuvable',
    stageLabel: '404',
    tint: 'aqua',
    summary: '',
    mark: 'home',
};

export function HomeRoute() {
    return (
        <ExperimentLayout currentExperiment={HOME_EXPERIMENT} hasPanel={false}>
            {() => (
                <Suspense fallback={<Loading />}>
                    <HomeScene />
                </Suspense>
            )}
        </ExperimentLayout>
    );
}

export function NotFoundRoute() {
    return (
        <ExperimentLayout currentExperiment={NOT_FOUND_EXPERIMENT} hasPanel={false}>
            {() => <NotFound />}
        </ExperimentLayout>
    );
}

export function ExperimentRoute() {
    const { experiment } = useParams();
    const currentExperiment = getExperiment(experiment);

    if (!currentExperiment) {
        return <NotFoundRoute />;
    }

    return (
        <ExperimentLayout
            currentExperiment={currentExperiment}
            hasPanel={currentExperiment.loadControls != null}
        >
            {({ panelCollapsed, onTogglePanel }) => (
                <ExperimentContent
                    currentExperiment={currentExperiment}
                    panelCollapsed={panelCollapsed}
                    onCollapsedChange={onTogglePanel}
                />
            )}
        </ExperimentLayout>
    );
}
