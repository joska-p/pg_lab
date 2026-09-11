---
title: State
description: Data fetching, state initialization, and Zustand store conventions.
---

# State

## Data fetching

TanStack Query owns all server and async data. Zustand stores hold client-only state. Each concern lives in its own layer: a store holds values between renders, a query cache serves the server's truth.

## State initialization

State starts on a usable default. Components render coherently from the first frame, before async data arrives.

## Zustand stores

Store files live in `stores/[domain]/`. `useState` carries single-component UI state; a value consumed by multiple unrelated components moves into a store.

The raw store keeps an internal name (`camelCase[Domain]Store`) and stays inside its domain directory. Components reach state through getter hooks and change it through plain setter functions.

### Async orchestration

Async logic lives in `actions.ts` as plain async functions reading and writing through `getState()` / `setState()`:

```ts
// actions.ts
export async function fetchAndSetNodes() {
  const { filters } = nodesStore.getState();
  const data = await fetchNodes(filters);
  nodesStore.setState({ nodes: data });
}
```

The store itself stays synchronous: it holds values, actions move them. An action reads and writes only its own domain; two domains that need each other's data merge into one domain. Truly independent concerns split into separate stores.

### Splitting a growing store

A single-file store serves until it becomes hard to scan. The split then proceeds one step at a time:

1. `store.ts` holds the `create()` call and the raw export. `actions.ts` holds mutators and async orchestration. `selectors.ts` holds getter hooks. Three flat files, no subdirectories.
2. A complicated `actions.ts` or `selectors.ts` grows into its own directory (`actions/`, `selectors/`), one file per function or grouped by related concern.
3. Store-specific types move to `types.ts` once they pass a couple of lines.

Directories appear when the code demands them, and the trigger is scannability rather than line count.
