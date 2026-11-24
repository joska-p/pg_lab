// mol-demo data layer (S7) + viewer builder (S8) + pattern (S9).
export { ATOM, ATOM_FALLBACK, atomDisplay } from './atoms';
export type { AtomDisplay } from './atoms';
export {
    FF,
    FF_DATA,
    FF_N,
    FF_SYMS,
    FF_TBL,
    MAX_ATOMS_DESKTOP,
    MAX_ATOMS_MOBILE,
    Q_MAX,
    Q_MIN,
    ff,
    maxAtoms,
} from './formFactors';
export {
    MOLECULES,
    loadMolecule,
    parseAndValidate,
    switchMolecule,
    validateMolecule,
} from './molecules';
export type { MoleculeEntry, SwitchResult, ValidationResult } from './molecules';
export { parseMol } from './parseMol';
export type { Bond, Molecule, Vec3Tuple } from './parseMol';
export {
    ATOM_SHININESS,
    ATOM_SPHERE_HEIGHT_SEGS,
    ATOM_SPHERE_SCALE,
    ATOM_SPHERE_WIDTH_SEGS,
    ATOM_SPECULAR,
    BOND_COLOR,
    BOND_RADIAL_SEGS,
    BOND_RADIUS,
    BOND_SHININESS,
    buildMolMesh,
} from './buildMolMesh';
export {
    PATTERN_ANGLE_EPS,
    PATTERN_GRID,
    PATTERN_PAT_MS,
    PATTERN_SMOOTHING,
    XRAY_LUT,
    XRAY_LUT_GAMMA,
    computeNorm32Raw,
    createPatternNorm,
    projectAtoms,
    smoothNormStep,
} from './pattern';
export type { PatternNorm, ProjectedAtom, ViewerHandle, ViewerRef } from './pattern';
