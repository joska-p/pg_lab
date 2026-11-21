import { Button } from '@repo/ui/components/Button';
import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Select } from '@repo/ui/components/Select';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Stage } from '@repo/ui/components/Stage';
import { ThemeToggle } from '@repo/ui/components/ThemeToggle';
import { surfaceStyle } from '@repo/ui/recipes/surface';
import { borderWidth, space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';
import { Activity, Suspense, use, useEffect, useState } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router';

import {
    EXPERIMENTS,
    experimentOptions,
    getExperiment,
    loadControls,
    loadScene,
} from './experiments';
import type { ExperimentDefinition, ExperimentId } from './experiments';
import { useShellBackground } from './stores/appStore';

const styles = stylex.create({
    workbench: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: space['2'],
        paddingBlock: space['1'],
        borderBottomWidth: borderWidth.hairline,
        borderBottomStyle: 'solid',
        borderBottomColor: `color-mix(in oklab, ${surface.foreground} 12%, transparent)`,
        gap: space['2'],
        flexShrink: 0,
        zIndex: 10,
        '@media (min-width: 1024px)': {
            gap: space['4'],
            paddingInline: space['4'],
        },
    },
    brandGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: space['3'],
        minWidth: 0,
        flex: 1,
    },
    brand: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightBold,
        letterSpacing: typography.letterSpacingWide,
        textTransform: typography.textCaseUppercase,
        color: surface.foreground,
        whiteSpace: 'nowrap',
    },
    divider: {
        width: '1px',
        height: '1.2rem',
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 18%, transparent)`,
        flexShrink: 0,
    },
    selectWrap: {
        minWidth: '160px',
        maxWidth: '320px',
        flex: 1,
    },
    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: space['2'],
        flexShrink: 0,
    },
    toggleButton: {
        paddingBlock: space['1'],
        paddingInline: space['3'],
        gap: space['2'],
    },
    toggleText: {
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightMedium,
        display: {
            default: 'inline',
            '@media (max-width: 640px)': 'none',
        },
    },
    workspace: {
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        position: 'relative',
        display: 'flex',
    },
});

function LoadingFallback() {
    const shellBackground = useShellBackground();

    return (
        <ShellWrapper background={shellBackground}>
            <Stage label="loading">
                <p>Loading…</p>
            </Stage>
        </ShellWrapper>
    );
}

function StudioHeader({
    currentExperiment,
    panelCollapsed,
    onTogglePanel,
}: {
    currentExperiment: ExperimentDefinition;
    panelCollapsed: boolean;
    onTogglePanel: () => void;
}) {
    const navigate = useNavigate();

    const handleSelectChange = (value: ExperimentId) => {
        void navigate(`/${value === 'home' ? '' : value}`);
    };

    return (
        <header
            {...stylex.props(
                surfaceStyle({
                    background: 'soft',
                    border: 'none',
                    elevation: 'flat',
                }),
                styles.header,
            )}
        >
            <div {...stylex.props(styles.brandGroup)}>
                <span {...stylex.props(styles.brand)}>PG_LAB</span>
                <span {...stylex.props(styles.divider)} aria-hidden="true" />
                <div {...stylex.props(styles.selectWrap)}>
                    <Select
                        aria-label="Sélectionner une expérience"
                        font="sans"
                        value={currentExperiment.id}
                        onValueChange={handleSelectChange}
                        options={experimentOptions}
                    />
                </div>
            </div>

            <div {...stylex.props(styles.headerActions)}>
                <Button
                    background="soft"
                    border="subtle"
                    radius="md"
                    elevation="flat"
                    aria-label={
                        panelCollapsed
                            ? 'Afficher les contrôles (Cmd+B)'
                            : 'Masquer les contrôles (Cmd+B)'
                    }
                    aria-expanded={!panelCollapsed}
                    onClick={onTogglePanel}
                    style={styles.toggleButton}
                    title={
                        panelCollapsed
                            ? 'Afficher les contrôles (Cmd+B)'
                            : 'Masquer les contrôles (Cmd+B)'
                    }
                >
                    <svg
                        viewBox="0 0 16 16"
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <rect x="2" y="2" width="12" height="12" rx="2" />
                        <path d="M10 2v12" />
                    </svg>
                    <span {...stylex.props(styles.toggleText)}>
                        {panelCollapsed ? 'Contrôles' : 'Plein écran'}
                    </span>
                </Button>
                <ThemeToggle />
            </div>
        </header>
    );
}

function ExperimentContent({
    currentExperiment,
    panelCollapsed,
    onCollapsedChange,
}: {
    currentExperiment: ExperimentDefinition;
    panelCollapsed: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
}) {
    const sceneModule = use(loadScene(currentExperiment));
    const controlsModule = use(loadControls(currentExperiment));

    const { Scene, stageProps } = sceneModule;
    const { Controls } = controlsModule;

    return (
        <ExperimentShell
            collapsed={panelCollapsed}
            onCollapsedChange={onCollapsedChange}
            panel={
                <Activity>
                    <ControlPanel title={currentExperiment.panelTitle}>
                        <Controls />
                    </ControlPanel>
                </Activity>
            }
        >
            <Stage label={currentExperiment.stageLabel} {...stageProps}>
                <Activity>
                    <Scene />
                </Activity>
            </Stage>
        </ExperimentShell>
    );
}

function ExperimentLayout() {
    const shellBackground = useShellBackground();
    const { experiment } = useParams();
    const navigate = useNavigate();
    const [panelCollapsed, setPanelCollapsed] = useState(false);

    const currentExperiment = getExperiment(experiment);

    useEffect(() => {
        document.title = `${currentExperiment.label} · PG_LAB`;
    }, [currentExperiment]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target;
            if (target instanceof HTMLElement) {
                const tag = target.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
                    return;
                }
            }

            if ((event.key === 'b' && (event.metaKey || event.ctrlKey)) || event.key === '\\') {
                event.preventDefault();
                setPanelCollapsed((prev) => !prev);
                return;
            }

            if (event.key === '[' || event.key === ']') {
                const currentIndex = EXPERIMENTS.findIndex((e) => e.id === currentExperiment.id);
                if (currentIndex === -1) {
                    return;
                }

                event.preventDefault();
                const nextIndex =
                    event.key === '['
                        ? (currentIndex - 1 + EXPERIMENTS.length) % EXPERIMENTS.length
                        : (currentIndex + 1) % EXPERIMENTS.length;
                const nextExp = EXPERIMENTS[nextIndex];
                if (nextExp) {
                    void navigate(`/${nextExp.id === 'home' ? '' : nextExp.id}`);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentExperiment.id, navigate]);

    return (
        <ShellWrapper background={shellBackground}>
            <div {...stylex.props(styles.workbench)}>
                <StudioHeader
                    currentExperiment={currentExperiment}
                    panelCollapsed={panelCollapsed}
                    onTogglePanel={() => setPanelCollapsed((prev) => !prev)}
                />
                <div {...stylex.props(styles.workspace)}>
                    <Suspense fallback={<LoadingFallback />}>
                        <ErrorBoundary showStack={import.meta.env.DEV}>
                            <ExperimentContent
                                currentExperiment={currentExperiment}
                                panelCollapsed={panelCollapsed}
                                onCollapsedChange={setPanelCollapsed}
                            />
                        </ErrorBoundary>
                    </Suspense>
                </div>
            </div>
        </ShellWrapper>
    );
}

export function App() {
    return (
        <Routes>
            <Route path="/" element={<ExperimentLayout />} />
            <Route path="/:experiment" element={<ExperimentLayout />} />
        </Routes>
    );
}
