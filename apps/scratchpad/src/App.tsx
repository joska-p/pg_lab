import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Segmented } from '@repo/ui/components/Segmented';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { ThemeToggle } from '@repo/ui/components/ThemeToggle';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { RandomartPipeline } from './RandomartPipeline';
import { Workbench } from './Workbench';

const styles = stylex.create({
    switcher: {
        position: 'fixed',
        right: '18px',
        bottom: '18px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        borderRadius: '12px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(#d8dbd3, #343b45)',
        backgroundColor: 'light-dark(#ffffff, #1d222b)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
    },
});

export function App() {
    const [view, setView] = useState<'doc' | 'workbench'>('doc');

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            {view === 'doc' ? (
                <ShellWrapper>
                    <RandomartPipeline />
                </ShellWrapper>
            ) : (
                <Workbench />
            )}
            <div {...stylex.props(styles.switcher)}>
                <Segmented<'doc' | 'workbench'>
                    label="Vue"
                    color="purple"
                    value={view}
                    onValueChange={setView}
                    options={[
                        { value: 'doc', label: 'Guide seed 42' },
                        { value: 'workbench', label: 'Workbench' },
                    ]}
                />
                <ThemeToggle aria-label="Changer de thème" />
            </div>
        </ErrorBoundary>
    );
}
