# Contexte — correction des warnings `typescript/no-unsafe-type-assertion`

## But
Éliminer tous les avertissements `typescript/no-unsafe-type-assertion` remontés par `vp check` (rule mise à `'warn'` dans `vite.config.ts:220`). Aucune modification de code n'a encore été faite par cet agent ; ce fichier prépare le terrain pour les agents de session suivante.

## Règle
`vite.config.ts` : `'typescript/no-unsafe-type-assertion': 'warn'` (déjà présent, commit `9627b5f`).

## Commandes de vérification
- Repo entier : `vp check` (ou `./node_modules/.bin/vp check`)
- Un paquet : `vp -C packages/<nom> check`
- Filtrer les warnings de cette règle : `vp check 2>&1 | grep no-unsafe-type-assertion`

## État des lieux (généré par `vp check`, commit courant `8f4d13d`)
- 122 avertissements dans 53 fichiers uniques.
- Liste détaillée : voir `progress.md` et un fichier `tasks/task-XX.md` par fichier à traiter.

## Patterns de correction observés dans les commits précédents (à réutiliser)
Commits de référence : `9627b5f`, `02b4161` (randomart-ui), `45fecfd` (pixel-manipulator), `8f4d13d` (automa), `1c223b4` (glaze branding).

1. **`Object.keys(obj) as KeyType[]`** → helper `typedKeys` (déjà créé dans `packages/randomart-ui/src/utils/object.ts` et `apps/playground/src/utils/object.ts`) avec `// oxlint-disable-next-line typescript/no-unsafe-type-assertion` quand c'est un cas de branding accepté.
   Exemple (`02b4161`) :
   ```ts
   export function typedKeys<T extends object>(obj: T): (keyof T)[] {
       // Safe: utilisé uniquement sur des objets littéraux dont on maîtrise les clés.
       // oxlint-disable-next-line typescript/no-unsafe-type-assertion
       return Object.keys(obj) as (keyof T)[];
   }
   ```

2. **Indexation d'un enregistrement `map[key] as Type`** → remplace par une `Map` + une fonction getter qui lève si absent (pattern `getRule` / `getCreature`, commit `8f4d13d`), ou par un garde-fous `typeof`.

3. **`(x as number | undefined) ?? fallback`** → fonction de typage avec garde-fous `typeof` (`getNumberOption`, commit `45fecfd`) :
   ```ts
   function getNumberOption(options: Record<string, unknown>, key: string, fallback: number): number {
       const value = options[key];
       return typeof value === 'number' ? value : fallback;
   }
   ```

4. **`(event.currentTarget as HTMLElement | null)`** → `if (event.currentTarget instanceof HTMLElement)` (commit `02b4161`).

5. **Assertion inutile** (ex. `gl.getParameter(...) as ArrayLike<number>`) → supprimer l'assertion (commit `02b4161`).

6. **`{} as Palette` en valeur initiale de `reduce`** → accumulateur typé ou `Map` (commit `8f4d13d`).

## Classification des tâches
Chaque tâche est classée :
- `branding` : warning attendu, lié au branding / types nominaux (ex. `DurationSeconds`, `Palette`, unions littérales de noms de marques). À traiter à part, typiquement avec le pattern `typedKeys` + commentaire `oxlint-disable-next-line`. Ne pas refactoriser en profondeur maintenant.
- `cas-par-cas` : à corriger maintenant selon les patterns ci-dessus.

## Workflow de session
À l'ouverture d'une session, l'agent :
1. Lit `context.md` puis `progress.md`.
2. Prend la première tâche `pending` dans `tasks/task-XX.md`.
3. Lit le fichier tâche (emplacement, message, extrait de code, approche suggérée).
4. Corrige le code (sans toucher aux cas `branding` sauf accord).
5. Relance `vp check` (ou `vp -C <package> check`) pour vérifier la disparition du warning sans régression.
6. Met à jour `progress.md` (marque la tâche `done`, ajoute éventuellement des tâches pour la session suivante).

## Fichiers produits par cet agent
- `context.md` — ce fichier.
- `progress.md` — liste des tâches et leur état.
- `tasks/task-XX.md` — une tâche par fichier contenant les warnings.

