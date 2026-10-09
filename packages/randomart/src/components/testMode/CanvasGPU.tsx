import { GpuCanvas } from '@repo/glaze/react/GpuCanvas';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { fieldText } from '@repo/ui/recipes/typography';
import * as stylex from '@stylexjs/stylex';

import type { Node } from '../../core';
import { buildValueFragmentShader } from './buildValueShader';

interface CanvasGPUProps {
    node: Node;
    sizePx: number;
}

const styles = stylex.create({
    frame: {
        position: 'relative',
    },
    error: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        textAlign: 'center',
    },
});

function buildShader(node: Node): { shader: string | null; error: string | null } {
    try {
        return { shader: buildValueFragmentShader(node), error: null };
    } catch (e) {
        return {
            shader: null,
            error: e instanceof Error ? e.message : 'GLSL build error',
        };
    }
}

export function CanvasGPU({ node, sizePx }: CanvasGPUProps) {
    const { shader, error } = buildShader(node);

    return (
        <div {...stylex.props(styles.frame)} style={{ width: sizePx, height: sizePx }}>
            {shader && <GpuCanvas fragmentShader={shader} />}
            {error && (
                <div
                    {...stylex.props(
                        surfaceStyles({ background: 'soft' }),
                        fieldText.message,
                        styles.error,
                    )}
                >
                    {error}
                </div>
            )}
        </div>
    );
}
