# new-mini-app

Generator Vite+ pour scaffolder une nouvelle mini-app depuis le template `specimen`.

## Usage

Depuis la **racine du monorepo** :

```bash
# Interactif
vp create new-mini-app

# Non-interactif (à lancer depuis la racine du monorepo)
vp create new-mini-app -- --name <kebab-name> --directory packages/<kebab-name>
```

**Exemple :**

```bash
vp create new-mini-app -- --name random-art --directory packages/random-art
```

Cela génère dans `packages/random-art/` :

```
packages/random-art/
├── index.html
├── package.json          ← @repo/random-art, dépend de @repo/ui
├── tsconfig.json
├── vite.config.ts        ← stylexPlugin + reactCompiler + specimen config
├── .gitignore
└── src/
    ├── main.tsx
    ├── App.tsx            ← ExperimentShell + ControlPanel + Stage
    ├── style.css
    └── stores/
        └── appStore.tsx   ← zustand (theme light/dark/system)
```

Après génération :

```bash
cd packages/<name>
vp dev
```

## Structure générée

La mini-app générée est identique à `packages/specimen` :

- React 19 + React Compiler
- StyleX (via `@repo/ui/stylex-preset`)
- Zustand pour le state UI
- `ExperimentShell` / `Stage` / `ControlPanel` de `@repo/ui`
