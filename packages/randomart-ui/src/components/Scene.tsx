import { useEffect } from 'react';

import { useCompiledShader } from '../stores/artworkStore';
import { useDuration } from '../stores/playbackStore';
import { attachClock, detachSurface, setShaderError, useClockStore } from '../stores/surfaceStore';
import { AppErrorBoundary } from './AppErrorBoundary';
import { RandomArtCanvas } from './RandomArtCanvas';

export function Scene() {
    const compiledShader = useCompiledShader();
    const duration = useDuration();
    const clockStore = useClockStore();

    // GpuCanvas reads `clockOptions` once, when it creates the GPU stack; changing the duration
    // prop alone never reaches the clock. Push it imperatively, and again when the clock attaches.
    useEffect(() => {
        clockStore?.setDuration(duration);
    }, [clockStore, duration]);

    // The canvas and its clock only exist while this surface is mounted (StrictMode remounts too).
    useEffect(() => detachSurface, []);

    return (
        <AppErrorBoundary>
            <RandomArtCanvas
                fragmentShader={compiledShader.source}
                animated={compiledShader.animated}
                duration={duration}
                onShaderError={setShaderError}
                onClockStore={attachClock}
            />
        </AppErrorBoundary>
    );
}
