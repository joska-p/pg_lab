import { RandomArtCanvas } from '../renderer';
import { setClockStore, setShaderError, useDuration, useFragmentShader } from '../stores/appStore';

export function Scene() {
    const fragmentShader = useFragmentShader();
    const duration = useDuration();

    return (
        <RandomArtCanvas
            fragmentShader={fragmentShader}
            duration={duration}
            onShaderError={setShaderError}
            onClockStore={setClockStore}
        />
    );
}
