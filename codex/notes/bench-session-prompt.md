# Next Session Prompt — Bench/Dataset Pipeline & Grammar Registry

## Contexte

- Randomart stabilisé (cycles uniformes, clamps OK, 4% plates acceptées, `changeRate` nettoyé)
- Handoff supprimé — on repart propre
- Objectif : **pipeline bench/dataset → registre de grammaires "caractères propres"**

---

## Le problème à débrouiller

### Ce qu'on a aujourd'hui

- `drawGrammar` : tirage aléatoire poids 0..4 → grammaire quantifiée, hashable
- `generate` : expression déterministe depuis grammaire + seed
- Bench : contact sheet 6×6 (36 seeds/grammaire)
- Dataset : 4×4 (16 seeds/grammaire) + features (PCA, descripteurs, corrélations)
- Notebook : système de notation (ratings) + stockage

### Ce qui bloque

1. **Notation simple = insuffisant**. Noter 1-5 une image ne capture pas le "caractère" d'une grammaire. Une grammaire peut produire des images variées selon les seeds.
2. **PCA/descripteurs = boîte noire**. Les features numériques (moyenne, variance, entropie, composantes principales) sont calculées mais **pas visualisées** de façon exploitable. Je ne sais pas "regarder" une grammaire dans l'espace latent.
3. **Pas de boucle visuelle**. Je ne peux pas : voir une grammaire → voir ses variations (seeds) → voir ses voisins dans l'espace → comprendre son "caractère" → l'étiqueter.

### Ce qu'il faut construire

Un **registre de grammaires caractérisées** où chaque entrée a :

- Son identité (hash poids + size + shareDepth + space)
- Son "caractère" : descripteurs visuels lisibles (ex: "organique fluide", "géométrique angulaire", "texturé bruit", "radial symétrique")
- Ses variations typiques (contact sheet représentatif)
- Sa position dans l'espace des grammaires (voisins, clusters)

---

## Questions ouvertes pour la session

1. **Unité d'évaluation : grammaire ou image ?**
    - Noter des images individuelles → bruit, variance intra-grammaire
    - Noter des grammaires (via contact sheet) → plus stable, mais comment agréger ?

2. **Descripteurs : calculés ou annotés ?**
    - PCA/features numériques → objectifs, mais opaques
    - Tags humains ("fluide", "angulaire", "symétrique") → lisibles, mais subjectifs
    - Hybride : features → clusters → labels humains sur clusters ?

3. **Visualisation nécessaire :**
    - Contact sheet interactif (zoom, sélection seed)
    - Projection 2D (PCA/t-SNE/UMAP) avec thumbnails
    - "Grammar card" : features clés + mini contact sheet + tags

4. **Pipeline cible (nouveau) :**
    - **Lab** : explorer → save (grammaire + seed + image) → tag
    - **Bench/Saved** : galerie taguée, filtres par tag, dédup par grammaire
    - **Export lot** : sélection → script Node calcule features + projection
    - **Cluster + label** : tags humains = labels → clusters sémantiques
    - **Registre** : clusters étiquetés + grammaires canoniques + variations

    _Ancien (batch) conservé en fallback :_ Générer N grammaires → contact sheets → features → cluster → label

5. **À quoi sert le registre ?**
    - Presets curatés pour l'app (remplacer le tirage pur aléatoire)
    - Exploration guidée ("montre-moi des grammaires type 'organique'")
    - Bench reproductible (échantillonnage stratifié par caractère)

---

## 💡 Nouvelle approche : Curation human-in-the-loop (idée utilisateur)

**Remplacer la génération par batch** par un workflow interactif :

1. **Dans l'app (Lab)** : exploration libre, quand une image plaît → **Save** (grammaire + seed + image)
2. **Dans le Bench** : vue "Saved" = galerie des images sauvegardées
    - Chaque entrée : thumbnail + grammaire (hash) + seed + tags
    - **Système de tags** : "organique", "géométrique", "symétrique", "texturé", "animé", etc.
    - Multi-tags par image, tags suggérés par features (optionnel)
3. **Export lot** : quand N images taguées → exporter vers dataset pipeline
    - Le pipeline calcule features, projette, clusterise
    - Les tags humains deviennent **labels de vérité terrain** pour les clusters
    - Registre = clusters étiquetés + grammaires représentatives

**Avantages :**

- Pas de bruit : que des images _validées_ par l'humain
- Tags = signaux sémantiques riches (vs note 1-5)
- Boucle courte : explore → save → tag → exporte → registre s'enrichit
- Réutilise l'app existante comme outil de curation

**Questions architecturales :**

- Stockage "Saved" : IndexedDB (notebook existant) ou nouveau store ?
- Tagging : vocabulaire libre ou taxonomie fermée ?
- Déduplication : même grammaire + seeds différents = une entrée ou plusieurs ?
- Export : format ? (JSONL grammaire+seeds+tags+features ?)

---

## Contraintes techniques

- `vp -C packages/randomart dataset` : CLI existante (write, features, pca, sheet)
- `benchSeedsPerGrammar: 36`, `datasetSeedsPerGrammar: 16`
- Features : `descriptors.ts` (stats image), `pca.ts` (projection)
- Notebook : `notebook.ts` + `rating.ts` + IndexedDB
- Pas de backend — tout client-side ou scripts Node

---

## Livrable attendu de la session

**Pas de code complet**. Un **plan clair** avec :

1. **Architecture du registre** (schéma : grammaire, seeds, tags, features, cluster, label)
2. **Workflow curation** : Lab (save) → Bench/Saved (tag, filtre, dédup) → Export
3. **Choix tagging** : vocabulaire libre vs taxonomie + suggestion auto par features
4. **Visualisations minimales** : galerie Saved (thumbnails + tags), grammar card, projection 2D
5. **Pipeline step-by-step** (curation → export → features → cluster → label → registre)
6. **Premier spike** : store "Saved" + UI tagging dans Bench + export JSONL

---

## Note pour l'agent

- Langue : français pour discussion, anglais pour code/docs
- Ne pas optimiser le générateur (GENERATOR_VERSION stable)
- Le bench/dataset **change la forme** du registre — c'est le cœur du travail
- Éviter la complexité prématurée : commencer par ce qui se _voit_
