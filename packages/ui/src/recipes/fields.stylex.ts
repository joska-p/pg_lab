import * as stylex from '@stylexjs/stylex';

import { colors } from '../tokens/colors.stylex';
import { families } from '../tokens/families.stylex';
import { borderWidth, radius, space } from '../tokens/layout.stylex';
import { shadowColor, shadows } from '../tokens/shadows.stylex';

export const field = stylex.create({
    col: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
        flex: 1,
        minWidth: 'fit-content',
    },
    labelRow: {
        display: 'flex',
        alignItems: 'center',
        gap: space['2'],
    },
    well: {
        width: '100%',
        minWidth: 0,
        margin: 0,
        paddingBlock: space['2'],
        paddingInline: space['3'],
        borderRadius: radius.sm,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: colors.border,
        backgroundColor: colors.input,
        color: colors.foreground,
        [shadowColor.color]: colors.input,
        boxShadow: shadows.sunken,
        outline: 'none',
        ':focus': {
            borderColor: `color-mix(in oklab, ${colors.ring} 55%, ${colors.border})`,
            boxShadow: `0 0 0 2px ${colors.background}, 0 0 0 3px ${colors.ring}`,
        },
    },
    wellInvalid: {
        borderColor: families.orange.base,
        backgroundColor: `color-mix(in oklab, ${families.orange.base} 8%, ${colors.input})`,
        ':focus': {
            borderColor: families.orange.base,
            boxShadow: `0 0 0 2px ${colors.background}, 0 0 0 3px ${families.orange.base}`,
        },
    },
});
