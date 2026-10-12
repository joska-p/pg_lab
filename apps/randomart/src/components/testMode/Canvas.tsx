import { heading } from '@repo/ui/recipes/typography';
import { space } from '@repo/ui/tokens/const.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';

import type { Node } from '../../core';
import { CanvasCPU } from './CanvasCPU';
import { CanvasGPU } from './CanvasGPU';

interface CanvasProps {
    node: Node;
    resolution: number;
    sizePx: number;
}

const styles = stylex.create({
    row: {
        display: 'flex',
        gap: space['3'],
    },
    caption: {
        textAlign: 'center',
        marginBottom: space['1'],
    },
});

// The gallery has more operators than the browser allows live WebGL2 contexts,
// so a cell mounts its canvases only while it intersects the viewport. No
// pre-margin: the number of intersecting cells stays well under the limit.
function useInView<T extends Element>() {
    const [node, setNode] = useState<T | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        if (!node) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            setInView(entries[0]?.isIntersecting ?? false);
        });

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, [node]);

    return { setNode, inView };
}

export function Canvas({ node, resolution, sizePx }: CanvasProps) {
    const { setNode, inView } = useInView<HTMLDivElement>();

    return (
        <div ref={setNode} {...stylex.props(styles.row)}>
            <div>
                <p {...stylex.props(heading.level3, styles.caption)}>CPU</p>
                {inView ? (
                    <CanvasCPU node={node} resolution={resolution} sizePx={sizePx} />
                ) : (
                    <div style={{ width: sizePx, height: sizePx }} />
                )}
            </div>
            <div>
                <p {...stylex.props(heading.level3, styles.caption)}>GPU</p>
                {inView ? (
                    <CanvasGPU node={node} sizePx={sizePx} />
                ) : (
                    <div style={{ width: sizePx, height: sizePx }} />
                )}
            </div>
        </div>
    );
}
