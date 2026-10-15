import { assertFinite } from '../shared/index.ts';
import type { Catalog, InputDef, OperatorDef, ShaderDependency, ValueType } from './types.ts';

const OP_NAME_REGEX = /^[a-z][a-z0-9_]*$/;
const UNIFORM_NAME_REGEX = /^u_[A-Za-z0-9]+(_[A-Za-z0-9]+)*$/;
const FUNCTION_NAME_REGEX = /^ra_[A-Za-z0-9]+(_[A-Za-z0-9]+)*$/;

export function formatGlslFloat(value: number): string {
    assertFinite(value, 'formatGlslFloat value');
    const s = String(value);
    const withDot = !s.includes('.') && !s.includes('e') && !s.includes('E') ? `${s}.0` : s;
    return value < 0 ? `(${withDot})` : withDot;
}

export function defineOperator(def: OperatorDef): OperatorDef {
    if (!OP_NAME_REGEX.test(def.name)) {
        throw new Error(
            `Invalid operator name "${def.name}": must match ^[a-z][a-z0-9_]*$ without leading/trailing issues`,
        );
    }

    if (typeof def.glsl !== 'function') {
        throw new Error(`Operator "${def.name}" must provide a glsl function`);
    }

    if (def.params) {
        for (const param of def.params) {
            assertFinite(param.min, `Param ${param.name} min`);
            assertFinite(param.max, `Param ${param.name} max`);
            if (param.min >= param.max) {
                throw new Error(
                    `Param "${param.name}" in operator "${def.name}" has invalid range: min (${param.min}) must be < max (${param.max})`,
                );
            }
        }
    }

    const hasInner = def.inputs.some((input) => input.scope === 'inner');
    if (hasInner && typeof def.innerCoords !== 'function') {
        throw new Error(`Operator "${def.name}" has inner inputs but no innerCoords function`);
    }
    if (!hasInner && def.innerCoords !== undefined) {
        throw new Error(`Operator "${def.name}" has innerCoords but no inner inputs`);
    }

    return Object.freeze({
        ...def,
        inputs: Object.freeze(def.inputs.map((i) => Object.freeze({ ...i }))),
        params: def.params
            ? Object.freeze(def.params.map((p) => Object.freeze({ ...p })))
            : undefined,
        requires: def.requires ? Object.freeze([...def.requires]) : undefined,
    });
}

export function defineDependency(dep: ShaderDependency): ShaderDependency {
    if (dep.kind === 'uniform') {
        if (!UNIFORM_NAME_REGEX.test(dep.name) || dep.name.includes('__')) {
            throw new Error(
                `Invalid uniform dependency name "${dep.name}": must start with u_ and follow identifier conventions without __`,
            );
        }
        return Object.freeze({ ...dep });
    }

    if (dep.kind === 'function') {
        if (!FUNCTION_NAME_REGEX.test(dep.name) || dep.name.includes('__')) {
            throw new Error(
                `Invalid function dependency name "${dep.name}": must start with ra_ and follow identifier conventions without __`,
            );
        }
        if (!dep.code || dep.code.trim().length === 0) {
            throw new Error(`Function dependency "${dep.name}" must provide non-empty code`);
        }
        return Object.freeze({
            ...dep,
            requires: dep.requires ? Object.freeze([...dep.requires]) : undefined,
        });
    }

    throw new Error(`Unknown dependency kind: ${(dep as { kind: string }).kind}`);
}

