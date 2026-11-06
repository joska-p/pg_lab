# task-43 — packages/palette/src/components/Controls.tsx

- Fichier : `packages/palette/src/components/Controls.tsx`
- Statut : `pending`
- Catégorie : `branding` (0 cas-par-cas, 2 branding)
- Nombre de warnings dans ce fichier : 2

## Warnings à traiter

### Warning 1 — ligne 32 (colonne 50)

- Message : `Unsafe type assertion: type '"hsl" | "oklab" | "oklch" | "srgb"' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      30 |             {Object.entries(colorSpaces).map(([key, space]) => (
      31 |                 <ControlSection key={key} title={space.name}>
>>>   32 |                     <ColorSpaceControls spaceId={key as ColorSpacesKey} size={200} />
      33 |                 </ControlSection>
      34 |             ))}
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 43 (colonne 66)

- Message : `Unsafe type assertion: type '"analogous" | "complementary" | "monochromatic" | "triadic"' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      41 |                             title={rule.info.description}
      42 |                             onClick={() => {
>>>   43 |                                 handleGeneratePalette(baseColor, key as RuleKey);
      44 |                             }}
      45 |                         >
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
