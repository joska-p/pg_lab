# Handoff : tools/randomart-taste (session 2 → session 3)

## Contexte en 5 lignes

`tools/randomart-taste` doit permettre de choisir des _qualités visuelles_ (net, coloré,
contrasté…) et d'obtenir une grammaire randomart qui les produit plus souvent. Le plan complet est
dans `tools/randomart-taste/taste-driven-presets.md` (à relire en premier, la section « Status »
est à jour). Le pipeline : échantillonner des grammaires → rendre → mesurer des stats d'image →
apprendre la relation grammaire → stats → inverser en preset.
Conventions : tout en anglais (code, commentaires, docs), `vp check --fix` et `vp test` doivent
rester verts, ne rien commiter sans demande. L'utilisateur parle français.

## État du code (tout est vert : 56 fichiers, 320 tests au dernier rapport)

- `features.ts`, `flatten.ts` : features d'une _expression_ (comptes d'opérateurs sur le DAG…).
- `sample.ts`, `render.ts`, `renderScript.ts`, `imageStats.ts`, `run.ts` : batch Playwright
  (Chromium headless, rendu logiciel) → `data/samples.json`. Stats : brightness, contrast,
  sharpness, busyness, colorfulness, motion.
- `learn.ts` + `learnCli.ts` (`learn`) : ancienne régression ridge _au niveau expression_
  (coefficients sur les comptes d'opérateurs de l'expression tirée). R² faibles (0.12–0.37), et
  elle répond à la mauvaise question (voir ci-dessous). Probablement à garder comme référence ou
  à supprimer ; à décider.
- `grammarLevel.ts`, `grammarCli.ts` (`learn:grammar`) : régression ridge _au niveau grammaire_,
  une ligne par grammaire (stats moyennées sur ses graines), validation croisée 5 plis découpée
  par `grammarId % folds`, ablation par groupe de features (`weights`, `structure`, `space`),
  `effect` = coef × écart-type (comparable entre features). Écrit `data/grammar-level.json`.
- `preset-visual.test.ts` : rend les presets vivid/motion/muted (24 graines) et vérifie
  vivid.colorfulness > muted.colorfulness et motion.motion > muted.motion.

## Refactor fait dans cette session

L'espace colorimétrique est sorti de `Grammar` : `generate` ne le lit jamais, seul `compile` l'utilise,
c'est un post-traitement. Maintenant :

- `Grammar` n'a plus `space` ; `grammarKey`, `createGrammar`, `drawGrammar` ne le gèrent plus.
- `GrammarPreset` = `{ id, label, description, grammar, space }` (palette suggérée).
- UI : `Artwork`/`Draft` portent `space` ; `useSpace`, `setSpace`, `applyPreset` ; `ColorSection`
  dans le lab ; changer d'espace seul recompile sans régénérer (`recompileArtwork`).
- `sample.ts` : `Sample` a `space`, tiré une fois par grammaire juste après `drawGrammar`.
  `run.ts` écrit `space` au niveau de la ligne. `grammarLevel.ts` : `featuresOfGrammar(grammar, space)`.
- Snapshots `emit.golden` et `generate` strictement inchangés.

## Résultats avant refactor (cvR2, validation croisée par grammaire, 300 grammaires × 8 graines)

| groupe            | bright | contrast | sharp | busy  | color | motion |
| ----------------- | ------ | -------- | ----- | ----- | ----- | ------ |
| weights only      | -0.07  | 0.21     | -0.02 | 0.02  | -0.03 | 0.16   |
| structure only    | 0.00   | 0.04     | 0.12  | 0.17  | 0.04  | 0.07   |
| space only        | 0.66   | 0.02     | 0.00  | -0.01 | 0.60  | 0.02   |
| structure + space | 0.67   | 0.06     | 0.13  | 0.16  | 0.67  | 0.09   |
| all               | 0.65   | 0.28     | 0.16  | 0.24  | 0.65  | 0.25   |

Conclusions :

1. **Brightness et colorfulness sont expliquées presque uniquement par l'espace** (oklab : le plus
   coloré et le plus sombre ; hsl : le moins coloré ; srgb et hsl : les plus clairs). Les poids
   n'ajoutent rien (cvR2 de `all` ≤ `structure + space`). Réglage par simple table, pas par optimisation.
