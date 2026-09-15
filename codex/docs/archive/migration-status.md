# Migration Status: The Terminal Atelier

Ce document suit la migration des composants `packages/ui` vers le nouveau design system (Phase B-D).

## Status Key

- [ ] Pending
- [/] In Progress
- [x] Completed

## Roadmap

### Phase B: Components & State

- [x] **Slider** (Phase A1-A3)
- [x] **RadioGroup** (Migration technique)
- [ ] **Button (Key)**: Migrate to matte face + LED + contact ring.
- [ ] **Toggle**: Migrate to Pilot Light archetype.

### Phase C: Input & Badge

- [ ] **Badge (Chip)**: Migrate to outline pill, remove role-based coloring.
- [ ] **TextInput / NumberField / TextArea**: Migrate to well + contact ring + data tag.
- [ ] **Select**: Migrate to well + contact ring.

### Phase D: Scenes & Cleanup

- [ ] **Surface (MaterialScene)**: Migrate to light field + glass pane.
- [ ] **Retire Matrix**: Remove legacy files (`colorVariants.stylex.ts`, `colorIntents`, etc.).
- [ ] **Finalize Docs**: Prune `refactor-phase-a.md`.

## Notes

- Ne jamais référencer `gruvbox-palette.stylex.ts` directement.
- Utiliser les tokens sémantiques de `tokens/colors.stylex.ts`.
- Utiliser le pattern de `Button.tsx` (factory de style) pour les variations.
- Garder `apps/dev/src/lab/` comme référence visuelle (Oracle).
