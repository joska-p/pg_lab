import { create } from "zustand";
import { MOLECULES, loadMolecule } from "../lib/molecules";
import type { Molecule } from "../lib/parseMol";

type LoadStatus = "idle" | "loading" | "ready" | "error";

type MoleculeStore = {
  file: string;
  current: Molecule | null;
  status: LoadStatus;
  error: string | null;
};

const moleculeStore = create<MoleculeStore>(() => ({
  file: MOLECULES[0].file,
  current: null,
  status: "idle",
  error: null,
}));

export function useMoleculeFile(): string {
  return moleculeStore((s) => s.file);
}

export function useMoleculeCurrent(): Molecule | null {
  return moleculeStore((s) => s.current);
}

export function useMoleculeStatus(): LoadStatus {
  return moleculeStore((s) => s.status);
}

export function useMoleculeError(): string | null {
  return moleculeStore((s) => s.error);
}

// Loads a registry entry (fetch + parse + validate); failures keep
// current === null with status "error" instead of throwing.
export async function selectMolecule(file: string): Promise<void> {
  const entry = MOLECULES.find((e) => e.file === file);
  if (!entry) return;
  moleculeStore.setState({ file, current: null, status: "loading", error: null });
  try {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const mol = await loadMolecule(entry, isMobile);
    if (moleculeStore.getState().file !== file) return;
    moleculeStore.setState({ current: mol, status: "ready" });
  } catch (err) {
    if (moleculeStore.getState().file !== file) return;
    moleculeStore.setState({
      current: null,
      status: "error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
