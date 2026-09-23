import { lazy } from 'react';

export const Julia = lazy(() => import('./Julia').then((m) => ({ default: m.Julia })));

export const JuliaControls = lazy(() =>
    import('./JuliaControls').then((m) => ({ default: m.JuliaControls })),
);
