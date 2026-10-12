export type BehaviorKind = 'spatial' | 'color';

export interface ApplyCodeContext {
    time: string;
    speed: string;
    spatial: string;
    color: string;
}

export interface Behavior {
    readonly id: string;
    readonly label: string;
    readonly glslFunction?: string;
    readonly kind: BehaviorKind;
    readonly applyCode: (ctx: ApplyCodeContext) => string;
    readonly noiseDependencies?: readonly string[];
}

export const defineBehavior = <const T extends Behavior>(behavior: T): T => behavior;
