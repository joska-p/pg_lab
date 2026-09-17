import * as stylex from "@stylexjs/stylex";
import { layout } from "../consts/layout.stylex";

// Touch helper — carry the 44px touch floor WITHOUT growing the visible
// stroke. A real, invisible square (an empty absolutely-positioned span
// centered on the control) owns the extra hit area: pointer events on it
// bubble to the owning control, so hover/active/focus still fire on the
// visual box while the effective target stays ≥44×44. Never a pseudo-element.
export const touch = stylex.create({
  hit: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: layout.controlTouchTarget,
    height: layout.controlTouchTarget,
  },
});
