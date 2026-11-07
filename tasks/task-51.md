# task-51 — packages/ui/src/components/ExperimentShell.tsx

- Fichier : `packages/ui/src/components/ExperimentShell.tsx`
- Statut : `done`
- Catégorie : `signature`
- Nombre de warnings : 1 → 0

## Correction appliquée

Le cast `as React.CSSProperties` a été remplacé par un type intersection explicite :

```ts
type PanelStyle = React.CSSProperties & {
    readonly '--panel-height'?: string;
};

const panelStyle: PanelStyle = {
    '--panel-height': panelHeight != null ? `${panelHeight}px` : undefined,
};
```

puis `style={panelStyle}`. Aucune suppression `oxlint-disable` n’est nécessaire : la custom
property est déclarée dans le type.

## Vérification

- `vp -C packages/ui check --no-fmt --deny-warnings` : plus de warning dans ce fichier.
- Le pattern `CssVars` / `PanelStyle` est réutilisable pour `task-39` (`--tile-size`).

## Notes

- Le scratch `packages/ui/src/__scratch.ts` a servi à valider le pattern ; il a été déplacé dans
  `/tmp/opencode/pg_lab__scratch.ts`.
