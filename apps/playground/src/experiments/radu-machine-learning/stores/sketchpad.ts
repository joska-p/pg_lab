import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import { getPointCount } from '../core/api';
import type { Path } from '../core/types';

interface SketchpadStore {
    paths: Path[];
    strokeColor: string;
}

const sketchpadStore = createStore<SketchpadStore>(() => ({
    paths: [],
    strokeColor: '#fefefeff',
}));

/* Getters */

export function useSketchpadPaths(): Path[] {
    return useStore(sketchpadStore, (state) => state.paths);
}

export function useSketchpadStrokeColor(): string {
    return useStore(sketchpadStore, (state) => state.strokeColor);
}

export function useSketchpadPathCount(): number {
    return useStore(sketchpadStore, (state) => state.paths.length);
}

export function useSketchpadPointCount(): number {
    return useStore(sketchpadStore, (state) => getPointCount(state.paths));
}

/* Setters */

export function addPath(path: Path): void {
    sketchpadStore.setState((state) => ({ paths: [...state.paths, path] }));
}

export function undoPath(): void {
    sketchpadStore.setState((state) => ({ paths: state.paths.slice(0, -1) }));
}

export function clearPaths(): void {
    sketchpadStore.setState({ paths: [] });
}

export function setStrokeColor(color: string): void {
    sketchpadStore.setState({ strokeColor: color });
}

export { sketchpadStore };
