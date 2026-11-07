# task-32 — apps/playground/src/components/home/Controls.tsx

- Fichier : `apps/playground/src/components/home/Controls.tsx`
- Statut : `pending`
- Catégorie : `keys` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

Remplacer `Object.keys(shellBackground).map(value => ({ value: value as ShellBackground }))` par `typedKeys(shellBackground).map(value => ({ value, label: value }))`. Supprimer aussi l’annotation `(val: ShellBackground)` si l’inférence suffit.

## Warnings actuels

### Warning 1 — ligne 11, colonne 12 (indicatif)

- Message : `Unsafe type assertion: type '"auroral-fluid" | "lava-flow" | "thermal-magma"' is more narrow than the original type.`
- Type : `keys`

Contexte (la ligne `>>>` est celle du warning) :

```text
       9 |     label: string;
      10 | }[] = Object.keys(shellBackground).map((value) => ({
>>>   11 |     value: value as ShellBackground,
      12 |     label: value,
      13 | }));
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
