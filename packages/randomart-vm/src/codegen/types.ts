export interface Compiled {
    readonly source: string;
    readonly uniforms: readonly { name: string; glslType: string }[];
    readonly animated: boolean;
    readonly stats: {
        readonly nodes: number;
        readonly vertices: number;
        readonly variables: number;
        readonly contexts: number;
        readonly sourceLength: number;
    };
}

export type SharingPolicy = 'none' | 'shared' | 'all';
