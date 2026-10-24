import { borderWidth, space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

import type { ParamDef } from './data/pipeline-docs-data';

const styles = stylex.create({
    base: {
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        borderRadius: '6px',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: typography.fontSizeSm,
        color: surface.foreground,
    },
    head: {
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 10%, transparent)`,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightSemibold,
        letterSpacing: typography.letterSpacingWide,
        textTransform: 'uppercase',
    },
    headCell: {
        paddingBlock: space['2'],
        paddingInline: space['4'],
        borderBottom: `${borderWidth.hairline} solid`,
        borderBottomColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
    },
    bodyCell: {
        paddingBlock: space['2'],
        paddingInline: space['4'],
        borderBottom: `${borderWidth.hairline} solid`,
        borderBottomColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightMedium,
        color: `color-mix(in oklab, ${surface.foreground} 80%, transparent)`,
    },
    bodyCellLast: {
        borderBottom: 'none',
    },
    bodyCellName: {
        color: surface.foreground,
        fontWeight: typography.fontWeightMedium,
    },
});

interface ParamTableProps {
    params: ParamDef[];
}

function ParamTable({ params }: ParamTableProps) {
    return (
        <div {...stylex.props(styles.base)}>
            <table {...stylex.props(styles.table)}>
                <thead>
                    <tr {...stylex.props(styles.head)}>
                        <th {...stylex.props(styles.headCell)}>Name</th>
                        <th {...stylex.props(styles.headCell)}>Type</th>
                        <th {...stylex.props(styles.headCell)}>Default</th>
                        <th {...stylex.props(styles.headCell)}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {params.map((parameter) => (
                        <tr key={parameter.key}>
                            <td {...stylex.props(styles.bodyCell, styles.bodyCellName)}>
                                {parameter.key}
                            </td>
                            <td {...stylex.props(styles.bodyCell)}>number</td>
                            <td {...stylex.props(styles.bodyCell)}>{parameter.default}</td>
                            <td {...stylex.props(styles.bodyCell)}>{parameter.label}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export { ParamTable };
