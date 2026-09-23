# Prochaine session — créer `packages/internal-config`

## Objectif

Factoriser le wiring Vite restant, encore dupliqué à l'identique dans 7 configs
d'apps (plugins StyleX + babel + react, `resolve`, `optimizeDeps`, `server`),
dans un package workspace partagé `@repo/internal-config`.

## Pourquoi un package (rappel, à ne pas re-découvrir)

- La règle `import/no-relative-parent-imports: error` (root `vite.config.ts`)
  interdit les imports `../../tools/…` depuis les `vite.config.ts` : le partage
  doit passer par un package workspace.
- Piste `imports` `#…` (subpath imports) écartée sans preuve : résolution
  incertaine dans les 3 consommateurs (jiti au chargement config, tsgolint au
  typecheck, plugin `import` d'oxlint). Le package workspace est le mécanisme
  standard du repo.

## État actuel (session précédente, committé ou à committer)

- `tsconfig.{app,node,lib}-base.json` en place ; `customConditions` dans
  `compilerOptions` (preuve : check vert sans `packages/ui/dist`).
- Lint react centralisé en un `lint.overrides` racine (9 packages) ; les configs
  par package ne gardent que leur wiring runtime.
- Template `new-mini-app` aligné (slim + `resolve.conditions` + tsconfigs sur bases).

## Questions de design à trancher

1. **Contenu exact** : preset apps StyleX (7× identique) + preset libs
   babel+react (`glaze`/`glaze3d`) ? `ui`/`worker-pool` (pas de plugins Vite)
   restent hors scope. Forme d'API : fabriques
   (`defineStylexApp({ base?, test? })`) spreadées dans `defineConfig`,
   en préservant la sémantique `lazyPlugins`.
2. **Exports du package** : entrées `.ts` directes (`"./vite-app": "./src/…ts"`)
   sans dual source/dist (config consommée au load, jamais publiée) — à valider
   contre les 3 consommateurs : jiti (load `vite.config.ts`), tsgolint
   (`tsconfig.node.json`, nodenext), oxlint (`import/*`).
3. **Dépendances** : `@rolldown/plugin-babel`, `@vitejs/plugin-react`,
   `unplugin-stylex`, `vite-plus` (+ `@repo/ui` pour le preset StyleX) en
   `dependencies` (catalog) du package, résolues depuis son propre dossier.
   Propre tsconfig du package (quelle base ? pas de JSX).
4. **Template** : `new-mini-app` doit dépendre du package et générer le shape
   slim consommateur.

## Plan suggéré

1. Lire ce fichier, `git status` / `git diff --stat`.
2. Créer `packages/internal-config` (package.json + preset apps + tsconfig +
   vite.config minimale) ; brancher **un seul** app (`brouillon`) dessus.
3. Valider : `vp check`, `vp test`, `vp -C apps/brouillon build`, smoke `vp dev`.
   En cas d'échec de résolution, repli : garder le wiring dupliqué (état actuel
   sain, juste verbeux).
4. Généraliser aux 6 autres apps (+ `glaze`/`glaze3d` si preset libs tranché oui),
   mettre à jour le template, `AGENTS.md`, puis committer.

## Contraintes rappelées

- Pas de publication : `files` / `publishConfig` / `publint` / `attw` en attente.
- `package.json` racine : ne pas toucher (dérive `workspaces`/`catalog` en attente
  d'élucidation `vp install`).
- Builds : `--concurrency-limit 1` (exit 137 en parallèle sur cette machine).
