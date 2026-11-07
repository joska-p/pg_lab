# task-31 — apps/brouillon/src/App.tsx

- Fichier : `apps/brouillon/src/App.tsx`
- Statut : `pending`
- Catégorie : `inference` (5 warnings)
- Nombre de warnings : 5

## Stratégie recommandée

`Select` et `Segmented` sont déjà génériques. Les 5 casts viennent d’options élargies en `string` (tableaux inline) et/ou d’annotations redondantes. Typer les options (`as const satisfies readonly { value: ColorNames; label: string }[]`, etc.) et laisser `T` s’inférer ; supprimer les `as`. Aucune suppression `oxlint-disable` dans ce fichier.

## Warnings actuels

### Warning 1 — ligne 118, colonne 76 (indicatif)

- Message : `Unsafe type assertion: type 'ColorNames' is more narrow than the original type.`
- Type : `inference`

Contexte (la ligne `>>>` est celle du warning) :

```text
     116 |                                     label="Surface Color"
     117 |                                     value={activeColor}
>>>  118 |                                     onValueChange={(val) => setActiveColor(val as ColorNames)}
     119 |                                     options={ALL_COLORS.map((c) => ({ value: c, label: c }))}
     120 |                                 />
```

### Warning 2 — ligne 124, colonne 73 (indicatif)

- Message : `Unsafe type assertion: type '"none" | "soft" | "solid"' is more narrow than the original type.`
- Type : `inference`

Contexte (la ligne `>>>` est celle du warning) :

```text
     122 |                                     label="Background"
     123 |                                     value={activeBg}
>>>  124 |                                     onValueChange={(val) => setActiveBg(val as Background)}
     125 |                                     options={[
     126 |                                         { value: 'solid', label: 'Solid' },
```

### Warning 3 — ligne 134, colonne 77 (indicatif)

- Message : `Unsafe type assertion: type '"none" | "strong" | "subtle"' is more narrow than the original type.`
- Type : `inference`

Contexte (la ligne `>>>` est celle du warning) :

```text
     132 |                                     label="Border"
     133 |                                     value={activeBorder}
>>>  134 |                                     onValueChange={(val) => setActiveBorder(val as Borders)}
     135 |                                     options={[
     136 |                                         { value: 'none', label: 'None' },
```

### Warning 4 — ligne 144, colonne 77 (indicatif)

- Message : `Unsafe type assertion: type '"full" | "lg" | "md" | "none" | "sm" | "xl"' is more narrow than the original type.`
- Type : `inference`

Contexte (la ligne `>>>` est celle du warning) :

```text
     142 |                                     label="Radius"
     143 |                                     value={activeRadius}
>>>  144 |                                     onValueChange={(val) => setActiveRadius(val as Radius)}
     145 |                                     options={[
     146 |                                         { value: 'none', label: '0' },
```

### Warning 5 — ligne 156, colonne 80 (indicatif)

- Message : `Unsafe type assertion: type '"flat" | "raised" | "sunken"' is more narrow than the original type.`
- Type : `inference`

Contexte (la ligne `>>>` est celle du warning) :

```text
     154 |                                     label="Elevation"
     155 |                                     value={activeElevation}
>>>  156 |                                     onValueChange={(val) => setActiveElevation(val as Elevation)}
     157 |                                     options={[
     158 |                                         { value: 'flat', label: 'Flat' },
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
