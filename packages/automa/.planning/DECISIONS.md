# Automa migration — DECISIONS (append-only, ne jamais réécrire)

- 2026-09-21 D1: cible = `packages/automa` existant, structure
  ExperimentShell conservée (patterns mosaic-maker/art-canvas/mol-demo).
- 2026-09-21 D2: Button sans fidélité aux variants tlc; familles UI
  choisies pour une interface sympa et cohérente.
- 2026-09-21 D3: sections toujours ouvertes (`ControlSection`, pas de
  repliable); `<input type=color>` brut → `ColorField`.
- 2026-09-21 D4: seule feature ajoutée = readout génération (`Readout`);
  sinon port à l'identique.
