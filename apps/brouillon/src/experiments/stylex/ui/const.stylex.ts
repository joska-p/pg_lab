import * as stylex from '@stylexjs/stylex';

export const gruvboxPalette = stylex.defineConsts({
    // Dark grounds & foregrounds
    dark0Hard: 'oklch(0.241 0.005 219.672)',
    dark0: 'oklch(0.277 0 0)',
    dark0Soft: 'oklch(0.311 0.003 48.619)',
    dark1: 'oklch(0.344 0.007 48.523)',
    dark2: 'oklch(0.411 0.012 51.866)',
    dark3: 'oklch(0.482 0.018 61.042)',
    dark4: 'oklch(0.55 0.023 62.567)',

    // Gray
    gray245: 'oklch(0.619 0.029 67.258)',
    gray244: 'oklch(0.619 0.029 67.258)',

    // Light grounds & foregrounds
    light0Hard: 'oklch(0.965 0.039 100.862)',
    light0: 'oklch(0.956 0.055 96.155)',
    light0Soft: 'oklch(0.922 0.055 92.526)',
    light1: 'oklch(0.894 0.057 89.24)',
    light2: 'oklch(0.825 0.051 85.116)',
    light3: 'oklch(0.756 0.041 82.284)',
    light4: 'oklch(0.69 0.035 76.307)',

    // Bright accents
    brightRed: 'oklch(0.66 0.218 30.392)',
    brightGreen: 'oklch(0.765 0.158 110.835)',
    brightYellow: 'oklch(0.832 0.159 82.987)',
    brightBlue: 'oklch(0.693 0.042 169.768)',
    brightPurple: 'oklch(0.705 0.098 2.189)',
    brightAqua: 'oklch(0.756 0.108 137.676)',
    brightOrange: 'oklch(0.731 0.182 51.693)',

    // Neutral accents
    neutralRed: 'oklch(0.546 0.203 28.662)',
    neutralGreen: 'oklch(0.656 0.135 109.119)',
    neutralYellow: 'oklch(0.725 0.143 77.708)',
    neutralBlue: 'oklch(0.576 0.066 199.487)',
    neutralPurple: 'oklch(0.597 0.111 352.218)',
    neutralAqua: 'oklch(0.645 0.094 145.266)',
    neutralOrange: 'oklch(0.622 0.171 45.812)',

    // Faded accents
    fadedRed: 'oklch(0.437 0.179 28.26)',
    fadedGreen: 'oklch(0.546 0.112 106.464)',
    fadedYellow: 'oklch(0.618 0.128 70.674)',
    fadedBlue: 'oklch(0.471 0.082 215.806)',
    fadedPurple: 'oklch(0.489 0.124 344.276)',
    fadedAqua: 'oklch(0.534 0.082 155.401)',
    fadedOrange: 'oklch(0.513 0.162 39.297)',
});

export const typography = stylex.defineConsts({
    fontFamilySans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontFamilyMono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',

    fontSizeXs: '0.75rem',
    fontSizeSm: '0.875rem',
    fontSizeMd: '1rem',
    fontSizeLg: '1.125rem',
    fontSizeXl: '1.25rem',
    fontSize2xl: '1.875rem',
    fontSize3xl: '2.25rem',

    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,

    lineHeightTight: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,

    letterSpacingTight: '-0.01em',
    letterSpacingNormal: '0',
    letterSpacingWide: '0.02em',

    textCaseUppercase: 'uppercase',
});

export const space = stylex.defineConsts({
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
});

export const radius = stylex.defineConsts({
    none: '0px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
});

export const borderWidth = stylex.defineConsts({
    hairline: '1px',
});

export const zIndex = stylex.defineConsts({
    base: 0,
    canvas: 1,
    panel: 50,
    overlay: 100,
    modal: 300,
});

export const breakpoints = stylex.defineConsts({
    narrowMax: 720,
    wideMin: 1024,
});

export const media = stylex.defineConsts({
    narrow: '@media (max-width: 720px)',
    wide: '@media (min-width: 1024px)',
    portrait: '@media (orientation: portrait)',
});

export const layout = stylex.defineConsts({
    panelWidth: '320px',
    panelMaxMobileHeight: '300px',
    panelGap: '12px',

    controlFieldMinHeight: '44px',

    controlTouchTarget: '44px',

    toggleTrackWidth: '34px',
    toggleTrackHeight: '20px',
    toggleKnobSize: '14px',
    toggleKnobTravel: '16px',

    checkboxSize: '18px',
    checkboxMarkSize: '12px',

    radioOptionMinHeight: '28px',
    radioCircleSize: '16px',
    radioDotSize: '8px',

    segmentPadBlock: '1px',
    ledAtomSize: '7px',

    colorSwatchWidth: '36px',
    colorSwatchHeight: '26px',
    colorSwatchPad: '2px',

    chevronSize: '12px',
    spinnerSize: '12px',
    spinnerRingWidth: '2px',
    chipPadBlock: '2px',

    sliderRailHeight: '4px',
    sliderThumbSize: '14px',

    swatchMinWidth: '160px',
    swatchHeight: '64px',
    textMaxWidth: '62ch',
});
