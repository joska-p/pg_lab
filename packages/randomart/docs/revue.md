# Revue des specs — journal

Deux passes : cohérence entre documents, puis adversariale sur chaque invariant annoncé. Pour chaque point : constat, décision, où c'est corrigé.

## A. Défauts réels corrigés

| #   | Constat                                                                                                                                                                                                                                                                                 | Décision                                                                                                                                                                                      | Où                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | **Explosion du texte GLSL.** Le comptage d'usages ne regardait que les références de l'arbre. `sqr(a)` s'écrit `a*a` et `mix` écrit `t` deux fois : sous `shared`, `a` avec un seul usage était recopié, et une chaîne de `sqr` donnait un texte en `2^profondeur` (profondeur max 16). | Le compilateur **sonde** `glsl` et `innerCoords` avec des sentinelles pour mesurer la multiplicité de chaque entrée ; les usages en tiennent compte. Garde-fou : source ≤ 200 000 caractères. | D29, D35 ; compilateur §3, §5.0–5.2 ; catalogue §4–5 |
| 2   | **`tsin` présenté comme atome** alors que son texte est `sin(2.0*PI*u_phase)`.                                                                                                                                                                                                          | `tsin` n'est pas un atome ; la définition des atomes inclut les littéraux négatifs entre parenthèses.                                                                                         | compilateur §5.2, exemple                            |
| 3   | **Numéro de variable de l'exemple** (`v2`) incohérent avec l'ordre de création.                                                                                                                                                                                                         | Identifiants à partir de 0 dans l'ordre de création ; l'exemple devient `v1`.                                                                                                                 | compilateur §5.1, exemple                            |
| 4   | **Usages des entrées `current` d'un contexte** non définis.                                                                                                                                                                                                                             | Comptés avec la multiplicité d'`innerCoords`, **une fois par contexte créé**.                                                                                                                 | compilateur §5.1                                     |
| 5   | **Valeurs attendues du test d'orientation** calculées en ×256 (`160, 224`).                                                                                                                                                                                                             | Valeurs exactes en ×255 : `32, 96, 159, 223`.                                                                                                                                                 | renderer §12                                         |
| 6   | **Collisions de noms GLSL** possibles (une fonction auxiliaire nommée comme un builtin).                                                                                                                                                                                                | Préfixes obligatoires : uniforms `u_*`, fonctions `ra_*` ; opérateurs `^[a-z][a-z0-9_]*$`. Fin de la liste de noms réservés à maintenir.                                                      | D30 ; catalogue §4–5                                 |
| 7   | **Contrat de plage trop strict.** `mix` peut dépasser `1` de quelques ULP par arrondi.                                                                                                                                                                                                  | Contrat « à quelques ULP près », tolérance `1e-6`, `clamp` final comme filet.                                                                                                                 | D31 ; catalogue §2                                   |
| 8   | **Test de plage inopérant.** Écrire la valeur dans un RGBA8 l'écrête et cache la violation.                                                                                                                                                                                             | Le shader de test écrit un **indicateur** de violation.                                                                                                                                       | catalogue §9 ; architecture                          |
| 9   | **Poids qui dérivent** sans limite sous randomisations répétées ; division par zéro possible dans `preserveTerminalShare`.                                                                                                                                                              | Poids dans `[0, 100]` (0 = hors vocabulaire), cas « aucun non terminal » traité.                                                                                                              | D33 ; grammaire §4, §7                               |
| 10  | **Déterminisme incomplet** : consommation du PRNG, `weighted`, `-0`, ordre des opérateurs dans les randomisations.                                                                                                                                                                      | Ordre de consommation écrit ; `weighted` consomme toujours un tirage ; `-0 → 0` ; parcours alphabétiques.                                                                                     | grammaire §3, §6, §7 ; expression §5                 |
| 11  | **Import non borné en profondeur** (pile saturée par un fichier malveillant).                                                                                                                                                                                                           | Profondeur ≤ 64 en plus de 5 000 nœuds.                                                                                                                                                       | D35 ; expression §4 bis                              |
| 12  | `Rect` utilisé sans définition ; `phaseAt` pouvait en théorie renvoyer `1` ; centre des pixels non précisé ; texture sans `CLAMP_TO_EDGE` ; `containRect` pouvait donner 0 pixel.                                                                                                       | Corrigés.                                                                                                                                                                                     | renderer §3, §4, §5, §6, §7                          |

## B. Invariants vérifiés sans contre-exemple

- Chaque formule du catalogue reste dans `[-1, 1]` ; `ra_fold2` fixe `-1`, `0`, `1` et replie le reste.
- Le générateur ne peut pas échouer : preuve explicite ajoutée (grammaire §6) pour l'invariant `B ≥ minSize` et le partage `floor(libre / (k − i))`.
- `minSize` : exemples du texte (15 et 4 nœuds) vérifiés.
- Le vertex shader couvre bien `[-1, 1]²` ; le flip des lignes de `readPixels` est cohérent avec `y` vers le haut.
- `innerCoords` ne recevant que les entrées `current` **suffit** pour `warp`, rotation et zoom (exemples dans le catalogue §6).

## C. Décisions prises pour toi

| Sujet                                     | Décision                                                         |
| ----------------------------------------- | ---------------------------------------------------------------- |
| WebGL2, pas d'évaluateur CPU              | Confirmés (D21, D9)                                              |
| `minDepth` = « aucune feuille avant »     | Conservé, coût documenté, valeur 2 ou 3 conseillée (D32)         |
| `warp` en v1                              | Oui, poids 0.5 (D34)                                             |
| Grammaire par défaut                      | `defaultGrammar`, terminaux de temps compris (D34)               |
| Constante dans `[-1, 1]`                  | Oui                                                              |
| Canaux indépendants, `maxNodes` par canal | Oui en v1 (D39)                                                  |
| Images unies                              | Autorisées ; `x` et `y` protégés à la randomisation (D39)        |
| Librairie graphique                       | Renderer indépendant, canvas brut (D36)                          |
| Défauts : taille, boucle, fond            | `1024²`, `8000 ms`, noir (D36)                                   |
| Formule lisible                           | Notation fonctionnelle automatique en v1, `display` en v2        |
| Tests navigateur                          | Requis, en CI headless (D31)                                     |
| Sauvegarde de grammaires                  | Export/import individuel en v1, liste et comparaison en v2 (D37) |
| Spec `artwork`                            | Écrite (v0.1)                                                    |

## D. Cohérence documentaire

- _Valeur_ (nombre) / _sommet_ (compilateur) / _nœud_ (arbre) distingués dans le glossaire (D38).
- « Règle » : exclusion du glossaire précisée (sens grammatical seulement).
- Un seul `product-brief.md` ; l'ancien nom `product.brief.md` disparaît. README et `idea-bank.md` n'évoquent plus d'évaluateur CPU actif.
- Références personnelles (« ta librairie », « tes `createFontSize` ») neutralisées.
- Versions mises à jour : catalogue 0.3, expression 0.2, grammaire 0.2, compilateur 0.2, renderer 0.2, artwork 0.1.
