// mol-demo data layer (S7): parsing, form factors, palette, registry.
export { ATOM, ATOM_FALLBACK, atomDisplay } from "./atoms";
export type { AtomDisplay } from "./atoms";
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
} from "./formFactors";
export {
  MOLECULES,
  loadMolecule,
  parseAndValidate,
  switchMolecule,
  validateMolecule,
} from "./molecules";
export type { MoleculeEntry, SwitchResult, ValidationResult } from "./molecules";
export { parseMol } from "./parseMol";
export type { Bond, Molecule, Vec3Tuple } from "./parseMol";
