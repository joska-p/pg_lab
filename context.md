# Contexte — assainissement des assertions de type

## But

Éliminer les avertissements `typescript/no-unsafe-type-assertion` dans le code de production,
sans introduire de régression. La règle est à `'warn'` dans `vite.config.ts:220`.

Le protocole précédent traitait les warnings comme une simple liste à faire disparaître, avec un
fallback “commentaire de désactivation” qui rendait la suppression équivalente à une correction.
Cette version distingue les cas réellement sûrs (branding, frontière DOM, CSS custom) des
assertions qui cachent un trou de typage (unions UI, données externes, signatures fausses).

## Périmètre et décisions

- **Production uniquement.** Les fichiers `*.test.*` / `*.spec.*` sont hors scope : l’override
  `files: ['**/*.{test,spec}.{ts,tsx}']` de `vite.config.ts` (commit `29f6c6a`) désactive la
  règle dans les tests. Cet override est **intentionnel** et doit rester.
- La règle reste à `'warn'`. Elle pourra passer à `'error'` quand le compteur sera à zéro, mais
  ce n’est pas dans le périmètre de cette session.
- Les lignes/colonnes des fichiers `tasks/` sont **indicatives** : elles datent de la génération.
  Toujours relancer le check pour localiser le warning courant.

## État actuel (7 novembre 2026)

| Indicateur            | Valeur                      |
| --------------------- | --------------------------- |
| Baseline (production) | 88 warnings / 46 fichiers   |
| Corrigés              | 88 warnings / 46 fichiers   |
| Restants              | **0 warnings / 0 fichiers** |
| Tests (hors scope)    | 33 warnings / 7 fichiers    |

Vérification :

```bash
vp check --no-fmt --deny-warnings
# attendu aujourd'hui : exit 0, aucun warning de cette règle
```

`vp check` complet peut d’abord échouer sur le formatage de `prompt.md`, `context.md`,
`progress.md` et `tasks/*.md`. C’est un problème de docs, pas de code : `vp fmt` sur ces fichiers.

## Commandes

- Boucle : `vp check --no-fmt --deny-warnings`
- Package : `vp -C packages/<nom> check --no-fmt --deny-warnings`
- Tests : `vp -C packages/<nom> test` ou `vp test <filtre>`
- Formatage : `vp fmt prompt.md context.md progress.md tasks`
- Final : `vp check --deny-warnings`

## Grille de décision

| Origine de la valeur                                | Traitement attendu                                | Suppression ?                 |
| --------------------------------------------------- | ------------------------------------------------- | ----------------------------- |
| Clés d’un objet littéral interne                    | `typedKeys` partagé                               | Une seule, dans le helper     |
| Type nominal / marque                               | constructeur/factory dédié                        | Une par factory, commentée    |
| Donnée externe (`JSON.parse`, storage, worker, API) | validation runtime                                | Interdite sans validation     |
| `any` DOM/WebGL                                     | garde `typeof` ou wrapper typé                    | En dernier recours, localisée |
| Callback d’un composant générique                   | corriger l’inférence (`as const`, options typées) | Au pire une dans le composant |
| Propriété CSS custom                                | cast localisé                                     | Oui, commentée                |
| Union discriminée incomplète                        | corriger le type de la donnée                     | Non                           |
| Signature de fonction fausse                        | corriger la signature                             | Non                           |
| Null-object (`Clock`)                               | `T \| null` ou vraie implémentation no-op         | Non                           |

## Patterns de correction

### 1. Clés d’un objet littéral : `typedKeys`

Helper existant dans `packages/randomart-ui/src/utils/object.ts` et
`apps/playground/src/utils/object.ts`. Il peut est dupliqué.

```ts
export function typedKeys<T extends object>(obj: T): (keyof T & string)[] {
    // Safe : utilisé uniquement sur des objets littéraux dont on maîtrise les clés.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return Object.keys(obj) as (keyof T & string)[];
}
```

Usages typiques : `experimentKeys`, `COLOR_SPACE_IDS`, `OP_NAMES`, `presetOf`.
Ne pas classer ces cas en “branding”.

### 2. Composants génériques : corriger l’inférence

`Select` et `Segmented` sont déjà génériques (`<T extends string>`). Un cast dans le call site
signale presque toujours des options élargies en `string` :

```tsx
// Mauvais : `options` est élargi en string, donc T = string, d’où `val as NoteSlug`.
<Segmented
    value={selectedNoteSlug}
    onValueChange={(val) => setSelectedNoteSlug(val as NoteSlug)}
    options={[{ value: 'genese', label: 'généalogie' }]}
/>;

// Bon : les options portent l’union, T = NoteSlug, plus de cast.
const NOTE_OPTIONS = [
    { value: 'genese', label: 'généalogie' },
    { value: 'captains-logs', label: 'captains logs' },
] as const satisfies readonly { value: NoteSlug; label: string }[];

<Segmented value={selectedNoteSlug} onValueChange={setSelectedNoteSlug} options={NOTE_OPTIONS} />;
```

Le seul cast légitime est **dans** le composant générique, au point où le DOM renvoie une
`string` : `Select.tsx` (un `findSelected` est en cours d’ajout), `Segmented.tsx` si nécessaire.
Il ne doit pas être recopié dans chaque consommateur.

### 3. Frontières externes : valider, ne pas caster

- `fetchPalettes.ts` : le cache `localStorage` doit être validé (`isCachedPalettes` ou schéma)
  avant d’être retourné. Le fichier a déjà `paletteSchema` pour le réseau.
