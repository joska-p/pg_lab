import { palette } from '@repo/ui/tokens/const.stylex';

import type { Label } from './core/types';

export const CHART_SAMPLE_LIMIT = 100;

export const labelToColorMap: Record<Label, string> = {
    car: palette.brightRed,
    fish: palette.brightBlue,
    house: palette.brightBlue,
    tree: palette.brightGreen,
    bicycle: palette.brightYellow,
    guitar: palette.brightPurple,
    pencil: palette.brightAqua,
    clock: palette.brightOrange,
};