2. **Contrast, motion, sharpness, busyness** : cvR2 ≤ 0.28 avec un modèle linéaire. C'est là que les
   poids/la structure comptent un peu. Contrast et motion tirent surtout du groupe `weights`,
   sharpness et busyness surtout de `structure` (profondeur, budget de nœuds).
3. `shareDepth` élevé réduit la colorfulness (expression mono, plus proche du gris).
   Ces chiffres sont à refaire sur les nouvelles données (les tirages ne se reproduisent pas à
   `rngSeed` égal : `drawGrammar` ne consomme plus le rng pour l'espace ; les ordres de grandeur
   devraient rester).

## À faire en premier (l'utilisateur régénère les données)

`data/samples.json`, `data/coefficients.json`, `data/grammar-level.json` sont **périmés** (schéma
ancien : `grammar.space`, pas de `space` par ligne) et ne doivent pas être édités à la main.
L'utilisateur relance `generate` (probablement avec plus de données, ex. `--grammars 1000`), puis :

1. `vpr -C tools/randomart-taste learn` (ancienne régression, si conservée),
2. `vpr -C tools/randomart-taste learn:grammar`.
   Vérifier d'abord que `samples.json` contient bien `space` à la racine de chaque ligne et plus de
   `grammar.space`, sinon `grammarCli` échouera ou donnera des colonnes fausses.
   Note : `package.json` du script `generate` fixe `--grammars 300 --seeds 8 --size 128` et
   `CHROMIUM_PATH='/usr/bin/chromium'` ; pour d'autres volumes, appeler `src/run.ts` avec d'autres arguments.

## Prochaines étapes proposées (dans l'ordre)

1. **Relire les nouveaux chiffres `learn:grammar`.** Avec l'espace désormais séparé, l'ablation
   « weights only » est interprétable proprement. Vérification à ajouter : régression _à espace
   neutralisé_ (centrer les stats par espace, ou régresser à l'intérieur de chaque espace) pour voir
   si les poids prédisent quelque chose une fois l'effet de la palette retiré.
2. **Brightness / colorfulness** : écrire une table espace → effet (ou la lire depuis les données)
   et l'utiliser comme réglage direct « palette », indépendant de la grammaire.
3. **Contrast, motion, sharpness, busyness** : si les cvR2 restent ≤ 0.3, passer au **CEM** (direct
   search), à espace fixé : `score(grammar) = moyenne de la cible sur ~64 graines`, rendu dans la
   boucle (~30 000 rendus pour 50 candidats × 64 graines × 10 itérations ; faisable à 64 px).
   Possibilité de démarrer le CEM depuis la solution de la régression. Penser à des features non
   linéaires (interactions avec `warp`) si on reste sur la régression.
4. **Émission du bloc `preset(...)`** : arrondir en poids entiers [0, MAX_WEIGHT], garder au moins un
   terminal et un non-terminal, passer par `createGrammar` (gérer `InfeasibleGrammarError`), imprimer
   un bloc à coller dans `GRAMMAR_PRESETS` (désormais avec `space`).
5. **Validation par rendu** : générer ~64 graines avec le preset obtenu, mesurer les stats réelles,
   comparer à un tirage aléatoire. C'est le seul test qui compte.
6. Plus tard : learned taste (likes + export de session, voir la note de design).

## Pièges connus

- Les stats sont mesurées sur des images 128 px rendues en logiciel (SwiftShader) ; sharpness et
  busyness sont sensibles à la résolution.
- Les graines d'une même grammaire sont corrélées : toute validation doit découper par `grammarId`
  (c'est ce que fait `grammarLevel.ts`).
- `learn.ts` utilise une coordinate descent (les features `op.*` sont très collinéaires) ; ne pas
  revenir aux équations normales.
- L'utilisateur avait mis temporairement une désactivation de `no-unsafe-type-assertion` ; le
  refactor de `grammarLevel.ts` l'a rendue inutile (vérifier qu'elle a disparu).
- `package.json` du taste tool et le worktree contiennent des modifications non commitées de
  l'utilisateur : ne pas les écraser.
