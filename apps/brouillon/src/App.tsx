import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';

import { Laboratory } from './experiments/stylex/laboratory';

export function App() {
    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <Laboratory />
        </ErrorBoundary>
    );
}
