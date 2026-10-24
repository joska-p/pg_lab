import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';

import { Docs } from './docs/components/Docs';

export function App() {
    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <Docs />
        </ErrorBoundary>
    );
}
