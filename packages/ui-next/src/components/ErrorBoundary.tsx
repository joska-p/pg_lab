import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import { surfaceStyles } from '../recipes/surface';
import { space } from '../tokens/const.stylex';
import { Button } from './Button';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
        padding: space['4'],
    },

    header: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: space['3'],
    },

    message: {
        minWidth: 0,
        flex: 1,
        margin: 0,
    },

    stack: {
        maxHeight: '8rem',
        overflow: 'auto',
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
    },
});

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, info: ErrorInfo) => void;
    showStack?: boolean;
    style?: StyleXStyles;
}

interface ErrorBoundaryState {
    error: Error | null;
    stack: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    override state: ErrorBoundaryState = { error: null, stack: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error, stack: error.stack ?? null };
    }

    override componentDidCatch(error: Error, info: ErrorInfo) {
        this.props.onError?.(error, info);
    }

    private handleRetry = () => {
        this.setState({ error: null, stack: null });
    };

    override render() {
        const { children, fallback, showStack = true, style } = this.props;
        const { error, stack } = this.state;

        if (error) {
            if (fallback) {
                return fallback;
            }

            return (
                <div
                    role="alert"
                    {...stylex.props(
                        styles.base,
                        surfaceStyles({ color: 'error', background: 'solid', elevation: 'raised' }),
                        style,
                    )}
                >
                    <div {...stylex.props(styles.header)}>
                        <p {...stylex.props(styles.message)}>
                            {error.message || 'Something went wrong.'}
                        </p>
                        <Button onClick={this.handleRetry}>Retry</Button>
                    </div>
                    {showStack && stack ? <pre {...stylex.props(styles.stack)}>{stack}</pre> : null}
                </div>
            );
        }

        return children;
    }
}
