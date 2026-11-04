import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import type { ReactNode } from 'react';

export function AppErrorBoundary({ children }: { readonly children: ReactNode }) {
    return <ErrorBoundary showStack={import.meta.env.DEV}>{children}</ErrorBoundary>;
}
