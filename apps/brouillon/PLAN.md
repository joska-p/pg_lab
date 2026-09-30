# Brouillon — plan de travail

Test bench du design system `@repo/ui`. Contexte produit dans `PRODUCT.md`, système visuel dans `DESIGN.md`.

**Contrainte permanente :** pas de nouveau composant tant que ce n'est pas explicitement levé.

---

## Où on en est

Contexte capturé et vérifié. `PRODUCT.md`, `DESIGN.md` et `.impeccable/design.json` existent ; `impeccable doctor` ne signale aucune dérive.

**La couche de jetons est unifiée.** Il ne reste qu'un vocabulaire, et `neutral` vaut une seule chose — le gris chaud moyen `oklch(0.69)`, celui que `DESIGN.md` documente. Plus de deux couches à faire diverger, donc plus de sable sous `polish`.

| Couche                                             | Consommateurs                                    | État      |
| -------------------------------------------------- | ------------------------------------------------ | --------- |
| `tint` / `surface` / `interactions` / `typography` | tout le lab, chrome compris                      | canonique |
| `const`                                            | les 5 couches ci-dessus, plus la géométrie seule | canonique |

**Le kit local est un port partiel de `packages/ui` : 8 composants sur 27, sous-ensemble exact** (aucun composant local qui n'ait pas son équivalent amont). Les 19 absents : `Badge`, `ColorField`, `ControlField`, `ControlSection`, `ErrorBoundary`, `Led`, `MaterialScene`, `NumberField`, `RadioGroup`, `Readout`, `SectionHeading`, `Segmented`, `Select`, `Slider`, `Swatch`, `Text`, `TextArea`, `TextInput`, `Toggle`.

Cela explique la majorité des jetons « morts » : la couche a été déclarée pour le jeu de cible complet, pas pour les 8 composants présents. Voir §2.

---

## Séquence

### 1. Migration de la couche de jetons — fait

Suppression, pas création. La divergence du `neutral` est fermée en une passe.

- 4 imports repointés de `styles.stylex.ts` vers `typography.stylex.ts` (`heading`, `fieldText` — identiques à l'octet près, comme prévu).
- `gaps` et `justifyContent`rentrés dans `Stack.tsx`, seul consommateur, sur le modèle de `packages/ui/src/components/Stack.tsx` qui colocate déjà ses trois maps de variantes. `layout.stylex.ts` n'avait aucun importateur et un nom qui entrait en collision avec l'objet `layout` de `const.stylex.ts`.
- `ExperimentShell` : `staticStyles({tint:'tinted'})` devient `surfaceStyles({background: true})`. Le navigateur confirme la correspondance — stage slot `raised`, panel `flat`.
- `styles.stylex.ts` et `layout.stylex.ts` supprimés. `staticStyles`, `dynamicStyles`, `themed`, `backgroundColorVar`, `borderColorVar`, `shadowColorVar` n'avaient aucun consommateur et sont partis avec.

Vérifié : `vp check --fix` propre, build de l'app OK, DOM inspecté au navigateur. Deux changements visibles, tous deux dans le sens du `DESIGN.md` : le chrome passe du papier quasi blanc au gris chaud documenté (l. 144), et `interactionStyles()` branche l'état `active` que `dynamicStyles()` laissait mort alors que `DESIGN.md:252` le documente.

Effet obtenu : `-2 fichiers`, un seul vocabulaire de jetons.

### 2. `audit` — fait

Portée : `src/experiments/stylex/ui/` (5 fichiers `.stylex.ts` + 8 composants). Les démos et le shell applicatif sont hors audit ; ils ne sont cités que comme **preuve** quand un défaut du kit s'y manifeste.

**Score 12/20 — Acceptable.** Accessibilité 3 · Performance 2 · Theming 2 · Responsive 3 · Intégrité 2.

Les deux trous que la documentation ne pouvait pas affirmer sont maintenant mesurés :

- **Responsive : il fonctionne.** Vérifié à 375 / 1024 / 1440 px — la container query bascule sous 720 px, le panel devient un bottom sheet de 300 px, zéro débordement horizontal à toutes les largeurs.
- **Coût de rendu : la falaise est réelle mais non atteinte.** 384 variantes par calque, 147 456 nœuds à filtre complet. Non traité — voir §3.

#### P0 — un seul

**Les trois flags de canal n'éteignent rien.** `surfaceStyles()` (`surface.stylex.ts:87-108`) applique `borders.subtle` et `elevations[elevation]` **inconditionnellement** ; les flags `border`/`shadow` ne décident que d'_écrire_ la variable, jamais de _dessiner_. Or `tintVars.*` sont des custom properties **héritables** dont le défaut racine est `transparent` (`tint.stylex.ts:9-13`). Flag à `false` n'obtient donc pas « transparent » mais « la valeur de l'ancêtre le plus proche ».

Mesuré sur la matrice réelle (filtre `tintShadow: off` + `tintBorder: off`) :

| variant             | classe tint     | `--tint-shadow` résolu      | rendu                       |
| ------------------- | --------------- | --------------------------- | --------------------------- |
| `tintShadow: false` | aucune (hérite) | `oklch(0.693…)` ← _la Card_ | `oklab(0.693…) 0px 2px 8px` |
| `tintBorder: false` | aucune (hérite) | `oklch(0.69…)` ← _la Card_  | bordure `1px`               |

Un checkbox déclaré « pas de shadow de teinte » rend une ombre pleine dans la teinte de sa Card. Deux variants `tintShadow: true` / `false` ne se distinguent que par l'accident de leur ancêtre — l'inverse du principe directeur de `DESIGN.md`.

_Correctif_ : écrire un `transparent` explicite dans le canal coupé, **et** réinitialiser `tintVars.*` dans le `styles.base` de chaque composant pour qu'aucune surface n'hérite.

#### P1 — six

| #   | Défaut                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Emplacement                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 2   | **Le survol jette la densité de remplissage.** `interactions.hover` ne lit que `tintVars.background` et mélange à 92 %/88 % — une densité _solide_. Un bouton `bg:'soft'` repose à 18 % d'alpha et passe à 100 % opaque. Mesuré : `rgb(232,233,186)` → `rgb(127,172,110)`, **ΔRGB 143**. `DESIGN.md:252` prescrit « hover _darkens_ the fill » — un assombrissement, pas une inversion                                                                          | `interactions.stylex.ts:23-27`               |
| 3   | **Deux conteneurs de scroll empilés, gouttière stable sur le mauvais.** Mesuré avec contenu forcé à 3000 px : `stageSlot` `scrollHeight 864 = clientHeight 864`, `scrollTop` après 400 → `0` (ne défile jamais) ; `Stage` `scrollHeight 3405`, `scrollTop` → `400` (seul vrai scroller). `scrollbarGutter:'stable'` est sur `stageSlot`, donc `Stage` perd 15 px de largeur **à l'instant où il commence à défiler** → la matrice se ré-emboîte horizontalement | `ExperimentShell.tsx:25-34` + `Stage.tsx:13` |
| 4   | **Aucun `prefers-reduced-motion`** dans tout `src/`. `300ms` sur `transform` + `box-shadow` + 3 couleurs, avec `scale(0.98)` au `:active`, sur chaque contrôle du kit                                                                                                                                                                                                                                                                                           | `interactions.stylex.ts:15-21`               |
| 5   | **Contrôles UA : 21 px / 13 px.** `<select>` 21 px de haut, `<input type=checkbox>` 13×13, « Reset » 24 px. Échouent WCAG 2.2 SC 2.5.8 (cible min 24×24). Couche hors périmètre, mais le correctif appartient au kit — `DESIGN.md:411` le classe « Not yet built »                                                                                                                                                                                              | démo                                         |
| 6   | **Le slug de variante rend en `Times New Roman` 24px/700.** `typography.stylex.ts` n'a aucun style de slug ; `DemoCanvas` émet un `<h2>` nu. C'est la valeur littérale la plus importante du banc, en serif par défaut, contre la Measured-Value Rule                                                                                                                                                                                                           | `typography.stylex.ts`                       |
| 7   | **`interactions.borderHover` est identique octet pour octet à `interactions.hover`.** Même valeur, même pseudo-classe. Le nom promet un survol de _bordure_. Et le commentaire de l'en-tête (l. 10-11) affirme que `active` et `borderHover` « restent définis mais non branchés » — **les deux sont branchés**, l. 56-57                                                                                                                                       | `interactions.stylex.ts:23-37`               |

#### P2 —Structural

- `ShellWrapper` garde `radius.md` à 375 px alors que `DESIGN.md` impose le square-corner sous 1024 px (« a rounded card floating at the very edge of a phone screen has nothing to round against »). Mesuré `radius: 6px` à 375 px.
- `stageSlot` 6 px / `Stage` 0 px à 375 px → double angle emboîté.
- **Hiérarchie de titres incohérente** : `h2` (slugs, dans le stage) puis `h4` (sections du panel), aucun `h1`.
- `ControlPanel` pose `aria-label` **par-dessus** son `<h2>` visible → WCAG 2.5.3.
- `Checkbox` prend `label?: string` alors que `Button`/`Card`/`Stack` prennent `children`. En mode Checkbox le slug est **silencieusement perdu** (mesuré : 8 boutons à `textContent: ""`).
- La branche floating de `ExperimentShell` + `toggleClearOfFloatingPanel` sont **inatteignables** (`laboratory.tsx:42` force `docked`). Le calcul ne tient pas non plus : `right: calc(12px + calc(12px))` déplace le toggle de 12 px alors que le panel fait 320 px de large → il se superposerait, ne le dégage pas.
- `Card` accepte `bg` mais l'ignore tant que `tintBackground` n'est pas mis — piège d'API.
- `colors.error` et `borders.strong` jamais utilisés : une voix « error » et une bordure « strong » à 20 % sont documentées mais inexistantes au rendu.
- `coumpoundStyle` — faute de frappe, `Stack.tsx:72`.

#### Les jetons « morts » — le décompte était exagéré

110 jetons définis, 56 sans consommateur. **La lecture « dérive » est fausse** : 54 d'entre eux sont de la pré-déclaration ou de la complétude d'échelle.

| Catégorie                                                                                                                                                                | Nb    | Statut                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | ------------------------------------------------------------------------- |
| `layout.*` pour un composant amont non porté (Toggle ×4, RadioGroup ×3, Slider ×2, Swatch ×2, ColorField ×3, Led, Segmented, Select, ControlField, +4 sans propriétaire) | 22    | pré-déclaration — correspond 1:1 aux 19 composants manquants              |
| Rampes `palette` (`light1-3`, `dark0Hard/Soft`, `dark1-3`, 6 accents `neutral*`)                                                                                         | 17    | complétude de rampe ; `gray245` est en plus un doublon exact de `gray244` |
| Échelle typo (`fontSizeMd/Xl/2xl/3xl`, `fontWeightRegular/Bold`, `lineHeightNormal/Relaxed`, `letterSpacingNormal`)                                                      | 9     | complétude d'échelle                                                      |
| `radius.lg/xl/full`, `zIndex.base/canvas/modal`                                                                                                                          | 6     | complétude d'échelle                                                      |
| **`breakpoints.narrowMax` / `wideMin`**                                                                                                                                  | **2** | **défaut réel**                                                           |

Les deux seuls vrais défauts : `breakpoints` est inutilisé pendant que `720` et `1024` sont **en dur dans 6 endroits** (`ExperimentShell` ×4, `Stage`, `ShellWrapper`) — violation de la 4px Rule. Et `gray245`, doublon exact de `gray244`.

**Le correctif existe déjà en amont et n'a jamais été porté.** Trois groupes de `packages/ui/src/tokens/` manquent au kit local, et ce sont exactement les trois nombres qui apparaissent en littéral :

| Groupe amont  | Contenu                                     | Symptôme local                                   |
| ------------- | ------------------------------------------- | ------------------------------------------------ |
| `media`       | `narrow` / `wide` / `portrait`              | `720` et `1024` en dur ×6                        |
| `interaction` | `disabledOpacity: 0.45`, `pressScale: 0.98` | en dur dans `interactions.stylex.ts`             |
| `motion`      | 3 durées + 3 easings                        | `300ms` + `cubic-bezier(0.16, 1, 0.3, 1)` en dur |

À noter : `layout.controlFieldMinHeight: 44px` est cité par `DESIGN.md` **et** `PRODUCT.md` comme une contrainte délibérée, mais aucun composant local ne l'applique — `ControlField` n'est pas encore porté.

#### Questions ouvertes tranchées par l'audit

- **Débordement des slugs** (la question ouverte de la version précédente de ce plan) : **n'existe pas**. À 1440 px comme à 375 px, `scrollWidth === clientWidth`, rien n'échappe à la Card, aucun débordement de document. Le slug passe à la ligne sur 2 lignes à 24 px dans une Card de 324 px — un problème de masse, pas de débordement.
- **Gap `DESIGN.md` n°2** (`html { color-scheme: dark }`) : **périmé tel qu'écrit**. La règle existe dans `packages/ui/src/styles.css` mais l'app ne la charge jamais — mesuré `htmlColorScheme: "normal"`, `color-scheme` hérité correctement par le `<select>`. Le gap n°1 (contrôles UA) reste le vrai.
- **Zones de hit 44 px qui se recouvrent** : hypothèse testée et **infirmée**. Hit areas à 380 px d'écart, chevauchement `0`.
- **Anneau de focus invisible quand `tintBorder: false`** : non reproduit — l'anneau hérite la teinte de l'ancêtre et reste visible. C'est le même mécanisme de fuite que le P0.
- **Contraste du libellé au survol** : mesuré sur la couleur réelle (`oklch(0.277 0 0)`) → **5.64:1**, passe AA.

#### Méthode et outillage

- Le tool `browser.*` était **déconnecté** cette séance. Mesures prises via `agent-browser` (CLI du dépôt) contre `vp dev`.
- `impeccable detect --json` a rendu **`[]`** — zéro finding malgré 56 jetons sans consommateur et un style dupliqué à l'octet. **Ce n'est pas une validation** : trou de couverture du detector sur les `.stylex.ts`.
- `vp check` propre : 397 fichiers formatés, 0 erreur de lint ou de type sur 330 fichiers.
- Contraste sain partout où le kit écrit : 11.79:1 au repos, 5.64:1 au survol, 10.8:1 panel, 9.17:1 slug, dans les deux thèmes. Seule faiblesse : la hairline de Card à 10 % de teinte, **2.1:1** sur fond sombre.

### 3. `harden` — le P0 d'abord

**Réordonner : le P0 passe devant `optimize`.** On ne virtualise pas une matrice dont les axes mentent. Tant que `tintBorder: false` rend une bordure, corriger la falaise de nœuds revient à optimiser un rendu faux.

- Fermer le P0 : canal coupé ⇒ `transparent` explicite + réinitialisation locale de `tintVars.*` dans chaque `styles.base`.
- Porter les 3 groupes de jetons amont (`media`, `interaction`, `motion`) — supprime 3 nombres en dur, pas de composant créé.
- `ErrorBoundary` existe dans `packages/ui`, non utilisé ici. Le brancher ne crée aucun composant.
- `prefers-reduced-motion`.
- Perte d'état au reload (non décidé dans `PRODUCT.md`).

### 4. `optimize` — conditionnel

**Le chiffre :** filtre complet = 8 couleurs × 3 élévations × 2 fonds × 2³ flags de teinte = **384 variantes par calque**. Les deux calques complets = **147 456 nœuds DOM**. Les défauts n'en donnent que 4, mais cocher toutes les cases est à un clic.

Non mesuré en runtime cette séance — l'audit a confirmé le plafond arithmétique, pas le coût réel. Virtualiser, plafonner ou paginer, **après** le P0.

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
- **Le tool `browser.*` peut être déconnecté** selon la séance. `agent-browser` (CLI du dépôt) est le repli et pilote les media queries CSS, donc **il vérifie vraiment le responsive** — contrairement à ce que supposait la note d'audit précédente.
- **`impeccable detect` ne couvre pas les `.stylex.ts`.** Zéro finding sur ce kit malgré des dizaines de jetons orphelins et un style dupliqué à l'octet. Ne pas le lire comme une validation ; il faut compter les consommateurs à la main (`rg -c "layout\.$token\b"`).
- **La fuite de `tintVars.*` est structurelle, pas un forgot.** Tant qu'aucun composant ne réinitialise les trois variables localement, tout canal « off » lit l'ancêtre. C'est la première chose à vérifier après toute retouche de `surface.stylex.ts`.
- **Rien n'a été modifié dans le code.** Cette séance est mesure et documentation uniquement.

---

## Adapter

Le plan indique une intention, pas un contrat. Une séance peut réordonner, fusionner, scinder ou abandonner ce qui est prévu — l'audit peut révéler que `optimize` est inutile, ou que la migration est plus large que mesuré ici.
