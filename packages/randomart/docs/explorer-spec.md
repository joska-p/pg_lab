# Spec — Explorer (UI)

Version de travail 0.1, écrite **après** le squelette et les lots B, C et E : elle décrit ce qui existe et les contraintes à garder. Termes dans `glossary.md`, avancement réel dans `../PLAN.md`.

## 1. Responsabilité

L'explorer orchestre : il possède l'état (Zustand), la boucle de lecture, la taille du canvas, et branche le cœur (grammaire, générateur, compilateur) sur le rendu. Il ne contient aucune logique de génération ou de compilation.

## 2. Contraintes (issues du README et des décisions)

- **L'UI possède le temps** : l'horloge (`Clock`/`ClockStore` de glaze) démarre **en pause** à la phase 0. Play/Pause/Reset la pilotent. Une seed = une expression = **un seul shader** : « animer » est une question de lecture, pas de grammaire.
- **Un échec ne détruit rien** : le shader refusé par le pilote garde l'image précédente (`onShaderError`) ; une génération, une compilation ou un import qui échoue garde l'état précédent et affiche son erreur (`actionError`).
- **La seed vient de `randomSeed()`** côté UI ; le cœur n'appelle jamais `Math.random`.
- **Rendu paresseux** : une image qui ne change pas ne coûte pas de GPU (`needsRender`). Dépend de `preserveDrawingBuffer: true`.

## 3. État

| Champ                        | Rôle                                                                  |
| ---------------------------- | --------------------------------------------------------------------- |
| `grammar`, `grammarSummary`  | grammaire courante et son résumé (part de terminaux, croissance)      |
| `seed`, `expression`         | l'image courante                                                      |
| `compiledShader`             | résultat de `compile` (source, `animated`, stats)                     |
| `history`, `currentId`       | 30 derniers états `(seed, grammar)`, restaurables en un clic          |
| `selected`                   | `Address` du nœud inspecté ; remis à `null` quand l'expression change |
| `clockStore`, `duration`     | lecture et durée de boucle                                            |
| `shaderError`, `actionError` | erreur du pilote / erreur d'une action d'exploration                  |

Toute nouvelle image passe par **un seul point d'écriture** (`commit`) : générer, compiler, publier, tout ou rien.

## 4. Actions

- **Nouvelle image** : la seed change, la grammaire reste.
- **Nouveaux poids / nouveau vocabulaire / nouvelle grammaire** : la grammaire change (`randomize*`), **la seed reste**, pour comparer l'effet sur une même seed.
- **Réinitialiser** : retour à la grammaire par défaut (`defaultGrammar`), même seed.
- **Historique** : restaurer une entrée régénère l'image depuis `(seed, grammar)` sans créer de nouvelle entrée ; une œuvre importée garde son expression (D1) et se restaure sans régénérer.
- **Fichiers** : export/import d'une grammaire (JSON versionné) ; export/import d'une œuvre (`.randomart.json`) avec statut de provenance affiché ; export PNG du canvas.

## 5. Inspecteur

- **Arbre** des trois canaux ; chaque nœud est repérable par son `Address` (`g.in[1].in[0]`). La sélection se fait au clic.
- **Formule** automatique en notation fonctionnelle, générée depuis les noms d'opérateurs (`add(sin(x), const(0.3))`).
- **Statistiques du compilateur** : nœuds, sommets, variables, contextes, taille du source.
- **Aperçu d'une sous-expression** : le sous-arbre est compilé seul, dans le contexte racine, en niveaux de gris (`r = g = b = nœud`). **Limites affichées dans l'UI** : la déformation des ancêtres (`warp`) est ignorée, et l'aperçu a sa propre horloge, figée à la phase 0.

## 6. Questions ouvertes

- Survol d'un nœud pour prévisualiser sans cliquer.
- Aperçu synchronisé sur la phase de l'image principale (demande de partager la phase sans partager l'horloge, qui est mise à jour par chaque surface).
- Comparaison côte à côte de deux grammaires (v2, `grammarKey`).
- Édition libre de l'expression (le fichier d'œuvre la transporte déjà) ; champ titre dans l'UI.
