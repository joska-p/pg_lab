import { ops } from './ops';
import type { Point } from './ops';
import { warpOperands } from './tree';
import type { Expression, Node } from './tree';

/** Raw channel values, each in [-1, 1], before the color space conversion. */
export interface Rgb {
    readonly r: number;
    readonly g: number;
    readonly b: number;
}

function evaluateNode(node: Node, point: Point): number {
    const op = ops[node.op];
    if (op.kind === 'warp') {
        const [dxNode, dyNode, bodyNode] = warpOperands(node);
        const dx = evaluateNode(dxNode, point);
        const dy = evaluateNode(dyNode, point);
        return evaluateNode(
            bodyNode,
            op.evalPoint({ inputs: [dx, dy], params: node.params, point }),
        );
    }
    return op.eval({
        inputs: node.inputs.map((child) => evaluateNode(child, point)),
        params: node.params,
        point,
    });
}

/**
 * CPU reference implementation of the whole expression. It is the oracle the GLSL must match, and
 * the reason every operator carries an `eval` twin next to its `glsl`.
 */
export function evaluate(expression: Expression, point: Point): Rgb {
    return {
        r: evaluateNode(expression.r, point),
        g: evaluateNode(expression.g, point),
        b: evaluateNode(expression.b, point),
    };
}
