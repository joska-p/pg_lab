# task-52 — packages/ui/src/components/Select.tsx

- Fichier : `packages/ui/src/components/Select.tsx`
- Statut : `done`
- Catégorie : `boundary`
- Nombre de warnings : 1 → 0

## Correction appliquée

Le cast `event.currentTarget.value as T` a été remplacé par une validation contre les options
réellement rendues :

```tsx
function findSelected(rawValue: string): SelectOption<T> | undefined {
    return items.find((option) => option.value === rawValue);
}
```

puis, dans `onChange` :

```tsx
const selected = findSelected(event.currentTarget.value);
if (selected) {
    onValueChange?.(selected.value);
}
```

C’est le bon pattern pour ce composant : le DOM renvoie une `string`, mais seules les valeurs de
`items` sont émises. Aucune suppression `oxlint-disable` n’est nécessaire.

## Vérification

- `vp -C packages/ui check --no-fmt --deny-warnings` : plus de warning dans `Select.tsx`.
- Le seul warning restant du package est `ExperimentShell.tsx` (`task-51`).

## Notes

- Ne pas déplacer ce cast dans les consommateurs (`App.tsx`, `notebook`, etc.) : ils doivent
  corriger leur inférence (`task-31`, `task-42`).