- `colorSpaceCanvasPool.ts` : valider `event.data` (`isColorSpaceCanvasResponse`) ou typer
  `WorkerPoolConfig.deserialize` en `MessageEvent<TResponse>`. Le worker pixel montre le bon
  pattern (`isSerializedImageDataArray`).
- `process-image-in-worker.ts` : `typeof event.data.error === 'string'` avant `new Error(...)`.
- `serialization.ts` : après `typeof item === 'object' && item !== null`, utiliser `'data' in item`
  plutôt qu’un cast en `Record<string, unknown>`.

Une suppression sur `Unsafe assertion from any` sans validation est un échec de revue.

### 4. `any` DOM/WebGL : garde `typeof`

Exemple `compileProgram.ts` :

```ts
const raw = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
const numUniforms = typeof raw === 'number' ? raw : 0;
```

De même pour les retours de `getParameter`, `getShaderParameter`, etc. Une suppression
`oxlint-disable` est un dernier recours, pas la solution par défaut.

### 5. Branding : factories et suppressions uniques

Les marques (`Seed`, `Seconds`, `DurationSeconds`, `FrameToken`, `StateData`,
`AttachedHandle`) se construisent dans une factory. Le cast y est légitime et doit être unique :

```ts
function brandSeed(trimmed: string): Seed {
    // Seed est une marque nominale sur string ; la validation a eu lieu avant.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return trimmed as Seed;
}
```

Ne pas disperser les casts de marque dans les consommateurs. Pour `seed.ts`, les deux casts
actuels doivent passer par un seul helper privé.

### 6. Propriétés CSS custom : intersection + `satisfies`

`--tile-size`, `--panel-height`, etc. ne font pas partie de `React.CSSProperties`. La correction
propre est une intersection de types, pas un cast :

```ts
type CssVars = React.CSSProperties & {
    readonly [key: `--${string}`]: string | number | undefined;
};

const style = {
    '--panel-height': panelHeight != null ? `${panelHeight}px` : undefined,
} satisfies CssVars;
```

Si l’objet spread une structure avec des clés non-CSS (`id` de `Palette`, index signature
`[key: string]: string`), extraire d’abord les vars. En dernier recours seulement, garder un cast
localisé commenté (`--tile-size` est une custom property), sans le propager.

### 7. Signatures et types à corriger

- `shuffleObject` : mélanger les valeurs entre les clés ne préserve pas `T`. Changer la signature
  (`T extends Record<string, V>` → `Record<keyof T, V>`) ou retourner
  `Record<keyof T, T[keyof T]>`.
- `neighborhood-tiling.ts` : ajouter `radius?: number` au type de définition plutôt que caster.
- `pixel/docs/Controls.tsx` : rendre `EndpointItem` discriminé sur `type`, pour que
  `item.type === 'pipeline'` narrow `item.id` en `'resize' | 'chaining'`.
- `three-stage/Root.tsx` : typer `preset` dans `useLevaControls` (garde `isPresetName`) et
  supprimer les deux casts du call site.
- `clockStore.ts` : `clock: null as unknown as Clock` est un null-object qui viole le contrat.
  Suivi `task-56` : `Clock | null` ou vraie implémentation no-op.

## Pièges connus (session précédente)

1. **`orbit.ts`** : le correctif de lint a changé le comportement (listeners sur `domElement` au
   lieu de `window`, suppression du `try/catch` autour de `setPointerCapture`, tests adaptés).
   À revoir dans `task-54` ; ne pas considérer ce fichier comme définitivement corrigé.
2. **`InputStore.ts`** : 9 suppressions pour la même cause. Un helper générique
   `bind(target, type, handler)` doit ramener cela à un seul cast (`task-55`).
3. **Sequencer** : les guards `typeof` dupliquent les defaults des descripteurs. Une seule source
   de vérité est préférable (`task-59`).
4. **`typedKeys`** dupliqué dans deux packages ; ne pas en ajouter une troisième copie
   (`task-58`).
5. **`clockStore`** : la suppression cache un contrat faux (`task-56`).
6. **`compileProgram`** : le garde `typeof` est appliqué ; `task-57` est close.

## Classification des tâches

- `keys` : `Object.keys/entries` + cast → `typedKeys`.
- `inference` : composant générique / options élargies → corriger l’inférence.
- `guard` : `typeof` / narrowing → supprimer le cast.
- `boundary` : donnée externe, DOM/WebGL, worker → validation ou suppression locale unique.
- `brand` : type nominal → factory, suppression unique.
- `signature` : type/signature à corriger (`shuffleObject`, `EndpointItem`, `radius`, `CssVars`,
  `ClockStore.clock`).
- `review` / `refactor` : suivi non bloquant.

## Workflow de session

1. Lire `prompt.md`, puis `progress.md`.
2. Prendre la première tâche `pending` de la section “Tâches warnings”.
3. Lire `tasks/task-XX.md`, relancer le check pour localiser le warning courant.
4. Corriger selon la grille ; ne pas toucher aux tests ni à la config.
5. Vérifier `vp check --no-fmt --deny-warnings` + tests du package + `git diff`.
6. Mettre à jour `progress.md` (`done`, pattern, suppression éventuelle).
7. Committer par fichier/package cohérent.

## Références

- Commit `9627b5f` : activation de la règle en `warn`.
- Commit `29f6c6a` : suppressions ciblées dans `glaze` + override tests.
- Commit `02b4161` : `typedKeys`, `instanceof HTMLElement` (randomart-ui).
- Commit `45fecfd` : garde-fous `typeof` (pixel-manipulator).
- Commit `8f4d13d` : `Map` + getter (automa).
- Commit `1c223b4` : suppression du branding inutile (glaze).
- `vite.config.ts:220` et `vite.config.ts:383` : règle + override tests.