export function createCatalog(config: {
    readonly operators: readonly OperatorDef[];
    readonly dependencies?: readonly ShaderDependency[];
}): Catalog {
    const operatorMap = new Map<string, OperatorDef>();
    for (const operator of config.operators) {
        if (operatorMap.has(operator.name)) {
            throw new Error(`Duplicate operator name: "${operator.name}"`);
        }
        operatorMap.set(operator.name, operator);
    }

    const dependencyMap = new Map<string, ShaderDependency>();
    for (const dep of config.dependencies ?? []) {
        if (dependencyMap.has(dep.name)) {
            throw new Error(`Duplicate dependency name: "${dep.name}"`);
        }
        dependencyMap.set(dep.name, dep);
    }

    const terminals = config.operators.filter((operator) => operator.inputs.length === 0);
    if (terminals.length === 0) {
        throw new Error(
            'Catalog must contain at least one terminal operator (inputs.length === 0)',
        );
    }

    // Verify all requires in operators and dependencies
    for (const operator of config.operators) {
        for (const req of operator.requires ?? []) {
            if (!dependencyMap.has(req)) {
                throw new Error(`Operator "${operator.name}" requires unknown dependency "${req}"`);
            }
        }
    }

    for (const dep of config.dependencies ?? []) {
        if (dep.kind === 'function') {
            for (const req of dep.requires ?? []) {
                if (!dependencyMap.has(req)) {
                    throw new Error(
                        `Dependency "${dep.name}" requires unknown dependency "${req}"`,
                    );
                }
            }
        }
    }

    // Cycle detection in dependencies
    const visited = new Set<string>();
    const visiting = new Set<string>();

    function checkDepCycles(name: string): void {
        if (visiting.has(name)) {
            throw new Error(`Cyclic dependency detected involving "${name}"`);
        }
        if (visited.has(name)) {
            return;
        }

        visiting.add(name);
        const dep = dependencyMap.get(name);
        if (dep && dep.kind === 'function') {
            for (const req of dep.requires ?? []) {
                checkDepCycles(req);
            }
        }
        visiting.delete(name);
        visited.add(name);
    }

    for (const depName of dependencyMap.keys()) {
        checkDepCycles(depName);
    }

    // Probe operator inputs
    for (const operator of config.operators) {
        if (operator.inputs.length === 0) {
            continue;
        }

        const sentinels = operator.inputs.map((_, i) => `@in${i}@`);
        const dummyParams = (operator.params ?? []).map((p) => p.min);
        const glslResult = operator.glsl(sentinels, dummyParams, { p: '@p@' });

        const currentSentinels = sentinels.filter((_, i) => operator.inputs[i].scope !== 'inner');
        const innerResult =
            typeof operator.innerCoords === 'function'
                ? operator.innerCoords(currentSentinels, dummyParams, { p: '@p@' })
                : '';

        for (let i = 0; i < operator.inputs.length; i++) {
            const sentinel = `@in${i}@`;
            if (!glslResult.includes(sentinel) && !innerResult.includes(sentinel)) {
                throw new Error(
                    `Operator "${operator.name}": input at index ${i} is never used in glsl or innerCoords`,
                );
            }
        }
    }

    const allOperators = Object.freeze([...config.operators]);
    const allTerminals = Object.freeze(terminals);

    function operator(name: string): OperatorDef {
        const found = operatorMap.get(name);
        if (!found) {
            throw new Error(`Unknown operator: "${name}"`);
        }
        return found;
    }

    function operators(): readonly OperatorDef[] {
        return allOperators;
    }

    function getTerminals(): readonly OperatorDef[] {
        return allTerminals;
    }

    function withOutput(type: ValueType): readonly OperatorDef[] {
        return allOperators.filter((operator) => operator.output === type);
    }

    function dependencyClosure(names: readonly string[]): readonly ShaderDependency[] {
        const result: ShaderDependency[] = [];
        const added = new Set<string>();

        function add(name: string): void {
            if (added.has(name)) {
                return;
            }
            const dep = dependencyMap.get(name);
            if (!dep) {
                throw new Error(`Unknown dependency in closure: "${name}"`);
            }
            if (dep.kind === 'function') {
                for (const req of dep.requires ?? []) {
                    add(req);
                }
            }
            added.add(name);
            result.push(dep);
        }

        for (const name of names) {
            add(name);
        }

        return Object.freeze(result);
    }

    const allDeps = Object.freeze([...(config.dependencies ?? [])]);
    function getDependencies(): readonly ShaderDependency[] {
        return allDeps;
    }

    return Object.freeze({
        operator,
        operators,
        terminals: getTerminals,
        withOutput,
        dependencies: getDependencies,
        dependencyClosure,
    });
}

