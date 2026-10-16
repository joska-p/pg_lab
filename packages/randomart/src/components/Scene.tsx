import { RandomArtCanvas } from '../renderer';
import {
    setCanvas,
    setClockStore,
    setShaderError,
    useCompiledShader,
    useDuration,
} from '../stores/appStore';

export function Scene() {
    const compiledShader = useCompiledShader();
    const duration = useDuration();

    return (
        <RandomArtCanvas
            fragmentShader={compiledShader.source}
            animated={compiledShader.animated}
            duration={duration}
            onShaderError={setShaderError}
            onClockStore={setClockStore}
            onMount={(surface) => setCanvas(surface.canvas)}
        />
    );
}
