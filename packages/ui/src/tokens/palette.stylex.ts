import * as stylex from "@stylexjs/stylex";

export const gruvboxPalette = stylex.defineConsts({
  // Dark grounds & foregrounds
  dark0Hard: "oklch(0.241 0.005 219.672)",
  dark0: "oklch(0.277 0 0)",
  dark0Soft: "oklch(0.311 0.003 48.619)",
  dark1: "oklch(0.344 0.007 48.523)",
  dark2: "oklch(0.411 0.012 51.866)",
  dark3: "oklch(0.482 0.018 61.042)",
  dark4: "oklch(0.55 0.023 62.567)",

  // Gray
  gray245: "oklch(0.619 0.029 67.258)",
  gray244: "oklch(0.619 0.029 67.258)",

  // Light grounds & foregrounds
  light0Hard: "oklch(0.965 0.039 100.862)",
  light0: "oklch(0.956 0.055 96.155)",
  light0Soft: "oklch(0.922 0.055 92.526)",
  light1: "oklch(0.894 0.057 89.24)",
  light2: "oklch(0.825 0.051 85.116)",
  light3: "oklch(0.756 0.041 82.284)",
  light4: "oklch(0.69 0.035 76.307)",

  // Bright accents
  brightRed: "oklch(0.66 0.218 30.392)",
  brightGreen: "oklch(0.765 0.158 110.835)",
  brightYellow: "oklch(0.832 0.159 82.987)",
  brightBlue: "oklch(0.693 0.042 169.768)",
  brightPurple: "oklch(0.705 0.098 2.189)",
  brightAqua: "oklch(0.756 0.108 137.676)",
  brightOrange: "oklch(0.731 0.182 51.693)",

  // Neutral accents
  neutralRed: "oklch(0.546 0.203 28.662)",
  neutralGreen: "oklch(0.656 0.135 109.119)",
  neutralYellow: "oklch(0.725 0.143 77.708)",
  neutralBlue: "oklch(0.576 0.066 199.487)",
  neutralPurple: "oklch(0.597 0.111 352.218)",
  neutralAqua: "oklch(0.645 0.094 145.266)",
  neutralOrange: "oklch(0.622 0.171 45.812)",

  // Faded accents
  fadedRed: "oklch(0.437 0.179 28.26)",
  fadedGreen: "oklch(0.546 0.112 106.464)",
  fadedYellow: "oklch(0.618 0.128 70.674)",
  fadedBlue: "oklch(0.471 0.082 215.806)",
  fadedPurple: "oklch(0.489 0.124 344.276)",
  fadedAqua: "oklch(0.534 0.082 155.401)",
  fadedOrange: "oklch(0.513 0.162 39.297)",
});

export type GruvboxColorName = keyof typeof gruvboxPalette;
export type GruvboxHex = (typeof gruvboxPalette)[GruvboxColorName];
