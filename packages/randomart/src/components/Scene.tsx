import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';

import { RandomArtCanvas } from '../renderer';
import {
    setCanvas,
    setClockStore,
    setShaderError,
    useCompiledShader,
    useDuration,
    useMode,
} from '../stores/appStore';
import { GalleryStage } from './gallery/GalleryStage';

export function Scene() {
    const compiledShader = useCompiledShader();
    const duration = useDuration();
    const mode = useMode();

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            {mode === 'gallery' ? (
                <GalleryStage />
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
