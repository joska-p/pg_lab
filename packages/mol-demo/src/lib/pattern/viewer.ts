// Shared handle between the 3D viewer and the diffraction pattern.
// Lives in mol-demo (not glaze3d): the lib never knows about the pattern,
// the pattern only reads `camera.matrixWorldInverse.elements` from outside.

import type { OrbitControls } from "@repo/glaze3d/controls";
import type { PerspectiveCamera } from "@repo/glaze3d/core";

export type ViewerHandle = {
  camera: PerspectiveCamera | null;
  controls: OrbitControls | null;
};

export type ViewerRef = {
  current: ViewerHandle | null;
};
