import * as stylex from '@stylexjs/stylex';

import { space } from './const.stylex';

export const gaps = stylex.create({
    '0': { gap: space['0'] },
    '1': { gap: space['1'] },
    '2': { gap: space['2'] },
    '3': { gap: space['3'] },
    '4': { gap: space['4'] },
    '5': { gap: space['5'] },
    '6': { gap: space['6'] },
    '8': { gap: space['8'] },
    '10': { gap: space['10'] },
    '12': { gap: space['12'] },
    '16': { gap: space['16'] },
});

export const justifyContent = stylex.create({
    start: {
        justifyContent: 'flex-start',
    },
    center: {
        justifyContent: 'center',
    },
    end: {
        justifyContent: 'flex-end',
    },
    between: {
        justifyContent: 'space-between',
    },
    around: {
        justifyContent: 'space-around',
    },
    evenly: {
        justifyContent: 'space-evenly',
    },
});
