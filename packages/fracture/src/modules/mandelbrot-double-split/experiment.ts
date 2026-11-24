import { lazy } from 'react';

export const DoubleSplit = lazy(() =>
    import('./DoubleSplit').then((m) => ({ default: m.DoubleSplit })),
);

export const DoubleSplitControls = lazy(() =>
    import('./DoubleSplitControls').then((m) => ({ default: m.DoubleSplitControls })),
);
