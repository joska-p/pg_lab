export type ValueType = 'float';

export interface InputDef {
    readonly type: ValueType;
    readonly scope?: 'current' | 'inner';
}

export interface ParamDef {
    readonly name: string;
    readonly min: number;
    readonly max: number;
}

export interface GlslContext {
    readonly p: string;
}

export interface OperatorDef {
    readonly name: string;
    readonly family: string;
    readonly inputs: readonly InputDef[];
    readonly output: ValueType;
    readonly params?: readonly ParamDef[];
    readonly requires?: readonly string[];
    readonly innerCoords?: (
        inputs: readonly string[],
        params: readonly number[],
        ctx: GlslContext,
    ) => string;
    readonly glsl: (
        inputs: readonly string[],
        params: readonly number[],
        ctx: GlslContext,
    ) => string;
    readonly cost?: number;
}

export type ShaderDependency =
    | {
          readonly kind: 'function';
          readonly name: string;
          readonly code: string;
          readonly requires?: readonly string[];
      }
    | {
          readonly kind: 'uniform';
          readonly name: string;
          readonly glslType: 'float';
      };

export interface Catalog {
    readonly operator: (name: string) => OperatorDef;
    readonly operators: () => readonly OperatorDef[];
    readonly terminals: () => readonly OperatorDef[];
    readonly withOutput: (type: ValueType) => readonly OperatorDef[];
    readonly dependencyClosure: (names: readonly string[]) => readonly ShaderDependency[];
}
