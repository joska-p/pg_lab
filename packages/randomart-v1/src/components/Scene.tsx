import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';

import {
    setCanvas,
    setClockStore,
    setShaderError,
    useCompiledShader,
    useDuration,
} from '../stores/labStore';
import { RandomArtCanvas } from './lab/RandomArtCanvas';

export function Scene() {
    const compiledShader = useCompiledShader();
    const duration = useDuration();

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <RandomArtCanvas
                fragmentShader={compiledShader.source}
                animated={compiledShader.animated}
                duration={duration}
                onShaderError={setShaderError}
                onClockStore={setClockStore}
                onMount={(surface) => setCanvas(surface.canvas)}
            />
        </ErrorBoundary>
    );
}
