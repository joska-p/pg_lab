import { lazy } from 'react';

export const Mandelbrot = lazy(() =>
    import('./Mandelbrot').then((m) => ({ default: m.Mandelbrot })),
);

export const MandelbrotControls = lazy(() =>
    import('./MandelbrotControls').then((m) => ({ default: m.MandelbrotControls })),
);
