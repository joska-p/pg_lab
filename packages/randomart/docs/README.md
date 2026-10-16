# Random Art — documentation de conception

État : **specs v0.2/v0.3, relues et corrigées** (voir `revue.md`). Le code existe : l'avancement réel et les écarts avec ces specs (rendu sur `@repo/glaze`, contrat `vUv`, phase via `Clock`) sont suivis dans `../PLAN.md`, qui fait foi.

Décisions confirmées : **WebGL2** (GLSL ES 3.00) et **pas d'évaluateur CPU**.

## Ordre de lecture

1. `product-brief.md` — l'intention.
2. `glossary.md` — le vocabulaire, à lire en second : toutes les specs en dépendent.
3. `architecture.md` — les modules, les responsabilités, les **décisions D1 à D39**.
4. Les specs de module, dans l'ordre de dépendance :
    1. `catalog-spec.md` (v0.3) — opérateurs et dépendances shader
    2. `expression-spec.md` (v0.2) — le modèle d'expression
    3. `grammar-generator-spec.md` (v0.2) — grammaire, générateur, aléatoire
    4. `compiler-spec.md` (v0.2) — expression → fragment shader GLSL
    5. `renderer-spec.md` (v0.2) — exécution WebGL2, affichage, export
    6. `artwork-spec.md` (v0.1) — format d'œuvre et de grammaire, import/export
5. `explorer-spec.md` (v0.1) — l'UI telle que construite.
6. `revue.md` — ce qui a été trouvé et décidé lors de la relecture.

`idea-bank.md` est une réserve d'idées : **pas une source de vérité**.

## Explorer (UI)

Spec écrite : `explorer-spec.md` (v0.1). Contraintes qu'elle respecte :

- L'UI possède la boucle d'animation, l'état lecture/pause, la taille du canvas (pixel ratio compris) et la réduction de résolution quand l'animation ne tient pas la cadence (renderer §7, D36).
- `setShader` renvoie un résultat : l'UI affiche l'erreur et garde l'image précédente (D27).
- « Animer » n'est plus une affaire de grammaire : `tsin` et `tcos` font partie du vocabulaire par défaut (`defaultGrammar`), et l'animation relève de la lecture (horloge Play/Pause). Pas de mode Static/Animated (D11, D34).
- L'inspecteur affiche l'expression en notation fonctionnelle automatique ; l'aperçu d'un sous-arbre ignore la déformation de ses ancêtres, à signaler (compilateur §9).
- La seed vient de `randomSeed()` côté UI ; le cœur n'appelle jamais `Math.random` (D19).

## Les décisions qui structurent tout

- Un seul type de valeur : `float`, dans `[-1, 1]` **par construction des formules**, à quelques ULP près. Le GLSL est la sémantique (D5, D9, D31).
- Une expression = **trois arbres** (r, g, b), fonctions de `(x, y, t)`. Le temps est dans le modèle : `tsin` / `tcos` sur une phase qui boucle (D6, D11).
- Une grammaire = poids par opérateur (bornés) + contraintes. Une grammaire invalide n'existe pas, et le générateur ne peut pas échouer sur une grammaire valide, preuve à l'appui (D17, D18, D33).
- Capacités d'opérateurs optionnelles (`requires`, portée `inner`), pas de `kind` ; `warp` est le premier transformateur (D13, D14, D34).
- Le compilateur partage les sous-expressions par hash-consing avec contextes internés, et compte les usages selon la **multiplicité** réelle des entrées (D22, D29).
- Reproductibilité non critique ; l'expression exportée est la référence (D1).

## Tests requis (pas d'évaluateur CPU)

Sans GPU : instantanés du GLSL, catalogue, générateur, déterminisme, artwork. **En navigateur, en CI (Chromium headless)** : plage de chaque opérateur par indicateur de violation, fuzzing de mille expressions × trois politiques acceptées par le pilote, équivalence des politiques, orientation et valeurs du renderer.

## Questions encore ouvertes (aucune ne bloque la v1)

- Harmonique entière sur `tsin` / `tcos` (v2).
- Champ `display` pour la formule lisible (v2).
- Mesure du partage (`none` / `shared` / `all`) sur de vraies expressions.
- Calibrage des poids par défaut et des bornes de `loopMs` / de taille, en jouant.
- Répartition du budget du générateur : légère préférence pour les derniers enfants, à observer.
