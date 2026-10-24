import type Color from 'colorjs.io';

export interface Palette {
    colors: Color[];
}

export interface Rule {
    apply: (color: Color) => Color[];
    info: {
        name: string;
        description: string;
    };
}
