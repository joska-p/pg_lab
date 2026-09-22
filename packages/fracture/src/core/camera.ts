/**
 * Wheel zoom factor for the fracture scenes. Glaze's ZoomGesture applies `exp(−deltaY · speed)`;
 * twice the glaze default (0.002) so the wheel keeps pace with the fracture shaders' zoom speed.
 */
export const ZOOM_WHEEL_SPEED = 1 / 250;
