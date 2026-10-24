import { manipulatorStore } from '../store';

function useImageSource() {
    return manipulatorStore((s) => s.imageSource);
}

export { useImageSource };
