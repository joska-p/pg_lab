import { ErrorBoundary } from '@repo/ui-next/components/ErrorBoundary';

import { Laboratory } from './experiments/stylex/laboratory';

export function App() {
    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <Laboratory />
        </ErrorBoundary>
    );
}
