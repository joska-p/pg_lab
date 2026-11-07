# task-60 — `WorkerPool` : typer la réponse de `deserialize`

- Fichiers : `packages/worker-pool/src/types.ts`, `packages/worker-pool/src/worker-pool.ts`
- Statut : `pending`
- Catégorie : `refactor`
- Origine : `task-45`

## Problème

`WorkerPoolConfig.deserialize` reçoit `MessageEvent` sans type de données :

```ts
deserialize: (event: MessageEvent) => WorkerResult<TResult>;
```

Les consommateurs doivent donc caster `event.data` (`colorSpaceCanvasPool.ts`) ou le valider
manuellement. Le cast est évitable si le pool connaît le type du message de réponse.

## Correction attendue

Ajouter un paramètre générique optionnel :

```ts
export interface WorkerPoolConfig<TTask, TResult, TResponse = unknown> {
    workerFactory: () => Worker;
    maxPoolSize?: number;
    serialize: (task: TTask) => { message: unknown; transfer?: Transferable[] };
    deserialize: (event: MessageEvent<TResponse>) => WorkerResult<TResult>;
}
```

Adapter `WorkerPool` et les deux consommateurs :

- `colorSpaceCanvasPool.ts` : `WorkerPool<RenderColorSpaceTask, ImageBitmap, ColorSpaceCanvasResponse>`
  et valider le message (`isColorSpaceCanvasResponse`) avant de l’utiliser.
- `process-image-in-worker.ts` : conserver la validation existante.

Le typage générique ne remplace pas la validation runtime pour un message `postMessage` ; il
supprime seulement le cast.

## Définition de fait

- Plus de `event.data as ...` dans les consommateurs.
- Validation runtime conservée pour les workers.
- Tests des packages concernés verts.
