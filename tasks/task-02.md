# task-02 — packages/glaze/src/core/InputStore.ts

- Fichier : `packages/glaze/src/core/InputStore.ts`
- Statut : `pending`
- Catégorie : `branding` (0 cas-par-cas, 9 branding)
- Nombre de warnings dans ce fichier : 9

## Warnings à traiter

### Warning 1 — ligne 80 (colonne 29)

- Message : `Unsafe type assertion: type 'EventListener' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      78 |         // and localised here — this table is where all DOM impurity is concentrated.
      79 |         this.#targetBindings = [
>>>   80 |             ['pointermove', this.#onPointerMove as EventListener],
      81 |             ['pointerdown', this.#onPointerDown as EventListener],
      82 |             ['pointerup', this.#onPointerUp as EventListener],
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 2 — ligne 81 (colonne 29)

- Message : `Unsafe type assertion: type 'EventListener' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      79 |         this.#targetBindings = [
      80 |             ['pointermove', this.#onPointerMove as EventListener],
>>>   81 |             ['pointerdown', this.#onPointerDown as EventListener],
      82 |             ['pointerup', this.#onPointerUp as EventListener],
      83 |             ['pointercancel', this.#onPointerCancel as EventListener],
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 3 — ligne 82 (colonne 27)

- Message : `Unsafe type assertion: type 'EventListener' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      80 |             ['pointermove', this.#onPointerMove as EventListener],
      81 |             ['pointerdown', this.#onPointerDown as EventListener],
>>>   82 |             ['pointerup', this.#onPointerUp as EventListener],
      83 |             ['pointercancel', this.#onPointerCancel as EventListener],
      84 |             ['wheel', this.#onWheel as EventListener, { passive: false }],
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 4 — ligne 83 (colonne 31)

- Message : `Unsafe type assertion: type 'EventListener' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      81 |             ['pointerdown', this.#onPointerDown as EventListener],
      82 |             ['pointerup', this.#onPointerUp as EventListener],
>>>   83 |             ['pointercancel', this.#onPointerCancel as EventListener],
      84 |             ['wheel', this.#onWheel as EventListener, { passive: false }],
      85 |             ['contextmenu', this.#onContextMenu as EventListener],
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 5 — ligne 84 (colonne 23)

- Message : `Unsafe type assertion: type 'EventListener' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      82 |             ['pointerup', this.#onPointerUp as EventListener],
      83 |             ['pointercancel', this.#onPointerCancel as EventListener],
>>>   84 |             ['wheel', this.#onWheel as EventListener, { passive: false }],
      85 |             ['contextmenu', this.#onContextMenu as EventListener],
      86 |         ];
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 6 — ligne 85 (colonne 29)

- Message : `Unsafe type assertion: type 'EventListener' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      83 |             ['pointercancel', this.#onPointerCancel as EventListener],
      84 |             ['wheel', this.#onWheel as EventListener, { passive: false }],
>>>   85 |             ['contextmenu', this.#onContextMenu as EventListener],
      86 |         ];
      87 |
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 7 — ligne 89 (colonne 25)

- Message : `Unsafe type assertion: type 'EventListener' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      87 |
      88 |         this.#windowBindings = [
>>>   89 |             ['keydown', this.#onKeyDown as EventListener],
      90 |             ['keyup', this.#onKeyUp as EventListener],
      91 |         ];
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 8 — ligne 90 (colonne 23)

- Message : `Unsafe type assertion: type 'EventListener' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
      88 |         this.#windowBindings = [
      89 |             ['keydown', this.#onKeyDown as EventListener],
>>>   90 |             ['keyup', this.#onKeyUp as EventListener],
      91 |         ];
      92 |     }
```

Approche suggérée : voir `context.md` (patterns de correction des commits précédents).

### Warning 9 — ligne 141 (colonne 24)

- Message : `Unsafe type assertion: type 'AttachedHandle' is more narrow than the original type.`
- Type : `branding`

Extrait du code :
```text
     139 |         }
     140 |
>>>  141 |         const handle = {} as AttachedHandle;
     142 |
     143 |         this.#handle = handle;
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
