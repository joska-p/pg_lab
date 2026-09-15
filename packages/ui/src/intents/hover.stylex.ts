import * as stylex from "@stylexjs/stylex";
import { colorVariants } from "../tokens/colorVariants.stylex";

// Shared `background-color` hover per family — safe to share because, unlike
// selected/active states, `:hover` has no "last applied wins" ordering
// problem. Consumed by Button, Toggle-on and Checkbox-on (byte-identical),
// composable with any further surface.
export const intentHovers = stylex.create({
  primary: { backgroundColor: { ":hover": colorVariants.primaryBgHover } },
  secondary: { backgroundColor: { ":hover": colorVariants.secondaryBgHover } },
  accent: { backgroundColor: { ":hover": colorVariants.accentBgHover } },
  warning: { backgroundColor: { ":hover": colorVariants.warningBgHover } },
  destructive: { backgroundColor: { ":hover": colorVariants.destructiveBgHover } },
  muted: { backgroundColor: { ":hover": colorVariants.mutedBgHover } },
});
