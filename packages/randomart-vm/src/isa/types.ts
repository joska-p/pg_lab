export type OperatorGroup = 'terminal' | 'non-terminal' | 'transform' | string;

export interface ParamRange {
    readonly name: string;
    readonly min: number;
    readonly max: number;
    readonly step?: number;
}

export interface OperatorDef {
    readonly name: string;
    readonly label?: string;
    readonly group: OperatorGroup;
    readonly inputs?: readonly string[];
    readonly inner?: readonly string[];
    readonly coords?: (ctx: GlslContext) => string;
    readonly params?: Record<string, Omit<ParamRange, 'name'>>;
    readonly requires?: readonly string[];
    readonly glsl: (ctx: GlslContext) => string;
}

export interface GlslContext {
    readonly p: string;
    readonly args: Record<string, string>;
    readonly params: Record<string, number>;
}

export interface IsaOperator {
    readonly name: string;
    readonly label: string;
    readonly group: OperatorGroup;
    readonly params: readonly ParamRange[];
    readonly inputNames: readonly string[];
    readonly currentCount: number;
    readonly requires: readonly string[];
    readonly hasInner: boolean;
    readonly arity: number;
    readonly isTerminal: boolean;
    glsl(inputs: readonly string[], params: readonly number[], p: string): string;
    coords?(inputs: readonly string[], params: readonly number[], p: string): string;
}
