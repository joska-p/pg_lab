import { borderWidth, radius, space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
    base: {
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 10%, transparent)`,
        borderWidth: borderWidth.hairline,
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        borderRadius: radius.md,
        paddingBlock: space['3'],
        paddingInline: space['4'],
        maxWidth: '100%',
        overflowX: 'auto',
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        lineHeight: typography.lineHeightNormal,
        color: surface.foreground,
    },
    code: {
        display: 'block',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
    },
});

interface CodeBlockProps {
    code: string;
}

function CodeBlock({ code }: CodeBlockProps) {
    return (
        <pre {...stylex.props(styles.base)}>
            <code {...stylex.props(styles.code)}>{code}</code>
        </pre>
    );
}

export { CodeBlock };
