# Polish Roadmap — `@repo/ui`

Document de cadrage pour les futures sessions de polish avec l'agent.
Objectif : reconsidérer les choix stratégiques, structurels et design,
revoir composition + tokens (dont le smell des shadows), puis élever le visuel.
Ne rien implémenter à partir de ce document sans valider la phase en cours.

État de référence : 22 composants exportés, démo `apps/dev` 100 % composants
(`Page` → hero / fake-synth / controls / foundations), `vp check` vert.

---

## 1. Smells connus (vérifiés, à traiter en premier)

| #   | Smell                                                                                                                                                                               | Référence                                      | Piste                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| S1  | Token `shadow` mort : défini dans `tokens.stylex.ts:137`, jamais utilisé nulle part                                                                                                 | `packages/ui/src/theme/tokens.stylex.ts:137`   | Supprimer, ou en faire la source unique (voir S2)                                          |
| S2  | Deux sources de vérité pour la couleur d'ombre : `colors.shadow` (mort) vs `shadowColor` (`shadows.stylex.ts:1-5`)                                                                  | `packages/ui/src/theme/shadows.stylex.ts`      | Une seule source ; documenter laquelle dans `component-authoring.md` §3                    |
| S3  | Pattern `shadowColor` appliqué uniquement par `Button` (`[shadowColor.color]` × 6) ; Toggle / Segmented / Checkbox / autres : ombres neutres                                        | `packages/ui/src/components/Button.tsx:56-116` | Décider : teinte partout, nulle part, ou seulement interactifs pressables                  |
| S4  | Famille `success` incomplète : token + `Swatch` OK, mais pas de `successHover`, et aucun widget ne propose le variant `success` (les 6 intents l'excluent)                          | `tokens.stylex.ts:100-108`, `Swatch.tsx`       | **Décision actée : retrait** — supprimer le token, la `Swatch` et les références (phase C) |
| S5  | `ring` duplique les valeurs de `primary` (`brightBlue`/`fadedBlue`) au lieu de les référencer — dérive silencieuse si `primary` change                                              | `tokens.stylex.ts:132-135`                     | Référencer ou justifier la divergence par commentaire                                      |
| S6  | Incohérence de nommage des props de variante : `variant` (Button, Toggle, …) vs `tone` (`Badge`) vs `swatch` (`Swatch`)                                                             | `Badge.tsx`, `Swatch.tsx`                      | Unifier (`variant` partout ?) avant que l'API se fige                                      |
| S7  | `Stack` : `direction` en string (`"horizontal"`) mais `gap` en nombre (`gap={2}`, clés numériques de `space`)                                                                       | `Stack.tsx`                                    | API mixte ; choisir string ou nombre pour les deux                                         |
| S8  | Sémantique `muted` différente par widget (Slider : fill `mutedForeground` ; Segmented : transparent + bordure ; Toggle : fill `muted`) — documenté comme intentionnel, à réexaminer | `Slider.tsx`, `Segmented.tsx`, `Toggle.tsx`    | Trancher : signal unifié ou différences assumées + documentées                             |
| S9  | Offset du toggle flottant hardcodé (`calc(280px + 24px)`) — casse silencieusement si `PANEL_WIDTH` change                                                                           | `ExperimentShell.tsx`                          | Dériver du token / constante, ou repositionner le toggle (coin du stage)                   |
| S10 | `ControlField` rend un `span`, pas un `label` associé — les widgets portent leur propre label, le span fait doublon visuel sans bénéfice a11y                                       | `ControlField.tsx`                             | Redéfinir son rôle (titre de contenu custom uniquement) ou l'associer vraiment             |
| S11 | Contraste `warning` (jaune vif + texte `dark0`) non vérifié, surtout en light mode                                                                                                  | `tokens.stylex.ts:112-120`                     | Audit contraste des 7 familles × 2 modes en phase 3                                        |

---

## Décisions actées (ne plus rouvrir sans raison)

- **Behaviors = mécanisme de composition des effets (validé).** `effects.*`, `interactive.*`,
  `fieldText` restent le lieu des styles partagés comportementaux. L'élévation ci-dessous
  y sera ajoutée plutôt que dispersée dans les composants.
- **Modèle d'ombres : teinte automatique + 3 élévations.** Tout élément projette une ombre
  teintée de son propre fond (règle automatique — répond à Q4 : aucun token d'ombre par
  surface). Trois situations d'un élément par rapport à son parent :
  - `flat` — pas d'ombre portée, bordure seule (état neutre, incrustation visuelle nulle) ;
  - `raised` — ombre portée diffuse teintée (boutons, panneau flottant, tout ce qui flotte
    « au-dessus » et se presse) ;
  - `sunken` — incrusté, ombre **interne** `inset` (Toggle éteint, piste de Slider, champ enfoncé).
    Le **glow reste orthogonal** : accent d'état (sélection, activité, handles), pas d'élévation.
- **`success` : retrait acté** (répond à Q1). Phase C : supprimer le token, la `Swatch`,
  les metas et toute référence.
- Q1 et Q4 sont résolues. Restent ouvertes : Q2 (light mode), Q3 (44px tactiles).
- **Dark-first acté (Q2).** On polit en dark ; passe light dédiée en fin de phase D (cf. axe 4).
- **44px négociable (Q3) — responsive-first + progressive enhancement.** Principe : on n'essaie
  pas de faire rentrer un éléphant dans une 2CV — sur petit écran on adapte la mise en page
  (réorganisation, masquage, bottom-sheet) plutôt que de tasser les contrôles denses.

---

## 2. Phases proposées (une session = une phase, commit par phase)

### Phase A — Revue stratégique (discussion, pas de code)

Revalider avant de polir :

1. Le système de composition émergent (`Page > Stack > Card > ControlSection > widget`) : l'assumer comme API officielle ou le simplifier ?
2. Périmètre de la lib : `Page`/`Text`/`Swatch` sont-ils vraiment du toolkit, ou du kit démo qui a fuité ? Où tracer la ligne vitrine vs toolkit ?
3. Les 6 intents partout : confirmer (et trancher le sort de `success`, S4).
4. Convention de nommage des props (`variant` unifié, S6) + conventions de layout (`gap` string vs nombre, S7).
5. `codex/docs/` à jour après chaque décision (SSOT : `component-authoring.md`, `ui-setup.md`, README du package).

**Validé 2026-09-14 :**

- A.1 : composition `Page > Stack > Card > ControlSection > widget` officialisée, `Page` inclus.
- A.2 : périmètre « tout garder » — `Page` / `Text` / `Swatch` / `SectionHeading` / `Readout` / `Badge` restent dans `@repo/ui`, pas de split vitrine vs toolkit.
- A.3 : 6 intents confirmés + retrait `success` (voir Décisions actées).
- A.4a (S6) : `variant` partout — `Badge.tone`, `Text.tone`, `Swatch.swatch` → `variant` (breaking en phase B).
- A.4b (S7) : `Stack` en strings adossées aux tokens `space` (`gap="3"`, `direction="vertical"`).

### Phase B — Structure (refactor sans changement visuel)

**Exécuté 2026-09-14 (avec teinte généralisée, changement visuel assumé sur
les ombres) :**

- Ombres (S1, S2, S3) selon le modèle acté : `colors.shadow` mort supprimé,
  `shadowColor` source unique, teinte auto appliquée partout (`Button`,
  panneau `ExperimentShell` en `card`, thumb `Slider` en `background`),
  élévations `flat | raised | sunken` en behaviors, doc
  `component-authoring.md` §3 mise à jour.
- S9 (offset dérivé de `PANEL_WIDTH` + `PANEL_GAP` miroir de `space["3"]`),
  S10 (rôle `ControlField` documenté), S7 (`gap` strings + démo migrée),
  S6 (`variant` partout, rename pur + démo migrée).
- Exigence : `vp check` vert + build démo (`vp -C apps/dev build`).
  Régression visuelle limitée aux ombres teintées (panel, thumb).

### Phase C — Tokens (cohérence sémantique)

**Exécuté 2026-09-14 :**

- Retrait `success` : token, `successForeground`, entrée `Swatch`, ligne démo.
- S5 : `ring` garde ses valeurs, couplage à `primary` justifié par commentaire
  (le focus porte l'identité primary ; mettre à jour ensemble).
- S8 : différences `muted` assumées + documentées (`component-authoring.md`
  § Colors) — aucun changement code.
- `input` vs `muted` : rôles distincts conservés (puits éditables bordés vs
  surfaces neutres), convergence dark documentée.
- Audit familles : base + `Foreground` + `Hover` partout (`muted` via
  `mutedForeground`/`mutedHover`).
- Exigence : `vp check` vert + build démo (`vp -C apps/dev build`).

### Phase D — Polish visuel (élévation)

**D1 exécuté 2026-09-14 (surfaces) :**

- Bordures adoucies : token `border` en `color-mix` translucide (55 %).
- Texture : `effects.grain` (bruit monochrome 4 %, data-URI) sur `Page` + `Stage`.
- Glass : `effects.glass` (`card` 72 % + blur 12px) sur panneau flottant
  `ExperimentShell` (le blur seul sur fond opaque était invisible) ; surfaces
  en flux restent opaques.
- Profondeur : alphas/étendues `rest`/`raised`/`floating` creusés avec retenue.
- `vp check` vert + build démo OK (grain + blur 12px vérifiés dans `stylex.css`).

Axes restants :

**D2 exécuté 2026-09-14 (focus + SVG) :**

- Audit focus : déjà correct par contexte, documenté (`component-authoring.md`
  §6) — `:focus-visible` pressables, `:focus` champs texte, pattern
  `when.descendant` Slider pour inputs invisibles. Zéro changement code.
- Finition SVG commune : chevron `Select` 1.6 → 1.8, coche `Checkbox`
  2.0 → 1.8 (grille 12px, ronds, `currentColor`) ; dot `RadioGroup` en CSS,
  inchangé.

**D3 exécuté 2026-09-14 (densité + motion) :**

- Densité : échelle déjà cohérente (`ControlField` 8 / `ControlSection` 12 /
  `ControlPanel` 16) ; `minHeight` 44px au niveau rangée `ControlField`,
  pastilles compactes assumées (44px négociable, responsive-first).
  Zéro changement.
- Motion : `Toggle` branché sur les tokens (`durationFast`/`easingOut` au
  lieu des valeurs hardcodées) ; `interactive.base` couvre déjà le reste.
  Transition du dégradé démo statuée : reste inline (contenu canvas, pas UI).

**D4 à faire (reprise) : passe light + audit contraste (S11) :**

- Contexte : toggle `light / dark / system` en place (hero démo),
  `devenv.nix` fournit `uv` (recharger le shell).
- Lancer l'audit WCAG des 6 familles × 2 modes depuis les oklch via
  `uv run --no-project python` (script en attente), ajuster si < 4.5,
  `vp check` + build démo, puis clore le polish.

**Thème manuel exécuté 2026-09-14, simplifié vers la recette doc (pré-requis D4) :**

- D'abord `darkTheme` (`createTheme`), puis migration vers `light-dark()` +
  `color-scheme` comme recommandé par la doc StyleX : zéro classe à jongler,
  `prefers-color-scheme` absent du CSS, mode `system` (`light dark`) qui suit
  l'OS en direct sans JS.
- Toggle `light / dark / system` dans le hero de `apps/dev`.
- `shadowColor` exporté de l'index ; leçons compilateur notées dans
  `ui-setup.md` et `component-authoring.md`.

Seulement après A–C. Axes suggérés :

1. Profondeur : échelle `rest`/`raised`/`floating` réellement distincte en dark comme en light (aujourd'hui subtile).
2. Focus : anneaux visibles au clavier sans bruit à la souris (pattern Slider `when.descendant` à généraliser ?).
3. Densité instrument : rythme vertical du `ControlPanel` (gaps, `minHeight` 44px, cibles tactiles — audit).
4. Balance dark/light : la démo vit en dark ; exiger une passe light mode complète (S11).
5. Motion : durées/easings appliqués partout ou nulle part (transition du dégradé démo en inline = à statuer).
6. Détail : chevron `Select`, coche `Checkbox`, dot `RadioGroup` — finition SVG commune ?

---

## 3. Protocole de session (à rappeler à l'agent)

1. Charger le skill `coding-style`, relire ce document + la phase visée uniquement.
2. Une phase à la fois ; proposer le plan, attendre validation, puis implémenter.
3. Démo-driven : chaque changement lib doit se voir dans `apps/dev` (composants uniquement, règle en vigueur).
4. Vérifications : `vp check` après chaque étape, `vp -C apps/dev build` en fin de phase, régression visuelle avant/après pour B et D.
5. Mettre à jour `codex/docs/` quand un pattern évolue (la doc est SSOT).
6. Ne jamais commiter/pusher sans demande explicite.

## 4. Questions (toutes résolues)

- Q1 : ~~`success` 7ᵉ intent ou token d'affichage ?~~ → résolue : retrait.
- Q2 : ~~light mode première classe ou dark-first ?~~ → résolue : dark-first, passe light en fin de D.
- Q3 : ~~44px intangible ?~~ → résolue : négociable, responsive-first / progressive enhancement.
- Q4 : ~~token `shadow` par surface ou couleur unique ?~~ → résolue : teinte auto du fond projeteur.
