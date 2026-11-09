# Handoff : tools/randomart-taste (session 3 → session 4)

## Contexte en 5 lignes

`tools/randomart-taste` doit permettre de choisir des _qualités visuelles_ (net, coloré,
contrasté…) et d'obtenir une grammaire randomart qui les produit plus souvent. Le pipeline :
échantillonner des grammaires → rendre → mesurer des stats d'image → apprendre la relation
grammaire → stats → inverser en preset. Les 6 premiers presets appris sont maintenant intégrés
dans `GRAMMAR_PRESETS`. Conventions : tout en anglais, `vp check --fix` et `vp test` verts, ne
rien commiter sans demande. L'utilisateur parle français.

## État actuel (tout est vert : 674 fichiers, 313 tests)

- `data/samples.json` : 1 000 grammaires × 16 graines = 16 000 lignes, schéma nouveau
  (`space` par ligne, plus de `grammar.space`).
- `data/grammar-level.json` : régression ridge au niveau grammaire, cvR2 par cible :
  - brightness 0.80 (espace dominant)
  - colorfulness 0.77 (espace dominant)
  - contrast 0.48 (poids dominant)
  - busyness 0.45 (structure dominante)
  - motion 0.43 (poids dominant)
  - sharpness 0.37 (structure dominante)
- `packages/randomart-core/src/grammar.ts` : `GRAMMAR_PRESETS` contient maintenant 6 presets
  appris (`brightness`, `contrast`, `sharpness`, `busyness`, `colorfulness`, `motion`) avec
  leurs poids entiers, espace, profondeur, partage. Les anciens dummy presets sont supprimés.
- `isMonoGrammar` supprimé (plus utilisé). `isMonoExpression` conservé dans `tree.ts`
  (encore utilisé par `Inspector.tsx` et `features.ts`).
- `preset-visual.test.ts` mis à jour : teste `colorfulness`, `motion`, `brightness`.
- `emit.golden.test.ts` : snapshots régénérés pour les nouveaux presets.

## Ce qui reste à faire (dans l'ordre)

1. **Validation par rendu final** : générer ~64 graines par preset appris, mesurer les vraies
   stats, comparer à un tirage aléatoire. C'est le seul test qui compte vraiment.
2. (Optionnel) Régression « à espace neutralisé » pour vérifier si les poids prédisent encore
   quelque chose une fois l'effet de la palette retiré.
3. Plus tard : learned taste (likes + export de session, voir la note de design).

## Limite à noter (pas pour maintenant)

Les features actuelles (brightness, contrast, sharpness, busyness, colorfulness, motion) sont
intéressantes pour composer des grammaires, mais elles ne suffisent pas à créer des grammaires
complètes et expressives. Il faudra ajouter plus de features à l'avenir pour aller plus loin.
Ce point est noté ici pour ne pas l'oublier, mais n'est pas dans le scope immédiat.

## Pièges connus

- Stats mesurées sur 128 px (SwiftShader) ; sharpness et busyness sensibles à la résolution.
- Graines d'une même grammaire corrélées : toute validation découpe par `grammarId`.
- Ne pas revenir aux équations normales pour la régression (features `op.*` très collinéaires).
