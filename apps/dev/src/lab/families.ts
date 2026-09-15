import { gruvboxPalette as palette } from "@repo/ui/consts/gruvbox-palette.stylex";

// Lab probe: the Gruvbox tonal structure projected as "families" (a hue +
// two tensions), NOT as shadcn-style role variants. The experiment asks
// whether this projection keeps recurring across the vocabulary below — if
// it does, it may later deserve to become a token. For now it lives here,
// app-local, referencing the raw palette directly on purpose.
//
// base   — the light source: LEDs, fills, light fields, glass tint.
//          (bright in light mode, faded in dark mode).
// strong — the readable line/mark: chip stroke + text, thumb seed, hover
//          infusion (a neutral value valid in both modes).
export type LabFamily = {
  base: string;
  strong: string;
};

export const FAMILIES = {
  amber: {
    base: `light-dark(${palette.brightYellow}, ${palette.fadedYellow})`,
    strong: palette.neutralYellow,
  },
  violet: {
    base: `light-dark(${palette.brightPurple}, ${palette.fadedPurple})`,
    strong: palette.neutralPurple,
  },
  orange: {
    base: `light-dark(${palette.brightOrange}, ${palette.fadedOrange})`,
    strong: palette.neutralOrange,
  },
  aqua: {
    base: `light-dark(${palette.brightAqua}, ${palette.fadedAqua})`,
    strong: palette.neutralAqua,
  },
  red: {
    base: `light-dark(${palette.brightRed}, ${palette.fadedRed})`,
    strong: palette.neutralRed,
  },
  green: {
    base: `light-dark(${palette.brightGreen}, ${palette.fadedGreen})`,
    strong: palette.neutralGreen,
  },
} as const satisfies Record<string, LabFamily>;

export type LabFamilyName = keyof typeof FAMILIES;
