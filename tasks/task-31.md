# task-31 — apps/brouillon/src/App.tsx

- Fichier : `apps/brouillon/src/App.tsx`
- Statut : `pending`
- Catégorie : `branding` (0 cas-par-cas, 5 branding)
- Nombre de warnings dans ce fichier : 5

## Warnings à traiter

### Warning 1 — ligne 118 (colonne 76)

- Message : `Unsafe type assertion: type 'ColorNames' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
     116 |                                     label="Surface Color"
     117 |                                     value={activeColor}
>>>  118 |                                     onValueChange={(val) => setActiveColor(val as ColorNames)}
     119 |                                     options={ALL_COLORS.map((c) => ({ value: c, label: c }))}
     120 |                                 />
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 124 (colonne 73)

- Message : `Unsafe type assertion: type '"none" | "soft" | "solid"' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
     122 |                                     label="Background"
     123 |                                     value={activeBg}
>>>  124 |                                     onValueChange={(val) => setActiveBg(val as Background)}
     125 |                                     options={[
     126 |                                         { value: 'solid', label: 'Solid' },
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 3 — ligne 134 (colonne 77)

- Message : `Unsafe type assertion: type '"none" | "strong" | "subtle"' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
     132 |                                     label="Border"
     133 |                                     value={activeBorder}
>>>  134 |                                     onValueChange={(val) => setActiveBorder(val as Borders)}
     135 |                                     options={[
     136 |                                         { value: 'none', label: 'None' },
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 4 — ligne 144 (colonne 77)

- Message : `Unsafe type assertion: type '"full" | "lg" | "md" | "none" | "sm" | "xl"' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
     142 |                                     label="Radius"
     143 |                                     value={activeRadius}
>>>  144 |                                     onValueChange={(val) => setActiveRadius(val as Radius)}
     145 |                                     options={[
     146 |                                         { value: 'none', label: '0' },
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 5 — ligne 156 (colonne 80)

- Message : `Unsafe type assertion: type '"flat" | "raised" | "sunken"' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
     154 |                                     label="Elevation"
     155 |                                     value={activeElevation}
>>>  156 |                                     onValueChange={(val) => setActiveElevation(val as Elevation)}
     157 |                                     options={[
     158 |                                         { value: 'flat', label: 'Flat' },
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
