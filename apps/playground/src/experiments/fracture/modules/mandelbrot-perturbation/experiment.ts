import { lazy } from 'react';

export const Perturbation = lazy(() =>
    import('./Perturbation').then((m) => ({ default: m.Perturbation })),
);

export const PerturbationControls = lazy(() =>
    import('./PerturbationControls').then((m) => ({ default: m.PerturbationControls })),
);
