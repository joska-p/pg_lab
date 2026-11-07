# task-27 — packages/randomart-core/src/grammar.ts

- Fichier : `packages/randomart-core/src/grammar.ts`
- Statut : `pending`
- Catégorie : `keys + validation` (2 warnings)
- Nombre de warnings : 2

## Stratégie recommandée

Deux casts différents. (1) `assertVocabulary` : `Object.keys(weights) as OpName[]` est un mensonge avant validation ; itérer sur les clés puis filtrer avec `isOpName`, ou valider les clés inconnues avant toute utilisation typée. (2) `presetOf` : `Object.keys(grammarRegistry) as GrammarRegistryId[]` → `typedKeys(grammarRegistry)`.

## Warnings actuels

### Warning 1 — ligne 130, colonne 19 (indicatif)

- Message : `Unsafe type assertion: type '("abs" | "add" | "const" | "cos" | "div" | "gt" | "max" | "min" | "mix" | "mul" | "neg" | "select" | "sin" | "sqr" | "sub" | "warp" | "x" | "y")[]' is more narrow than the original type.`
- Type : `keys`

Contexte (la ligne `>>>` est celle du warning) :

```text
     128 |
     129 | function assertVocabulary(weights: Weights): void {
>>>  130 |     const names = Object.keys(weights) as OpName[];
     131 |     if (names.length === 0) {
     132 |         throw new RandomArtError('Grammar must enable at least one operator');
```

### Warning 2 — ligne 441, colonne 17 (indicatif)

- Message : `Unsafe type assertion: type '("default" | "fractal" | "geometric" | "minimalist" | "monochrome" | "organic" | "psychedelic" | "texture")[]' is more narrow than the original type.`
- Type : `guard`

Contexte (la ligne `>>>` est celle du warning) :

```text
     439 | export function presetOf(grammar: Grammar): GrammarRegistryId | undefined {
     440 |     const key = grammarKey(grammar);
>>>  441 |     const ids = Object.keys(grammarRegistry) as GrammarRegistryId[];
     442 |     return ids.find((id) => grammarKey(grammarRegistry[id].grammar) === key);
     443 | }
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
