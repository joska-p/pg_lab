import { create } from 'zustand';

interface VmState {
    seed: number;
    shareDepth: number;
    size: 'tiny' | 'small' | 'medium' | 'large';
    weights: Record<string, number>;
    setSeed: (s: number) => void;
    setShareDepth: (d: number) => void;
    setSize: (s: 'tiny' | 'small' | 'medium' | 'large') => void;
    setWeight: (op: string, w: number) => void;
    randomize: () => void;
}

export const useVmStore = create<VmState>((set) => ({
    seed: 12345,
    shareDepth: 1,
    size: 'small',
    weights: { x: 2, y: 1, const: 1, add: 2, mul: 1, sin: 1, cos: 1, neg: 1, sqr: 1 },
    setSeed: (seed) => set({ seed }),
    setShareDepth: (shareDepth) => set({ shareDepth }),
    setSize: (size) => set({ size }),
    setWeight: (op, w) => set((state) => ({ weights: { ...state.weights, [op]: w } })),
    randomize: () =>
        set({
            seed: Math.floor(Math.random() * 1000000),
            shareDepth: Math.floor(Math.random() * 4),
            size: (['tiny', 'small', 'medium', 'large'] as const)[Math.floor(Math.random() * 4)],
            weights: {
                x: Math.floor(Math.random() * 3) + 1,
                y: Math.floor(Math.random() * 3) + 1,
                const: Math.floor(Math.random() * 2),
                add: Math.floor(Math.random() * 3),
                mul: Math.floor(Math.random() * 3),
                sin: Math.floor(Math.random() * 3),
                cos: Math.floor(Math.random() * 2),
                neg: Math.floor(Math.random() * 2),
                sqr: Math.floor(Math.random() * 2),
            },
        }),
}));
