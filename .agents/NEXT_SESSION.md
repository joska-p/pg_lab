# Prochaine session — investiguer le dual exports source/dist

## Objectif
Comprendre en détail l'idée d'exporter à la fois les sources et le JS compilé
pour les packages workspace (`ui`, `glaze`, `glaze3d`, `worker-pool`) :
est-ce une pratique commune ? Que faut-il pour que ce soit sain (style de
publication, `files`, attw/publint, workflow dev) ? Quelles en sont les
implications concrètes pour ce repo ?

## État actuel
- Implémentation duale **en place mais non commitée** (`git status` : ~40 fichiers
  modifiés + ~15 nouveaux) : chaque export mappe `source` → `./src`,
  `types`/`import` → `./dist`, via une condition d'export custom `source`
  (`customConditions` dans `tsconfig.base.json`, `resolve.conditions`
  `['source', ...]` dans la racine et les 7 configs d'apps).
- Entries `vp pack` explicites partout ; `dist/` se construit (`105`/`80`/`20`/`2`
  fichiers). Validation verte : `vp check`, `vp test` (134), `vp run -r build` (20/20).
- Modèle documenté dans `AGENTS.md` (section Workspace Model).

## Points durs déjà identifiés (à creuser, pas à re-découvrir)
1. **TS 7 (tsgo 7.0.2) ignore `customConditions`** (vérifié via `tsc --showConfig`) :
   `tsc -b` résout donc les types `dist`, pas les sources. Impliqué : les libs
   doivent être packées avant le typecheck des apps (l'ordre `-r` le garantit).
   Question : limitation temporaire du port Go ou choix durable ? Alternatives ?
2. **oxfmt défait le fix de `unicorn/no-nested-ternary`** : le formateur retire les
   parenthèses que le linter exige. Contourné par restructuration (7 sites).
   L'utilisateur précise que cette combinaison de règles est volontaire, pour la
   lisibilité — en tenir compte dans les recommandations.
3. Builds parallèles tués (exit 137) sur cette machine → `ready` utilise
   `--concurrency-limit 1`.

## Prochaine action la plus utile
Lire ce fichier, puis `git status` / `git diff --stat` pour voir l'état réel,
et lancer l'investigation : pratique standard du dual publishing ? implications
dev (HMR sources vs dist), publication (`files`, versioning), outillage
(attw, publint), et ce que ça change au design actuel.
