# Post-processing — randomart-ui

## L'idée en une phrase

Ajouter une étape de **post-processing** après le rendu du shader randomart : au lieu d'afficher directement le résultat du shader sur l'écran, on le rend d'abord dans une **texture**, puis on applique un effet (grain, flou, vignette, etc.) avant l'affichage final.

## Pourquoi ça a du sens

Aujourd'hui, `randomart-ui` fait du **rendu en un seul passage (single-pass)** :

```
shader randomart  →  canvas affiché
```

Avec le post-processing, le pipeline devient :

```
shader randomart  →  texture  →  effet (grain, …)  →  canvas affiché
```

Ce changement ouvre plusieurs possibilités :

- **Effets d'image** indépendants de la grammaire randomart (grain, bruit, flou, vignette, aberration chromatique…)
- **Fusion d'effets** : le smooth maximum peut ensuite servir à mélanger doucement l'image originale et son effet, ou plusieurs couches d'effets entre elles
- **Export PNG** : la même chaîne de post-processing peut être appliquée à l'export offscreen, pour des fichiers finaux cohérents avec l'écran

## Ce qu'on va faire (grandes lignes)

### Phase 1 — Valider le concept (maintenant)

1. **Rendu dans une texture** : modifier le rendu pour que le shader randomart dessine dans une texture intermédiaire au lieu du canvas directement.
2. **Effet de grain** : ajouter un simple bruit aléatoire par pixel sur cette texture, avant l'affichage final.
3. **Contrôle utilisateur** : un toggle ou curseur dans `Controls` pour activer/désactiver le grain et en régler l'intensité.

L'objectif de cette phase est uniquement de prouver que l'architecture multi-passe fonctionne. Le grain est volontairement simple : ce n'est pas l'effet final qui nous intéresse, c'est la mécanique.

### Phase 2 — Smooth maximum (plus tard)

Une fois le post-processing validé, réfléchir à l'intégration du **smooth maximum** :

- soit comme opérateur dans la grammaire `randomart-core` (idée A),
- soit comme fonction de mélange dans le post-processing (idée C),
- ou les deux.

Ce n'est pas le sujet de cette première étape.

### Phase 3 — Autres effets (plus tard)

Vignette, flou, correction de couleur, grain de film, etc. Chaque effet s'ajoute comme un nouveau shader de post-processing qui lit la texture produite par l'étape précédente.

## Ce qui n'est pas dans le périmètre pour l'instant

- Aucun détail d'implementation WebGL (textures, framebuffers, shaders de passage supplémentaire)
- Aucun changement dans `randomart-core` ni dans la grammaire
- Le smooth maximum et les effets complexes (flou, vignette, …)

## Prochaines étapes immédiates

1. Relire ce document et valider la direction avec l'équipe.
2. Spécifier l'interface utilisateur minimale pour le grain (toggle + intensité).
3. Commencer l'implementation de la Phase 1.

## Questions ouvertes

- Le grain doit-il être animé (bruit qui bouge à chaque frame) ou statique ?
- L'export PNG doit-il inclure le post-processing, ou rester un rendu "brut" du shader ?
- Y a-t-il d'autres effets simples qu'on voudrait ajouter dès la Phase 1 aux côtés du grain ?
