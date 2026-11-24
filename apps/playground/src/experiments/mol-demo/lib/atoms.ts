// Atom display properties (CPK-ish palette). Ported from mol-demo.js.
// Only elements with a known color/radius are listed; anything else
// (including elements that do have form factors) falls back to ATOM_FALLBACK.

export interface AtomDisplay {
    r: number;
    col: number;
}

export const ATOM: Record<string, AtomDisplay> = {
    H: { r: 0.31, col: 0xffffff },
    He: { r: 0.31, col: 0xd9ffff },
    Li: { r: 1.52, col: 0xcc80ff },
    Be: { r: 1.12, col: 0xc2ff00 },
    B: { r: 0.87, col: 0xffb5b5 },
    C: { r: 0.77, col: 0x555555 },
    N: { r: 0.75, col: 0x3050f8 },
    O: { r: 0.73, col: 0xee2010 },
    F: { r: 0.72, col: 0x50e090 },
    Ne: { r: 0.38, col: 0xb3e3f5 },
    Na: { r: 1.86, col: 0xab5cf2 },
    Mg: { r: 1.41, col: 0x8aff00 },
    Al: { r: 1.21, col: 0xbfa6a6 },
    Si: { r: 1.11, col: 0xf0c8a0 },
    P: { r: 1.07, col: 0xff8000 },
    S: { r: 1.02, col: 0xddcc00 },
    Cl: { r: 0.99, col: 0x1ff01f },
    Ar: { r: 0.71, col: 0x80d1e3 },
    K: { r: 2.03, col: 0x8f40d4 },
    Ca: { r: 1.74, col: 0x3dff00 },
    Fe: { r: 1.26, col: 0xe06633 },
    Co: { r: 1.25, col: 0xf090a0 },
    Ni: { r: 1.24, col: 0x50d050 },
    Cu: { r: 1.28, col: 0xc88033 },
    Zn: { r: 1.22, col: 0x7d80b0 },
    Se: { r: 1.2, col: 0xffa100 },
    Br: { r: 1.14, col: 0xa62929 },
    I: { r: 1.33, col: 0x940094 },
    Ag: { r: 1.44, col: 0xc0c0c0 },
};

export const ATOM_FALLBACK: AtomDisplay = { r: 0.77, col: 0x888888 };

export function atomDisplay(el: string): AtomDisplay {
    return ATOM[el] ?? ATOM_FALLBACK;
}
