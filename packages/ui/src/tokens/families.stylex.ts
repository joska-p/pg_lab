import * as stylex from "@stylexjs/stylex";
import { gruvboxPalette as palette } from "../consts/gruvbox-palette.stylex";

export type FamilyName =
  | "aurora"
  | "solder"
  | "neon-violet"
  | "amber"
  | "error"
  | "aqua"
  | "orange";

export type Family = {
  base: string;
  strong: string;
  ink?: { fg: string; bg: string };
};

// 1. StyleX exige des consts "plates" (string | number uniquement).
//    On aplatit donc chaque famille en plusieurs clés.
export const familiesConsts = stylex.defineVars({
  auroraBase: `light-dark(${palette.brightBlue}, ${palette.fadedBlue})`,
  auroraStrong: palette.neutralBlue,

  solderBase: `light-dark(${palette.brightGreen}, ${palette.fadedGreen})`,
  solderStrong: palette.neutralGreen,

  neonVioletBase: `light-dark(${palette.brightPurple}, ${palette.fadedPurple})`,
  neonVioletStrong: palette.neutralPurple,

  amberBase: `light-dark(${palette.brightYellow}, ${palette.fadedYellow})`,
  amberStrong: palette.neutralYellow,
  amberInkFg: `light-dark(${palette.dark0Hard}, ${palette.light1})`,
  amberInkBg: `light-dark(${palette.brightYellow}, ${palette.fadedYellow})`,

  errorBase: `light-dark(${palette.brightRed}, ${palette.fadedRed})`,
  errorStrong: palette.neutralRed,

  aquaBase: `light-dark(${palette.brightAqua}, ${palette.fadedAqua})`,
  aquaStrong: palette.neutralAqua,

  orangeBase: `light-dark(${palette.brightOrange}, ${palette.fadedOrange})`,
  orangeStrong: palette.neutralOrange,
} as const);

// 2. On reconstitue la structure imbriquée pratique (Family) à partir
//    des consts plates.
export const families: Record<FamilyName, Family> = {
  aurora: { base: familiesConsts.auroraBase, strong: familiesConsts.auroraStrong },
  solder: { base: familiesConsts.solderBase, strong: familiesConsts.solderStrong },
  "neon-violet": { base: familiesConsts.neonVioletBase, strong: familiesConsts.neonVioletStrong },
  amber: {
    base: familiesConsts.amberBase,
    strong: familiesConsts.amberStrong,
    ink: { fg: familiesConsts.amberInkFg, bg: familiesConsts.amberInkBg },
  },
  error: { base: familiesConsts.errorBase, strong: familiesConsts.errorStrong },
  aqua: { base: familiesConsts.aquaBase, strong: familiesConsts.aquaStrong },
  orange: { base: familiesConsts.orangeBase, strong: familiesConsts.orangeStrong },
};
