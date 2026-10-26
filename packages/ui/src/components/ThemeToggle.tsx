import * as stylex from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex';
import { useSyncExternalStore } from 'react';

import { useTheme } from '../hooks/useTheme';
import type { SurfaceProps } from '../recipes/surface';
import { layout, motion } from '../tokens/const.stylex';
import { Button } from './Button';

const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

function subscribeToSystemTheme(onChange: () => void): () => void {
    const query = window.matchMedia(DARK_MODE_QUERY);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
}

function getSystemIsDark(): boolean {
    return window.matchMedia(DARK_MODE_QUERY).matches;
}

function getServerIsDark(): boolean {
    return false;
}

const styles = stylex.create({
    button: {
        flexShrink: 0,
        width: layout.controlTouchTarget,
        height: layout.controlTouchTarget,
        paddingBlock: 0,
        paddingInline: 0,
    },
    iconStack: {
        position: 'relative',
        display: 'block',
        width: layout.iconSize,
        height: layout.iconSize,
    },
    icon: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        transformOrigin: 'center',
        transitionProperty: 'opacity, transform',
        transitionDuration: {
            default: motion.durationNormal,
            '@media (prefers-reduced-motion: reduce)': '1ms',
        },
        transitionTimingFunction: motion.easingOut,
    },
    sunVisible: {
        opacity: 1,
        transform: 'rotate(0deg) scale(1)',
    },
    sunHidden: {
        opacity: 0,
        transform: 'rotate(-90deg) scale(0.55)',
    },
    moonVisible: {
        opacity: 1,
        transform: 'rotate(0deg) scale(1)',
    },
    moonHidden: {
        opacity: 0,
        transform: 'rotate(90deg) scale(0.55)',
    },
});

interface ThemeToggleProps
    extends
        Omit<React.ComponentProps<'button'>, 'style' | 'className' | 'color' | 'type' | 'children'>,
        SurfaceProps {
    style?: StyleXStyles;
}

export function ThemeToggle({
    color = 'neutral',
    background = 'soft',
    border = 'subtle',
    radius = 'full',
    elevation = 'raised',
    disabled = false,
    style,
    'aria-label': ariaLabel,
    onClick,
    ...props
}: ThemeToggleProps) {
    const [theme, setTheme] = useTheme();
    const systemIsDark = useSyncExternalStore(
        subscribeToSystemTheme,
        getSystemIsDark,
        getServerIsDark,
    );

    const isDark = theme === 'system' ? systemIsDark : theme === 'dark';
    const label = ariaLabel ?? (isDark ? 'Switch to light theme' : 'Switch to dark theme');

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
            setTheme(isDark ? 'light' : 'dark');
        }
    };

    return (
        <Button
            {...props}
            type="button"
            color={color}
            background={background}
            border={border}
            radius={radius}
            elevation={elevation}
            disabled={disabled}
            aria-label={label}
            onClick={handleClick}
            style={[styles.button, style]}
        >
            <span aria-hidden {...stylex.props(styles.iconStack)}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    {...stylex.props(styles.icon, isDark ? styles.sunHidden : styles.sunVisible)}
                >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                </svg>

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    {...stylex.props(styles.icon, isDark ? styles.moonVisible : styles.moonHidden)}
                >
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                </svg>
            </span>
        </Button>
    );
}
