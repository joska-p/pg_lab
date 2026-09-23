import { lazy } from 'react';

export const JuliaDoubleSplit = lazy(() =>
    import('./JuliaDoubleSplit').then((m) => ({ default: m.JuliaDoubleSplit })),
);

export const JuliaDoubleSplitControls = lazy(() =>
    import('./JuliaDoubleSplitControls').then((m) => ({ default: m.JuliaDoubleSplitControls })),
);
