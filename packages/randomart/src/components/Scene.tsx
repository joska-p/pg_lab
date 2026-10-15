import { RandomArtCanvas } from '../renderer';
import {
    setCanvas,
    setClockStore,
    setShaderError,
    useCompiledShader,
    useDuration,
    useFragmentShader,
} from '../stores/appStore';

export function Scene() {
    const fragmentShader = useFragmentShader();
    const compiledShader = useCompiledShader();
    const duration = useDuration();

    return (
        <RandomArtCanvas
            fragmentShader={fragmentShader}
            animated={compiledShader.animated}
            duration={duration}
            onShaderError={setShaderError}
            onClockStore={setClockStore}
            onMount={(surface) => setCanvas(surface.canvas)}
        />
    );
}
