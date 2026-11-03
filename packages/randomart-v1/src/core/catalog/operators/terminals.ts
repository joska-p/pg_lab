import { CONFIG } from '../../config/config';
import { formatGlslFloat } from '../format';
import { defineOperator } from './defineOperator';

/**
 * `x` and `y` carry the time. Each occurrence blends its coordinate with its own oscillator
 * (amplitude, phase and whole number of cycles drawn per node), so the relations between the parts
 * of an expression change over the loop instead of the whole image moving as a block. The knob
 * values (amp cap, phase span, cycle counts) live in `CONFIG.terminals`.
 */
function spatialAxis(axis: 'x' | 'y') {
    return defineOperator({
        label: axis.toUpperCase(),
        group: 'terminal',
        params: {
            amp: CONFIG.terminals.amp,
            phase: CONFIG.terminals.phase,
            cycles: CONFIG.terminals.cycles,
        },
        requires: ['u_phase'],
        glsl: ({ p, params }) => {
            if (params.amp === 0) {
                return `${p}.${axis}`;
            }

            const rest = formatGlslFloat(1 - params.amp);
            const amp = formatGlslFloat(params.amp);
            const cycles = formatGlslFloat(params.cycles);
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
