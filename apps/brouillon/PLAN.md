# Brouillon — plan de travail

Test bench du design system `@repo/ui`. Contexte produit dans `PRODUCT.md`, système visuel dans `DESIGN.md`.

**Contrainte permanente :** pas de nouveau composant tant que ce n'est pas explicitement levé.

---

## Où on en est

Contexte capturé et vérifié. `PRODUCT.md`, `DESIGN.md` et `.impeccable/design.json` existent ; `impeccable doctor` ne signale aucune dérive.

Un seul fait structure le reste : **le lab est à moitié migré.** Deux couches de jetons coexistent et ne sont pas d'accord sur la valeur de `neutral` (gris chaud moyen `oklch(0.69)` contre papier quasi blanc `oklch(0.965)`).

| Couche                                             | Consommateurs                                                        | État      |
| -------------------------------------------------- | -------------------------------------------------------------------- | --------- |
| `tint` / `surface` / `interactions` / `typography` | `Card`, `Button`, `Checkbox`, `ShellWrapper`                         | canonique |
| `styles.stylex.ts`                                 | `ExperimentShell`, `ControlPanel`, `Stack`, et tout le chrome du lab | obsolète  |
| `layout.stylex.ts`                                 | personne                                                             | mort      |

Tant que cette coexistence dure, toute séance de `polish` travaille sur du sable.

---

## Séquence

### 1. Migration de la couche de jetons

Suppression, pas création. Elimine la divergence du `neutral` en une passe.

Le travail réel est plus étroit qu'un refactor complet : sur les 6 fichiers qui importent `styles.stylex.ts`, seuls **4 symboles** sont utilisés — `fieldText`, `heading`, `staticStyles`, `gaps`+`justifyContent`.

- `heading` et `fieldText` sont **confirmés identiques à l'octet près** entre `styles.stylex.ts` et `typography.stylex.ts` (vérifié par diff). Repointer 4 imports est donc sûr.
- `gaps` et `justifyContent` sont des copies d'`layout.stylex.ts`, lui-même sans importateur. À trancher en séance, mais ce sont de la mise en page pure, sans dépendance de teinte — ils peuvent être replacés dans un module de layout dédié ou importés depuis `const.stylex.ts`.
- Le seul vrai réécriture est `ExperimentShell` : `staticStyles({tint:'tinted', bg:'soft', elevation:'raised'})` doit devenir un appel `surfaceStyles()`. Le navigateur confirme la correspondance (stage slot `raised`, panel `flat`).
- `staticStyles`, `dynamicStyles`, `themed`, `interactions`, `backgroundColorVar`, `borderColorVar`, `shadowColorVar` dans `styles.stylex.ts` n'ont **aucun** consommateur et disparaissent avec le fichier.

Effet attendu : `-2 fichiers`, suppression de la divergence, un seul vocabulaire de jetons.

### 2. `audit`

Première mesure réelle. Règle deux trous que la documentation ne peut pas affirmer :

- **le responsive** — documenté d'après le code, jamais vérifié (l'émulation de viewport de l'outil ne pilote pas les media queries CSS) ;
- **le coût de rendu réel** de la matrice.

Deux défauts déjà confirmés au browser, à confirmer et à cadrer :

- Le `<select>` de thème, les checkboxes de filtre et les boutons « Reset » sont des éléments UA bruts (Times New Roman 16px, bordures `2px outset`, cases 13px).

### 3. `optimize` — conditionnel

**Le chiffre :** filtre complet = 8 couleurs × 3 élévations × 2 fonds × 2³ flags de teinte = **384 variantes par calque**. Les deux calques complets = **147 456 nœuds DOM**. Les défauts n'en donnent que 4, mais cocher toutes les cases est à un clic.

Si `audit` confirme la falaise : virtualiser, plafonner, ou paginer. **Préalable à `harden`** — un onglet qui ne répond plus ne se durcit pas.

### 4. `harden`

Ce qui casse, et ce qu'on lit quand ça casse.

- `ErrorBoundary` **existe déjà** dans `packages/ui` et n'est pas utilisé ici. Le brancher ne crée aucun composant.
- Perte d'état au reload (actuellement non décidé dans `PRODUCT.md`).
- Slugs de variante de 49 caractères en `h2` — débordement en largeur à vérifier.

### 5. `clarify`

Une fois les modes d'échec définis, pas avant. Écrire le message d'un état qu'on n'a pas encore décidé est du travail jeté.

### 6. `polish`

Dernier. Cohérence finale de la surface.

---

## À savoir

- **Commandes** : `vp check --fix` formate, lint et type-check. `vp run -r test` et `vp run -r build` sont le `ready` racine.
- **Le gap des contrôles natifs reste ouvert** tant que la contrainte tient. Ce n'est pas un oubli : `DESIGN.md` le consigne comme Don't. `packages/ui` possède déjà `Select.tsx`, `Checkbox.tsx`, `Toggle.tsx`, `Segmented.tsx` — le chemin existe sans rien écrire, mais c'est un choix d'architecture (les jetons StyleX ne traversent pas la frontière de package) et non un gain de design.
- **Le fond `chaos`** (huit radiales) est voulu et documenté comme permanent. Ce n'est pas un restyle à faire.
- **`live` n'est pas configuré.** Sa première installation injecte un script dans le dev server. À invoquer explicitement.

---

## Adapter

Le plan indique une intention, pas un contrat. Une séance peut réordonner, fusionner, scinder ou abandonner ce qui est prévu — l'audit peut révéler que `optimize` est inutile, ou que la migration est plus large que mesuré ici.
