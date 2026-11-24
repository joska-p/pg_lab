import { typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
    pre: {
        maxWidth: '100%',
        overflowX: 'auto',
        borderRadius: '0.5rem',
        padding: '1rem',
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 6%, transparent)`,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${surface.foreground} 12%, transparent)`,
    },
});

interface CodeBlockProps {
    code: string;
}

function CodeBlock({ code }: CodeBlockProps) {
    return (
        <pre {...stylex.props(styles.pre)}>
            <code>{code}</code>
        </pre>
    );
}

export { CodeBlock };
