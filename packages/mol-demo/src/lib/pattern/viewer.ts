// Shared handle between the 3D viewer and the diffraction pattern.
// Lives in mol-demo (not glaze3d): the lib never knows about the pattern,
// the pattern only reads `camera.matrixWorldInverse.elements` from outside.

import type { OrbitControls } from '@repo/glaze3d/controls';
import type { PerspectiveCamera } from '@repo/glaze3d/core';

export type ViewerHandle = {
    camera: PerspectiveCamera | null;
    controls: OrbitControls | null;
    // P2: single RAF owner is the viewer loop (MolCanvas). The pattern
    // registers its on-demand redraw here; the viewer calls it every frame
    // and the pattern itself early-outs (throttle + angle eps). glaze3d
    // stays unaware — this handle lives in mol-demo.
    requestPatternDraw: (() => void) | null;
};

export type ViewerRef = {
    current: ViewerHandle | null;
};
