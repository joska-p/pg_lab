import { lazy } from 'react';
import { useParams } from 'react-router';

import { NotFound } from './components/NotFound';
import { ExperimentPage, StaticPage } from './components/Page';
import { getExperiment } from './experiments';
import type { ShellExperiment } from './experiments';

const HomeScene = lazy(() => import('./components/home/Scene').then((m) => ({ default: m.Scene })));

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
        <StaticPage experiment={HOME_EXPERIMENT}>
            <HomeScene />
        </StaticPage>
    );
}

export function NotFoundRoute() {
    return (
        <StaticPage experiment={NOT_FOUND_EXPERIMENT}>
            <NotFound />
        </StaticPage>
    );
}

export function ExperimentRoute() {
    const { experiment } = useParams();
    const currentExperiment = getExperiment(experiment);

    return currentExperiment ? (
        <ExperimentPage experiment={currentExperiment} />
    ) : (
        <NotFoundRoute />
    );
}
