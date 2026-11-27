import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentWrapper } from '@repo/ui/components/ExperimentWrapper';

import { Experiment } from './Experiment';

export function App() {
    return (
        <ExperimentWrapper background="auroral-fluid">
            <ErrorBoundary showStack={import.meta.env.DEV}>
                <Experiment />
            </ErrorBoundary>
        </ExperimentWrapper>
    );
}
