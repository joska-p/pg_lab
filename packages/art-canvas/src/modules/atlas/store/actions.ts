import { atlasStore } from './store';

export function setSeed(seed: string) {
    atlasStore.setState({ seed });
}

export function setComplexity(complexity: number) {
    atlasStore.setState({ complexity });
}

export function setModulo(modulo: number) {
    atlasStore.setState({ modulo });
}
