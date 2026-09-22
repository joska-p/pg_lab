// .mol / .sdf V2000 parser. Ported from mol-demo.js parseMol.
// SDF files hold one or more mol records separated by $$$$; only the first
// record is parsed — the mol block sits at the top, so reading by atom/bond
// count stops before any SDF data fields naturally.

export type Vec3Tuple = [number, number, number];
export type Bond = [number, number];

export interface Molecule {
    name: string;
    atoms: string[];
    pos: Vec3Tuple[];
    bonds: Bond[];
}

function fail(message: string): never {
    throw new Error(`mol-demo: ${message}`);
}

export function parseMol(text: string, filename?: string): Molecule {
    // Keep only the first SDF record; equivalent to the count-bounded read
    // below on well-formed input, robust against trailing records.
    const first = text.replace(/\r\n/g, '\n').split('$$$$')[0];
    const lines = first.split('\n');
    const rawName = (lines[0] ?? '').trim();
    // Fall back to filename (minus extension) if the name field is blank or numeric.
    const name =
        rawName && !/^\d+$/.test(rawName)
            ? rawName
            : (filename ?? '').replace(/\.(mol|sdf)$/i, '') || 'Unknown';

    // Counts line contains "V2000"; some files omit the comment line so it
    // lands at [2] instead of [3].
    let ci = 3;
    for (let i = 2; i <= 4; i++) {
        if ((lines[i] ?? '').includes('V2000')) {
            ci = i;
            break;
        }
    }

    const counts = lines[ci] ?? '';
    const natoms = parseInt(counts.substring(0, 3), 10);
    const nbonds = parseInt(counts.substring(3, 6), 10);
    if (!natoms || Number.isNaN(natoms)) {
        fail('could not parse atom count');
    }
    if (Number.isNaN(nbonds)) {
        fail('could not parse bond count');
    }

    const atoms: string[] = [];
    const pos: Vec3Tuple[] = [];
    const bonds: Bond[] = [];
    for (let i = 0; i < natoms; i++) {
        const parts = (lines[ci + 1 + i] ?? '').trim().split(/\s+/);
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        const z = parseFloat(parts[2]);
        const el = parts[3];
        if (!el) {
            fail(`atom ${i + 1}: missing element symbol`);
        }
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
            fail(`atom ${i + 1} (${el}): invalid coordinates`);
        }
        pos.push([x, y, z]);
        atoms.push(el);
    }
    for (let i = 0; i < nbonds; i++) {
        const parts = (lines[ci + 1 + natoms + i] ?? '').trim().split(/\s+/);
        const a = parseInt(parts[0], 10);
        const b = parseInt(parts[1], 10);
        if (
            !Number.isInteger(a) ||
            !Number.isInteger(b) ||
            a < 1 ||
            b < 1 ||
            a > natoms ||
            b > natoms
        ) {
            fail(`bond ${i + 1}: atom index out of range`);
        }
        bonds.push([a - 1, b - 1]);
    }

    // Center on centroid so the molecule rotates about its own center.
    const cx = pos.reduce((s, p) => s + p[0], 0) / pos.length;
    const cy = pos.reduce((s, p) => s + p[1], 0) / pos.length;
    const cz = pos.reduce((s, p) => s + p[2], 0) / pos.length;
    pos.forEach((p) => {
        p[0] -= cx;
        p[1] -= cy;
        p[2] -= cz;
    });

    return { name, atoms, pos, bonds };
}
