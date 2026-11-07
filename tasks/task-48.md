# task-48 — packages/pixel/src/worker/process-image-in-worker.ts

- Fichier : `packages/pixel/src/worker/process-image-in-worker.ts`
- Statut : `pending`
- Catégorie : `guard` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

Après `'error' in event.data`, vérifier `typeof event.data.error === 'string'` avant `new Error(...)` ; supprimer le cast `as string`.

## Warnings actuels

### Warning 1 — ligne 52, colonne 50 (indicatif)

- Message : `Unsafe type assertion: type 'string' is more narrow than the original type.`
- Type : `guard`

Contexte (la ligne `>>>` est celle du warning) :

```text
      50 |     deserialize: (event: MessageEvent<Record<string, unknown>>) => {
      51 |         if ('error' in event.data) {
>>>   52 |             return { ok: false, error: new Error(event.data.error as string) };
      53 |         }
      54 |
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