export function createDefaultCatalog(): Catalog {
    const floatInput: InputDef = { type: 'float' };

    const uPhase = defineDependency({
        kind: 'uniform',
        name: 'u_phase',
        glslType: 'float',
    });

    const raFold2 = defineDependency({
        kind: 'function',
        name: 'ra_fold2',
        code: 'vec2 ra_fold2(vec2 v) { return abs(mod(v + 3.0, 4.0) - 2.0) - 1.0; }',
    });

    const x = defineOperator({
        name: 'x',
        family: 'terminal',
        inputs: [],
        output: 'float',
        glsl: (_in, _p, ctx) => `${ctx.p}.x`,
    });

    const y = defineOperator({
        name: 'y',
        family: 'terminal',
        inputs: [],
        output: 'float',
        glsl: (_in, _p, ctx) => `${ctx.p}.y`,
    });

    const constOperator = defineOperator({
        name: 'const',
        family: 'terminal',
        inputs: [],
        output: 'float',
        params: [{ name: 'value', min: -1, max: 1 }],
        glsl: (_in, params) => formatGlslFloat(params[0]),
    });

    const tsin = defineOperator({
        name: 'tsin',
        family: 'terminal',
        inputs: [],
        output: 'float',
        requires: ['u_phase'],
        glsl: () => 'sin(2.0*PI*u_phase)',
    });

    const tcos = defineOperator({
        name: 'tcos',
        family: 'terminal',
        inputs: [],
        output: 'float',
        requires: ['u_phase'],
        glsl: () => 'cos(2.0*PI*u_phase)',
    });

    const neg = defineOperator({
        name: 'neg',
        family: 'arithmetic',
        inputs: [floatInput],
        output: 'float',
        glsl: ([a]) => `-${a}`,
    });

    const abs = defineOperator({
        name: 'abs',
        family: 'arithmetic',
        inputs: [floatInput],
        output: 'float',
        glsl: ([a]) => `abs(${a})`,
    });

    const sqr = defineOperator({
        name: 'sqr',
        family: 'arithmetic',
        inputs: [floatInput],
        output: 'float',
        glsl: ([a]) => `${a}*${a}`,
    });

    const add = defineOperator({
        name: 'add',
        family: 'arithmetic',
        inputs: [floatInput, floatInput],
        output: 'float',
        glsl: ([a, b]) => `(${a}+${b})*0.5`,
    });

    const mul = defineOperator({
        name: 'mul',
        family: 'arithmetic',
        inputs: [floatInput, floatInput],
        output: 'float',
        glsl: ([a, b]) => `${a}*${b}`,
    });

    const div = defineOperator({
        name: 'div',
        family: 'arithmetic',
        inputs: [floatInput, floatInput],
        output: 'float',
        glsl: ([a, b]) => `${a}/(1.0+abs(${b}))`,
    });

    const min = defineOperator({
        name: 'min',
        family: 'arithmetic',
        inputs: [floatInput, floatInput],
        output: 'float',
        glsl: ([a, b]) => `min(${a},${b})`,
    });

    const max = defineOperator({
        name: 'max',
        family: 'arithmetic',
        inputs: [floatInput, floatInput],
        output: 'float',
        glsl: ([a, b]) => `max(${a},${b})`,
    });

    const mix = defineOperator({
        name: 'mix',
        family: 'arithmetic',
        inputs: [floatInput, floatInput, floatInput],
        output: 'float',
        glsl: ([a, b, t]) => `mix(${a},${b},(${t}+1.0)*0.5)`,
    });

    const sin = defineOperator({
        name: 'sin',
        family: 'trigonometry',
        inputs: [floatInput],
        output: 'float',
        glsl: ([a]) => `sin(PI*${a})`,
    });

    const cos = defineOperator({
        name: 'cos',
        family: 'trigonometry',
        inputs: [floatInput],
        output: 'float',
        glsl: ([a]) => `cos(PI*${a})`,
    });

    const gt = defineOperator({
        name: 'gt',
        family: 'logic',
        inputs: [floatInput, floatInput],
        output: 'float',
        glsl: ([a, b]) => `(${a}>${b} ? 1.0 : -1.0)`,
    });

    const select = defineOperator({
        name: 'select',
        family: 'logic',
        inputs: [floatInput, floatInput, floatInput],
        output: 'float',
        glsl: ([c, a, b]) => `(${c}>0.0 ? ${a} : ${b})`,
    });

    const warp = defineOperator({
        name: 'warp',
        family: 'transform',
        inputs: [{ type: 'float' }, { type: 'float' }, { type: 'float', scope: 'inner' }],
        output: 'float',
        requires: ['ra_fold2'],
        innerCoords: ([dx, dy], _params, ctx) => `ra_fold2(${ctx.p}+0.5*vec2(${dx},${dy}))`,
        glsl: ([, , f]) => f,
    });

    return createCatalog({
        operators: [
            x,
            y,
            constOperator,
            tsin,
            tcos,
            neg,
            abs,
            sqr,
            add,
            mul,
            div,
            min,
            max,
            mix,
            sin,
            cos,
            gt,
            select,
            warp,
        ],
        dependencies: [uPhase, raFold2],
    });
}
