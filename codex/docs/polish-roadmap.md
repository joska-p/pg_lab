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

### Phase B — Structure (refactor sans changement visuel)

- Ombres (S1, S2, S3) selon le modèle acté : une seule source de couleur, règle
  teinte-auto (l'élément teinte avec son fond), élévations `flat | raised | sunken`
  en behaviors, doc `component-authoring.md` §3 mise à jour.
- S9 (offset dérivé), S10 (rôle `ControlField`), S7 (typage `gap`).
- Exigence : `vp check` vert + build démo identique visuellement avant/après (comparer `stylex.css` et captures).

### Phase C — Tokens (cohérence sémantique)

- Retrait `success` acté : token, `successForeground`, `Swatch`, metas, références.
- S5 (`ring` : référencer `primary` ou justifier), S8 (sémantique `muted` unifiée ou assumée).
- Revoir `input` vs `muted` (deux gris proches : `light2`/`dark2` vs `light3`/`dark2`) — fusionner ou différencier franchement.
- Vérifier chaque famille : `<family>` + `<family>Foreground` + `<family>Hover` présents et justifiés.

### Phase D — Polish visuel (élévation)

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
