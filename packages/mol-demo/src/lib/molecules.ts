// SDF assets are co-located with the code and resolved by Vite at build time.
// Lazy `?url` glob keeps per-molecule fetch: only the selected entry is fetched,
// and Vite rewrites the URL with the consumer's `base` automatically. This works
// when mol-demo is imported as a library (playground host), unlike `public/`.

import { FF, maxAtoms } from './formFactors';
import { parseMol } from './parseMol';
import type { Molecule } from './parseMol';

export interface MoleculeEntry {
    file: string;
    atoms: number;
    name: string;
}

// Subset extracted from PubChem_search_records.sdf (see codex/glaze3D),
// 9 → 56 atoms, all within the desktop MAX_ATOMS budget.
export const MOLECULES: readonly MoleculeEntry[] = [
    { file: 'cid-702.sdf', atoms: 9, name: 'CID 702' },
    { file: 'cid-936.sdf', atoms: 15, name: 'CID 936' },
    { file: 'cid-1983.sdf', atoms: 20, name: 'CID 1983' },
    { file: 'cid-21550.sdf', atoms: 45, name: 'CID 21550' },
    { file: 'cid-52359.sdf', atoms: 52, name: 'CID 52359' },
    { file: 'cid-115374.sdf', atoms: 56, name: 'CID 115374' },
];

export type ValidationResult = { ok: true } | { ok: false; reason: string };

// Refuse molecules we cannot render: unknown elements (no form factors)
// or more atoms than the diffraction path supports. The caller keeps the
// previous molecule on { ok: false }.
export function validateMolecule(mol: Molecule, maxAtomCount: number): ValidationResult {
    const unknown = [...new Set(mol.atoms.filter((el) => !(el in FF)))];
    if (unknown.length > 0) {
        return { ok: false, reason: `unknown elements (no form factors): ${unknown.join(', ')}` };
    }
    if (mol.atoms.length > maxAtomCount) {
        return {
            ok: false,
            reason: `molecule has ${mol.atoms.length} atoms, max is ${maxAtomCount}`,
        };
    }
    return { ok: true };
}

export interface SwitchResult {
    mol: Molecule;
    switched: boolean;
    reason?: string;
}

// Pure core of switchMolecule: invalid candidates keep the current molecule.
export function switchMolecule(
    current: Molecule,
    next: Molecule,
    maxAtomCount: number,
): SwitchResult {
    const check = validateMolecule(next, maxAtomCount);
    if (!check.ok) return { mol: current, switched: false, reason: check.reason };
    return { mol: next, switched: true };
}

// Parse + validate in one step; throws on corrupt input or refusal.
export function parseAndValidate(text: string, filename: string, maxAtomCount: number): Molecule {
    const mol = parseMol(text, filename);
    const check = validateMolecule(mol, maxAtomCount);
    if (!check.ok) throw new Error(`mol-demo: ${check.reason}`);
    return mol;
}

// Vite-resolved SDF URLs (lazy: one fetch per selected molecule).
const sdfUrlModules = import.meta.glob('../assets/molecules/*.sdf', {
    query: '?url',
    import: 'default',
}) as Record<string, () => Promise<string>>;

const sdfUrlByFile = new Map<string, () => Promise<string>>(
    Object.entries(sdfUrlModules).map(([path, loader]) => [path.split('/').pop() ?? path, loader]),
);

// Fetch a registry entry by its Vite-resolved URL and validate it.
export async function loadMolecule(entry: MoleculeEntry, isMobile = false): Promise<Molecule> {
    const loader = sdfUrlByFile.get(entry.file);
    if (!loader) throw new Error(`mol-demo: unknown molecule ${entry.file}`);
    const res = await fetch(await loader());
    if (!res.ok) throw new Error(`mol-demo: could not load ${entry.file} (${res.status})`);
    return parseAndValidate(await res.text(), entry.file, maxAtoms(isMobile));
}
