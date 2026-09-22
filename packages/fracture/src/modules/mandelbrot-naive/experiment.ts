import { lazy } from 'react';

export const Naive = lazy(() => import('./Naive').then((m) => ({ default: m.Naive })));

export const NaiveControls = lazy(() =>
    import('./NaiveControls').then((m) => ({ default: m.NaiveControls })),
);
