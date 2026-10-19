import { formatGlslFloat } from '../format.ts';
import { defineOperator } from './types.ts';

/**
 * `x` and `y` carry the time. Each occurrence blends its coordinate with its own oscillator
 * (amplitude, phase and whole number of cycles drawn per node), so the relations between the parts
 * of an expression change over the loop instead of the whole image moving as a block. `amp` stays
 * at most 0.7: a pure oscillator would be constant in space and flatten its subtree. `cycles` is a
 * share in [0, 1] mapped to 1..3 whole cycles, so the loop stays periodic.
 */
function spatialAxis(axis: 'x' | 'y') {
    return defineOperator({
        label: axis.toUpperCase(),
        group: 'terminal',
        params: {
            amp: { min: 0, max: 0.7 },
            phase: { min: -1, max: 1 },
            cycles: { min: 0, max: 1 },
        },
        requires: ['u_phase'],
        glsl: ({ p, params }) => {
            if (params.amp === 0) {
                return `${p}.${axis}`;
            }

            const rest = formatGlslFloat(1 - params.amp);
            const amp = formatGlslFloat(params.amp);
            const cycles = formatGlslFloat(1 + Math.round(2 * params.cycles));
            const phase = formatGlslFloat(params.phase);

            return `(${rest}*${p}.${axis}+${amp}*sin(2.0*PI*${cycles}*u_phase+PI*${phase}))`;
        },
    });
}

export const terminals = {
    x: spatialAxis('x'),
    y: spatialAxis('y'),
    const: defineOperator({
        label: 'Constant',
        group: 'terminal',
        params: { value: { min: -1, max: 1 } },
        glsl: ({ params }) => formatGlslFloat(params.value),
    }),
};
