# task-53 — tools/new-mini-app/bin/index.ts

- Fichier : `tools/new-mini-app/bin/index.ts`
- Statut : `pending`
- Catégorie : `boundary` (1 warning)
- Nombre de warnings : 1

## Stratégie recommandée

`template as unknown as Template` est une frontière de librairie (`bingo`). Garder une suppression locale avec le commentaire existant ; ne pas propager ce cast dans le code applicatif.

## Warnings actuels

### Warning 1 — ligne 11, colonne 41 (indicatif)

- Message : `Unsafe type assertion: type 'Template<AnyShape, unknown>' is more narrow than the original type.`
- Type : `boundary`

Contexte (la ligne `>>>` est celle du warning) :

```text
       9 | // strongly typed template returned by createTemplate(). Cast through `unknown`
      10 | // to bridge the two.
>>>   11 | process.exitCode = await runTemplateCLI(template as unknown as Template);
      12 |
```

## Définition de fait

- Le warning n’apparaît plus dans `vp check --no-fmt --deny-warnings`.
- Aucun nouveau warning ni erreur ; tests du package verts.
- `git diff` relu : pas de changement de comportement, de test ou de config non justifié.
- `progress.md` mis à jour ; suppression éventuelle documentée (`fichier:ligne` + raison).

## Références

- `context.md` : grille de décision, patterns, pièges connus.
- `task-58` si un helper `typedKeys` partagé est nécessaire.
