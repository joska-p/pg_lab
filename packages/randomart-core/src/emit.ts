import { colorSpaceFunction, getColorSpace, isColorSpaceId } from './colors';
import type { ColorSpaceId } from './colors';
import { RandomArtError } from './errors';
import { GLSL_FUNCTIONS, SHADER_HEADER } from './glsl';
import type { GlslFunctionId } from './glsl';
import { lower } from './lower';
import type { LoweredContext, LoweredDag, LoweredVertex } from './lower';
import { getOp } from './ops';
import { usesTime } from './tree';
import type { Expression } from './tree';

export interface CompileOptions {
    readonly space: ColorSpaceId;
}

export interface Compiled {
    readonly source: string;
    readonly animated: boolean;
    readonly stats: {
        /** Distinct expression nodes after sharing identical subtrees. */
        readonly nodes: number;
        /** Expressions hoisted to a variable because they are used more than once. */
        readonly variables: number;
        readonly sourceLength: number;
    };
}

const MAX_SOURCE_LENGTH = 256_000;

interface Operand {
    readonly text: string;
    readonly isAtom: boolean;
}

interface Emitted {
    readonly roots: readonly [string, string, string];
    readonly lines: readonly string[];
    readonly variables: number;
    readonly nodes: number;
    readonly functions: ReadonlySet<GlslFunctionId>;
}

function emitDag(dag: LoweredDag): Emitted {
    const lines: string[] = [];
    const operands = new Map<number, Operand>();
    const points = new Map<number, string>([[0, 'v_p']]);
    const functions = new Set<GlslFunctionId>();
    let variables = 0;
    let nodes = 0;

    function operandOf(id: number): Operand {
        const operand = operands.get(id);
        if (operand === undefined) {
            throw new RandomArtError(`Missing lowered vertex ${id}`);
        }
        return operand;
    }

    function expressionOf(id: number): string {
        const operand = operandOf(id);
        return operand.isAtom ? operand.text : `(${operand.text})`;
    }

    function pointOf(context: number): string {
        const point = points.get(context);
        if (point === undefined) {
            throw new RandomArtError(`Context ${context} is used before it is emitted`);
        }
        return point;
    }

    function emitVertex(vertex: LoweredVertex): void {
        const op = getOp(vertex.op);
        if (op.kind === 'warp') {
            throw new RandomArtError(`Warp "${vertex.op}" must lower to a context, not a vertex`);
        }
        nodes++;
        for (const id of op.requires ?? []) {
            functions.add(id);
        }

        const text = op.glsl({
            inputs: vertex.inputs.map(expressionOf),
            params: vertex.params,
            point: pointOf(vertex.context),
        });

        if ((dag.usages.get(vertex.id) ?? 0) >= 2) {
            const name = `v${variables++}`;
            lines.push(`    float ${name} = ${text};`);
            operands.set(vertex.id, { text: name, isAtom: true });
            return;
        }
        operands.set(vertex.id, { text, isAtom: op.arity === 0 });
    }

    function emitContext(context: LoweredContext): void {
        const op = getOp(context.op);
        if (op.kind !== 'warp') {
            throw new RandomArtError(`Context operator "${context.op}" is not a warp`);
        }
        for (const id of op.requires ?? []) {
            functions.add(id);
        }
        const coordinates = op.glslPoint({
            inputs: context.inputs.map(expressionOf),
            params: context.params,
            point: pointOf(context.parent),
        });
        const name = `c${context.id}`;
        lines.push(`    vec2 ${name} = ${coordinates};`);
        points.set(context.id, name);
    }

    for (const step of dag.steps) {
        if (step.kind === 'vertex') {
            emitVertex(step.vertex);
        } else {
            emitContext(step.context);
        }
    }

    return {
        roots: [expressionOf(dag.roots[0]), expressionOf(dag.roots[1]), expressionOf(dag.roots[2])],
        lines,
        variables,
        nodes,
        functions,
    };
}

/** Compile an expression to a self-contained GLSL ES 3.00 fragment shader. */
export function compile(expression: Expression, options: CompileOptions): Compiled {
    if (!isColorSpaceId(options.space)) {
        throw new RandomArtError(`Unknown color space: ${String(options.space)}`);
    }

    const dag = lower(expression);
    const emitted = emitDag(dag);
    const { space } = options;

    const fragments = [SHADER_HEADER];
    for (const id of emitted.functions) {
        fragments.push('', GLSL_FUNCTIONS[id]);
    }
    fragments.push('', getColorSpace(space).source, '', 'void main() {');
    fragments.push('    vec2 v_p = vUv * 2.0 - 1.0;');
    if (emitted.lines.length > 0) {
        fragments.push('', ...emitted.lines);
    }
    const [r, g, b] = emitted.roots;
    fragments.push(
        '',
        `    o_color = vec4(${colorSpaceFunction(space)}(vec3(${r}, ${g}, ${b})), 1.0);`,
        '}',
    );

    const source = fragments.join('\n');
    if (source.length > MAX_SOURCE_LENGTH) {
        throw new RandomArtError(
            `Shader source too long: ${source.length} characters (limit ${MAX_SOURCE_LENGTH})`,
        );
    }

    return {
        source,
        animated: usesTime(expression),
        stats: {
            nodes: emitted.nodes,
            variables: emitted.variables,
            sourceLength: source.length,
        },
    };
}
