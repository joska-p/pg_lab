import type Color from 'colorjs.io';

export interface Palette {
    colors: Color[];
}

export interface Rule<TId extends string = string> {
    id: TId;
    label: string;
    description: string;
    apply: (color: Color) => Color[];
}
