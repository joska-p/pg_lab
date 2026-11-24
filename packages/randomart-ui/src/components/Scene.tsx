import { useEffect } from 'react';

import { useCompiledShader } from '../stores/artworkStore';
import { useActiveEffects } from '../stores/postProcessingStore';
import { attachClock, detachSurface, setShaderError } from '../stores/surfaceStore';
import { AppErrorBoundary } from './AppErrorBoundary';
import { RandomArtCanvas } from './RandomArtCanvas';

export function Scene() {
    const compiledShader = useCompiledShader();
    const activeEffects = useActiveEffects();

    // The canvas and its clock only exist while this surface is mounted (StrictMode remounts too).
    useEffect(() => detachSurface, []);

    return (
        <AppErrorBoundary>
            <RandomArtCanvas
                fragmentShader={compiledShader.source}
                animated={compiledShader.animated}
                activeEffects={activeEffects}
                onShaderError={setShaderError}
                onClockStore={attachClock}
            />
        </AppErrorBoundary>
    );
}
