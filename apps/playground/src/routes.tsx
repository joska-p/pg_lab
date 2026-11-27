import { lazy } from 'react';
import { useParams } from 'react-router';

import { NotFound } from './components/NotFound';
import { ExperimentPage, StaticPage } from './components/Page';
import { getExperiment } from './experiments';
import type { PageMeta } from './experiments';

const HomeScene = lazy(() => import('./components/home/Scene').then((m) => ({ default: m.Scene })));

const HOME_PAGE: PageMeta = {
    id: 'home',
    label: 'Maison',
    stageLabel: 'home',
    tint: 'aqua',
    mark: 'home',
};

const NOT_FOUND_PAGE: PageMeta = {
    id: '404',
    label: 'Introuvable',
    stageLabel: '404',
    tint: 'aqua',
    mark: 'home',
};

export function HomeRoute() {
    return (
        <StaticPage page={HOME_PAGE}>
            <HomeScene />
        </StaticPage>
    );
}

export function NotFoundRoute() {
    return (
        <StaticPage page={NOT_FOUND_PAGE}>
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
