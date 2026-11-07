# task-43 — packages/palette/src/components/Controls.tsx

- Fichier : `packages/palette/src/components/Controls.tsx`
- Statut : `pending`
- Catégorie : `keys` (2 warnings)
- Nombre de warnings : 2

## Stratégie recommandée

Remplacer les deux `Object.entries(...)` + casts par `typedKeys(colorSpaces)` et `typedKeys(rules)`, puis indexer avec la clé typée. Supprimer `key as ColorSpacesKey` et `key as RuleKey`.

## Warnings actuels

### Warning 1 — ligne 32, colonne 50 (indicatif)

- Message : `Unsafe type assertion: type '"hsl" | "oklab" | "oklch" | "srgb"' is more narrow than the original type.`
- Type : `keys`

Contexte (la ligne `>>>` est celle du warning) :

```text
      30 |             {Object.entries(colorSpaces).map(([key, space]) => (
      31 |                 <ControlSection key={key} title={space.name}>
>>>   32 |                     <ColorSpaceControls spaceId={key as ColorSpacesKey} size={200} />
      33 |                 </ControlSection>
      34 |             ))}
```

### Warning 2 — ligne 43, colonne 66 (indicatif)

- Message : `Unsafe type assertion: type '"analogous" | "complementary" | "monochromatic" | "triadic"' is more narrow than the original type.`
- Type : `keys`

Contexte (la ligne `>>>` est celle du warning) :

```text
      41 |                             title={rule.info.description}
      42 |                             onClick={() => {
>>>   43 |                                 handleGeneratePalette(baseColor, key as RuleKey);
      44 |                             }}
      45 |                         >
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
