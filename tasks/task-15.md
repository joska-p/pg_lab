# task-15 — packages/sequencer/src/components/layers/LayerOptionSection.tsx

- Fichier : `packages/sequencer/src/components/layers/LayerOptionSection.tsx`
- Statut : `done`
- Catégorie : `guard` (historique)
- Nombre de warnings dans ce fichier : 3

## Warnings à traiter

### Warning 1 — ligne 46 (colonne 41)

- Message : `Unsafe type assertion: type 'string' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      44 |                             <input
      45 |                                 type="color"
>>>   46 |                                 value={(currentValue as string) || '#ffffff'}
      47 |                                 onChange={(e) => {
      48 |                                     onChange(key, e.target.value);
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 60 (colonne 40)

- Message : `Unsafe type assertion: type 'string' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      58 |                             <TextInput
      59 |                                 label={descriptor.label}
>>>   60 |                                 value={currentValue as string}
      61 |                                 onValueChange={(value) => {
      62 |                                     onChange(key, value);
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 3 — ligne 74 (colonne 42)

- Message : `Unsafe type assertion: type 'boolean' is more narrow than the original type.`
- Type : `cas-par-cas`

Extrait du code :

```text
      72 |                             <Checkbox
      73 |                                 label={descriptor.label}
>>>   74 |                                 checked={currentValue as boolean}
      75 |                                 onCheckedChange={(checked) => {
      76 |                                     onChange(key, checked);
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
