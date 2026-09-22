import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import { colors } from '../tokens/colors.stylex';
import { familiesConsts } from '../tokens/families.stylex';
import { borderWidth, radius, space } from '../tokens/layout.stylex';
import { typography } from '../tokens/typography.stylex';
import { Button } from './Button';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
        padding: space['4'],
        borderRadius: radius.md,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${familiesConsts.errorStrong} 55%, ${colors.border})`,
        backgroundColor: `color-mix(in oklab, ${familiesConsts.errorBase} 10%, ${colors.card})`,
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
        color: colors.foreground,
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightMedium,
        lineHeight: typography.lineHeightTight,
    },

    stack: {
        maxHeight: '8rem',
        overflow: 'auto',
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        color: colors.mutedForeground,
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        lineHeight: typography.lineHeightRelaxed,
    },
});

interface ErrorBoundaryProps {
    children: ReactNode;
    /**
     * Rendered verbatim when an error is caught. Without it, the built-in alert box (message +
     * stack + Retry) is shown.
     */
    fallback?: ReactNode;
    onError?: (error: Error, info: ErrorInfo) => void;
    /** Show the stack trace in the default fallback. Gate it to dev in the caller. */
    showStack?: boolean;
    style?: StyleXStyles;
}

interface ErrorBoundaryState {
    error: Error | null;
    stack: string | null;
}

// Error boundaries require a class component to implement
// getDerivedStateFromError / componentDidCatch; function components cannot.
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
                <div role="alert" {...stylex.props(styles.base, style)}>
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
