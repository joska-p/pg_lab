import { atlasStore } from "./store";

export function setSeed(seed: string) {
  atlasStore.setState({ seed });
}

export function setComplexity(complexity: number) {
  atlasStore.setState({ complexity });
}

export function setModulo(modulo: number) {
  atlasStore.setState({ modulo });
}

export function setPalette(palette: string | number) {
  atlasStore.setState({ palette: Number(palette) });
}

export function setGlitch(glitch: string | number) {
  atlasStore.setState({ glitch: Number(glitch) });
}

export function setSymbolType(symbolType: string | number) {
  atlasStore.setState({ symbolType: Number(symbolType) });
}
