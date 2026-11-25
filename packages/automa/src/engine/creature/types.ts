export interface Creature<TId extends string = string> {
    readonly id: TId;
    readonly name: string;
    readonly width: number;
    readonly height: number;
    readonly cells: number[][];
}
