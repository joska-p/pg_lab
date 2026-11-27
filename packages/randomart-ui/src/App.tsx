import { ExperimentWrapper } from '@repo/ui/components/ExperimentWrapper';

import { AppErrorBoundary } from './components/AppErrorBoundary';
import { Experiment } from './Experiment';

export function App() {
    return (
        <ExperimentWrapper>
            <AppErrorBoundary>
                <Experiment />
            </AppErrorBoundary>
        </ExperimentWrapper>
    );
}
