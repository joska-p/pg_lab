import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { useEffect } from 'react';

import { setOpenInLabHandler } from '../stores/bench/benchStore';
import {
    openCellInLab,
    setCanvas,
    setClockStore,
    setShaderError,
    useCompiledShader,
    useDuration,
} from '../stores/lab/labStore';
import { setMode, useMode } from '../stores/modeStore';
import { BenchStage } from './bench/BenchStage';
import { RandomArtCanvas } from './lab/RandomArtCanvas';

export function Scene() {
    const compiledShader = useCompiledShader();
    const duration = useDuration();
    const mode = useMode();

    // The bench hands a `(grammar, seed)` pair over; the app owns the Lab workspace and decides
    // that opening a cell switches to Lab. Registering here (rather than in `App`) makes the
    // handoff work when the playground mounts `Scene` and `Controls` without the app shell too.
    useEffect(() => {
        setOpenInLabHandler((grammar, seed) => {
            openCellInLab(grammar, seed);
            setMode('lab');
        });

        return () => {
            setOpenInLabHandler(null);
        };
    }, []);

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            {mode === 'bench' ? (
                <BenchStage />
            ) : (
                <RandomArtCanvas
                    fragmentShader={compiledShader.source}
                    animated={compiledShader.animated}
                    duration={duration}
                    onShaderError={setShaderError}
                    onClockStore={setClockStore}
                    onMount={(surface) => setCanvas(surface.canvas)}
                />
            )}
        </ErrorBoundary>
    );
}
