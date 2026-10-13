import type { Catalog, ShaderDependency } from '../catalog/index.ts';
import { type Expression, type Node, nodeCount } from '../expression/index.ts';
import {
    type CompiledShader,
    type CompiledShaderUniform,
    type CompileOptions,
    MAX_SOURCE_LENGTH,
} from './types.ts';

const IDENTIFIER_OR_MEMBER = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)?$/;
const POSITIVE_NUMBER = /^\d+(\.\d+)?([eE][+-]?\d+)?$/;
const PARENTHESIZED_NEGATIVE = /^\(-\d+(\.\d+)?([eE][+-]?\d+)?\)$/;

/**
 * Checks whether a GLSL expression string is an atom (identifier, member access, positive number
 * literal, or parenthesized negative number literal). Atoms never require outer parentheses when
 * used as subexpressions.
 */
export function isAtom(s: string): boolean {
    return (
        IDENTIFIER_OR_MEMBER.test(s) || POSITIVE_NUMBER.test(s) || PARENTHESIZED_NEGATIVE.test(s)
    );
}

/** Checks whether a string is completely enclosed by a matching outer pair of parentheses. */
export function isEnclosedInParens(s: string): boolean {
    if (!s.startsWith('(') || !s.endsWith(')')) {
        return false;
    }
    let depth = 0;
    for (let i = 0; i < s.length - 1; i++) {
        if (s[i] === '(') {
            depth++;
        } else if (s[i] === ')') {
            depth--;
        }
        if (depth === 0) {
            return false;
        }
    }
    return depth === 1;
}

/** Wraps an expression in parentheses if it is not already an atom or enclosed in parentheses. */
export function wrapInput(s: string): string {
    if (isAtom(s) || isEnclosedInParens(s)) {
        return s;
    }
    return `(${s})`;
}

/** Emits an inline GLSL string representation of an AST Node without variable sharing. */
function emitInlineNode(node: Node, catalog: Catalog, usedDependencies: Set<string>): string {
    const op = catalog.operator(node.op);
    if (op.requires) {
        for (const req of op.requires) {
            usedDependencies.add(req);
        }
    }

    const childStrings = node.inputs.map((child) => {
        const raw = emitInlineNode(child, catalog, usedDependencies);
        return wrapInput(raw);
    });

    return op.glsl(childStrings, node.params, { p: 'v_p' });
}

/**
 * Naive compiler for randomart expressions (MP1·S4). Lowers 3 expression trees (R, G, B) to a
 * complete GLSL ES 3.00 fragment shader using inline expansion (sharing policy 'none').
 */
export function compile(
    catalog: Catalog,
    expression: Expression,
    _options?: CompileOptions,
): CompiledShader {
    const usedDependencies = new Set<string>();

    const rCode = emitInlineNode(expression.r, catalog, usedDependencies);
    const gCode = emitInlineNode(expression.g, catalog, usedDependencies);
    const bCode = emitInlineNode(expression.b, catalog, usedDependencies);

    const deps = catalog.dependencyClosure([...usedDependencies]);

    const functionDefs = deps
        .filter((d): d is Extract<ShaderDependency, { kind: 'function' }> => d.kind === 'function')
        .map((d) => d.code)
        .join('\n\n');

    const extraUniforms = deps
        .filter(
            (d): d is Extract<ShaderDependency, { kind: 'uniform' }> =>
                d.kind === 'uniform' && d.name !== 'u_phase',
        )
        .map((d) => `uniform ${d.glslType} ${d.name};`)
        .join('\n');

    const animated = usedDependencies.has('u_phase');

    const preambleLines: string[] = [
        'precision highp float;',
        '',
        'in vec2 vUv;',
        'out vec4 o_color;',
        '',
        'uniform float u_phase;',
    ];

    if (extraUniforms.length > 0) {
        preambleLines.push(extraUniforms);
    }

    preambleLines.push('', 'const float PI = 3.141592653589793;');

    if (functionDefs.length > 0) {
        preambleLines.push('', functionDefs);
    }

    const mainLines: string[] = [
        'void main() {',
        '    vec2 v_p = vUv * 2.0 - 1.0;',
        '',
        `    float r_expr = (${rCode}) * 0.5 + 0.5;`,
        `    float g_expr = (${gCode}) * 0.5 + 0.5;`,
        `    float b_expr = (${bCode}) * 0.5 + 0.5;`,
        '    o_color = vec4(clamp(r_expr, 0.0, 1.0), clamp(g_expr, 0.0, 1.0), clamp(b_expr, 0.0, 1.0), 1.0);',
        '}',
    ];

    const source = [...preambleLines, '', ...mainLines].join('\n');

    if (source.length > MAX_SOURCE_LENGTH) {
        throw new Error(
            `Shader source length (${source.length}) exceeds MAX_SOURCE_LENGTH (${MAX_SOURCE_LENGTH})`,
        );
    }

    const totalNodes = nodeCount(expression);

    const uniforms: CompiledShaderUniform[] = deps
        .filter((d): d is Extract<ShaderDependency, { kind: 'uniform' }> => d.kind === 'uniform')
        .map((d) => ({ name: d.name, glslType: d.glslType }));

    return {
        source,
        uniforms,
        animated,
        stats: {
            nodes: totalNodes,
            vertices: totalNodes,
            variables: 0,
            contexts: 1,
            sourceLength: source.length,
        },
    };
}
