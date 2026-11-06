# task-27 — packages/randomart-core/src/grammar.ts

- Fichier : `packages/randomart-core/src/grammar.ts`
- Statut : `pending`
- Catégorie : `branding` (0 cas-par-cas, 2 branding)
- Nombre de warnings dans ce fichier : 2

## Warnings à traiter

### Warning 1 — ligne 130 (colonne 19)

- Message : `Unsafe type assertion: type '("abs" | "add" | "const" | "cos" | "div" | "gt" | "max" | "min" | "mix" | "mul" | "neg" | "select" | "sin" | "sqr" | "sub" | "warp" | "x" | "y")[]' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
     128 |
     129 | function assertVocabulary(weights: Weights): void {
>>>  130 |     const names = Object.keys(weights) as OpName[];
     131 |     if (names.length === 0) {
     132 |         throw new RandomArtError('Grammar must enable at least one operator');
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 441 (colonne 17)

- Message : `Unsafe type assertion: type '("default" | "fractal" | "geometric" | "minimalist" | "monochrome" | "organic" | "psychedelic" | "texture")[]' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
     439 | export function presetOf(grammar: Grammar): GrammarRegistryId | undefined {
     440 |     const key = grammarKey(grammar);
>>>  441 |     const ids = Object.keys(grammarRegistry) as GrammarRegistryId[];
     442 |     return ids.find((id) => grammarKey(grammarRegistry[id].grammar) === key);
     443 | }
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

## Définition de fait
- Le(s) warning(s) de ce fichier n'apparaît(ent) plus dans `vp check` (ou `vp -C <package> check`).
- Aucun nouveau warning ni erreur de type introduit.
- La tâche est passée de `pending` à `done` dans `progress.md`.

## Références
- Commit `02b4161` (randomart-ui) : helper `typedKeys` + `oxlint-disable-next-line` pour les cas de branding.
- Commit `8f4d13d` (automa) : `Map` + fonction getter à la place de l'indexation `map[key]` non typée.
- Commit `45fecfd` (pixel-manipulator) : garde-fous `typeof` à la place de `as X | undefined`.
- Commit `1c223b4` (glaze) : suppression du branding là où il n'est plus nécessaire.
