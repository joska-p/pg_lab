import { ExperimentLayout } from '@repo/ui/components/ExperimentLayout';
import { lazy, use } from 'react';
import { useParams } from 'react-router';

import { NotFound } from './components/NotFound';
import { Page } from './components/Page';
import { getExperiment, loadExperiment } from './experiments';
import type { ExperimentEntry, PageMeta } from './experiments';

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
        <Page page={HOME_PAGE}>
            <ExperimentLayout stageLabel={HOME_PAGE.stageLabel}>
                <HomeScene />
            </ExperimentLayout>
        </Page>
    );
}

export function NotFoundRoute() {
    return (
        <Page page={NOT_FOUND_PAGE}>
            <ExperimentLayout stageLabel={NOT_FOUND_PAGE.stageLabel}>
                <NotFound />
            </ExperimentLayout>
        </Page>
    );
}

function LoadedExperiment({ experiment }: { readonly experiment: ExperimentEntry }) {
    const { Experiment } = use(loadExperiment(experiment));

    return <Experiment />;
}

export function ExperimentRoute() {
    const { experiment } = useParams();
    const currentExperiment = getExperiment(experiment);

    return currentExperiment ? (
        <Page page={currentExperiment}>
            <LoadedExperiment experiment={currentExperiment} />
        </Page>
    ) : (
        <NotFoundRoute />
    );
}
