import { surfaceStyles } from '@repo/ui/recipes/surface';
import { typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

import type { ParamDef } from '../data/pipeline-docs-data';

const styles = stylex.create({
    wrapper: {
        overflow: 'hidden',
        borderRadius: '0.5rem',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${surface.foreground} 12%, transparent)`,
    },
    table: {
        width: '100%',
        textAlign: 'left',
        fontSize: typography.fontSizeSm,
        borderCollapse: 'collapse',
    },
    th: {
        padding: '0.625rem 1rem',
        fontSize: typography.fontSizeXs,
        fontWeight: typography.fontWeightSemibold,
        textTransform: 'uppercase' as const,
        letterSpacing: typography.letterSpacingWide,
        opacity: 0.6,
    },
    td: {
        padding: '0.625rem 1rem',
        fontSize: typography.fontSizeXs,
        borderTopWidth: '1px',
        borderTopStyle: 'solid' as const,
        borderTopColor: `color-mix(in oklab, ${surface.foreground} 10%, transparent)`,
    },
    tdPrimary: {
        fontWeight: typography.fontWeightMedium,
    },
    tdMuted: {
        opacity: 0.7,
    },
});

interface ParamTableProps {
    params: ParamDef[];
}

function ParamTable({ params }: ParamTableProps) {
    return (
        <div {...stylex.props(styles.wrapper)}>
            <table {...stylex.props(styles.table)}>
                <thead>
                    <tr {...stylex.props(surfaceStyles({ background: 'soft' }))}>
                        <th {...stylex.props(styles.th)}>Name</th>
                        <th {...stylex.props(styles.th)}>Type</th>
                        <th {...stylex.props(styles.th)}>Default</th>
                        <th {...stylex.props(styles.th)}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {params.map((param) => (
                        <tr key={param.key}>
                            <td {...stylex.props(styles.td, styles.tdPrimary)}>{param.key}</td>
                            <td {...stylex.props(styles.td, styles.tdMuted)}>number</td>
                            <td {...stylex.props(styles.td, styles.tdMuted)}>{param.default}</td>
                            <td {...stylex.props(styles.td, styles.tdMuted)}>{param.label}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export { ParamTable };
