# Migration Status: The Terminal Atelier (Archived)

> **Status:** All phases completed and verified. This document is archived.
> Canonical architecture and documentation live in `packages/ui/DESIGN.md`, `packages/ui/README.md`, and `codex/docs/component-authoring.md`.

## Status Key

- [ ] Pending
- [/] In Progress
- [x] Completed

## Roadmap

### Phase B: Components & State

- [x] **Slider** (Phase A1-A3): Migrated to `families` and contact ring.
- [x] **RadioGroup**: Migrated to static StyleX variants and `familiesConsts`.
- [x] **Button (Key)**: Migrated to matte face + LED + contact ring + family hover infusion.
- [x] **Toggle**: Migrated to Pilot Light archetype.

### Phase C: Input & Badge

- [x] **Badge (Chip)**: Migrated to outline pill with optional LED, role-based coloring removed.
- [x] **TextInput / NumberField / TextArea**: Migrated to well (`field.well`) + contact ring + label row LED.
- [x] **Select**: Migrated to well + contact ring + label row LED.

### Phase D: Scenes & Cleanup

- [x] **Surface & MaterialScene**: Deconstructed `Surface`, migrated to `Card` and `MaterialScene`.
- [x] **Retire Matrix**: Removed legacy files (`colorVariants.stylex.ts`, `foundations/surface.stylex.ts`, `intents/hover.stylex.ts`).
- [x] **Finalize Docs**: Synchronized canonical docs and archived working notes.
