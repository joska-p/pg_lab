---
target: critique des bordures et effets d elevation des elements de App.tsx
total_score: 30
max_score: 40
na_heuristics:
p0_count: 1
p1_count: 2
target_identity: "file:/home/muratha/Dev/dev-container/pg_lab/apps/dev/src/App.tsx"
target_fingerprint: "sha256:31a5814136bd26bafc7f122dcc0128294529a0aa21cb14637215e6233766bfe2"
target_path: /home/muratha/Dev/dev-container/pg_lab/apps/dev/src/App.tsx
timestamp: 2026-09-14T22-33-59Z
slug: apps-dev-src-app-tsx
---

# Critique — Bordures & effets d'élévation · apps/dev/src/App.tsx

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                                    |
| --------- | ------------------------------- | --------- | -------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 4         | Readouts, glow, loading, theme — solide. "press me" tile prétend sans agir.                  |
| 2         | Match System / Real World       | 3         | Vocabulaire mono apte aux devs, mais "surface" vs "raised" indistinguables visuellement.     |
| 3         | User Control and Freedom        | 3         | Pas de swap de surface live sur le demo d'élévation (l'objet qu'on veut tweaker).            |
| 4         | Consistency and Standards       | 2         | Modèle contredit la réalité : sunken jamais visible, glass en flow, tinting cassé par glass. |
| 5         | Error Prevention                | 3         | Clamps, disabled/loading, min/max — bien couvert.                                            |
| 6         | Recognition Rather Than Recall  | 3         | Captions mono partout, mais décoder les rungs en dark exige la lecture.                      |
| 7         | Flexibility and Efficiency      | 3         | Segmented/radio clavier, randomize, theme — pas d'accélérateurs supplémentaires.             |
| 8         | Aesthetic and Minimalist Design | 3         | Plus calme que le budget bruit/gradient ne le suggère ; section élévation la plus encombrée. |
| 9         | Error Recovery                  | 3         | Pas de vraie surface d'erreur ; couvert par clamps/disabled.                                 |
| 10        | Help and Documentation          | 3         | Labels = docs et bons ; pas de légende rung → token.                                         |
| **Total** |                                 | **30/40** | **Good**                                                                                     |

## Design Specificity Verdict

**LLM assessment : architecture bien pensée, rendu qui ne livre pas le modèle.** Le modèle d'élévation est clair sur papier (flat/raised/sunken/pressable/floating, une seule variable --shadow-color, radius 4/6/8 goûtés, hairline par défaut). Quatre pannes structurelles : sunken invisible tel que rendu ; démo d'élévation confond surface et rung ; dark mode effondre l'échelle ; glass utilisé en flow partout au lieu d'être réservé au flottant.

**Scan déterministe : 0 bloquant, 1 advisory.** design-system-color sur shadows.stylex.ts:9 (oklch(0% 0 0)) — faux positif de basse confiance, ancre noire explicitement documentée (S2), jamais rendue à pleine alpha. Caveat : DESIGN.md bannit le noir pur pour les surfaces, l'ancre d'ombre est un cas limite.

**Preuve déterministe forte manquée par A :** collision boxShadow entre effects.glass et effects.floating (App.tsx:381 + effects.stylex.ts:50,65) — StyleX last-wins, l'ombre glass est écrasée sur la tuile "glass · over backdrop", seule vitrine de la recette d'ombre glass, qui ne s'affiche nulle part.

**Overlays visuels :** aucun outil navigateur exposé cette session — preuve par source + détecteur uniquement.

## Overall Impression

Système d'élévation bien dessiné sur le papier qui, dans son propre showcase, se rend presque plat. Le show doit prouver la ladder flat < raised < sunken < floating — et sur écran les rungs se confondent, surtout en dark. Opportunité n°1 : ré-isoler la variable (une seule surface neutre, les quatre rungs, même teinte) et rendre sunken et les ombres dark réellement perceptibles.

## What's Working

1. L'ombre se peint elle-même : une seule variable shadowColor déclenche les cinq tokens via color-mix ; les boutons qui castent une ombre teintée famille = vraie signature.
2. Modèle sobre, nommé, documenté : flat/raised/sunken/pressable/floating + motion 120–320ms + easingOut ; pas de gloss SaaS ; vocabulaire DESIGN.md précis (Warm Ground, Pilot Light, Shadow-Paints-Itself).
3. Focus-ring système excellent : 0 0 0 2px bg / 0 0 0 3px ring, :focus-visible clavier-only, jusqu'au Slider via descendant.

## Priority Issues

**P0 — sunken est du code mort tel que rendu.**

- Quoi : shadows.sunken = inset 0 1px 2px shadowColor@22% ; les deux consommateurs posent shadowColor = leur propre fill. Ombre inset teintée de la couleur de la surface qu'elle creuse = invisible en light ET dark.
- Pourquoi : une cavité a besoin d'un reflet top-light, pas d'une ligne sombre de même teinte. Le seul échelon qui montre le creux ne se voit pas.
- Fix : composer sunken en deux couches — inset 0 1px 0 color-mix(shadowColor 35%, white) + inset 0 1px 2px color-mix(shadowColor 25%, transparent) — et déployer sur wells d'input, piste Slider, rail Segmented (zéro inset aujourd'hui).
- Command : $impeccable polish

**P1 — Démo d'élévation confond surface et rung ; ombres neutres disparaissent en dark.**

- Quoi : 5 fonds + teintes différents sur les tuiles ; seul flat/floating partagent cardBg avec teinte diff. En dark : background L≈0.28 vs card L≈0.31 → raised/floating imperceptibles ; "flat · border only" invisible (hairline ~1.4:1).
- Pourquoi : le showcase doit isoler la variable ; D4 a écrasé la ladder à ΔL<0.08.
- Fix : rangée 1 = surface neutre identique pour flat/raised/sunken/floating, teinte identique ; rangée 2 = démos teintées. Dark : alphas ~28→38% ou ligne de contact light-dark().
- Command : $impeccable layout

**P1 — glass utilisé en flow, rompant la règle Glass-On-Floating-Only.**

- Quoi : chaque carte showcase tourne en effects.glass (background@45% + blur(24px) saturate(180%)) en flow ; panel docked reçoit aussi glass → "docked" flotte quand même.
- Pourquoi : translucidité in-flow rend le contraste du texte dépendant du fond ; blur × ~10 cartes = coût de compositing.
- Fix : cartes in-flow → surface/raised ; glass réservé au panel flottant et à la tuile Foundations. Corriger le panel docked.
- Command : $impeccable polish

**P2 — Ombre flottante teintée sur carte neutre lit comme glow, pas hauteur.**

- Quoi : tuile floating = cardBg + surfaceTints.accent → aura accent@28%, même teinte que le LED glow et la tuile "glow = state".
- Pourquoi : DESIGN.md argue glow ≠ élévation ; halo chromatique 28% = luminosité. Le panel fait le bon choix (colors.card).
- Fix : démo floating avec teinte colors.card comme le panel ; teinte accent sur surface teintée ou légendée comme preuve shadow-paints-itself.
- Command : $impeccable polish

**P2 — Double contrat de bordures + déploiement sunken manquant.**

- Quoi : colors.border (~1.1–1.7:1) wells/cards ; intents en borderColor = fill (auto-invisible) ; Segmented et piste Slider sans bordure ; inputs sans inset. Dark : bg/card/input/muted convergent à ΔL<0.08.
- Pourquoi : pas de signal redondant de creux ; hairline seule = noir sur noir en dark.
- Fix : bordure (ou inset) sur rails muted ; éclaircir border en dark via light-dark() ou token border-strong.
- Command : $impeccable layout

**P3 — glass contourne la source unique d'ombre et caste des ombres claires.**

- Quoi : effects.glass hardcode 0 8px 32px colors.background@50% + borderColor foreground@12%, ignoré shadowColor. En light background crème → halo clair, mauvaise illumination.
- Fix : dériver de shadowColor comme les quatre autres tokens (glassFloat aux poids floating).
- Command : $impeccable polish

**P3 — Quirk d'ordre d'alpha : hover @24% > raised @22%.**

- Quoi : pressable au repos plus sombre que raised voisin, mais hover le dépasse — incohérence de ladder, confirmée par scan B.
- Command : $impeccable polish

## Persona Red Flags

- Alex (Power User) : veut A/B les quatre rungs sur une même surface ; tuiles confondues → source-diving dans intents/shadows. Demo dark sous-vend raised/floating/sunken.
- Sam (Accessibility) : hairlines ~1.4:1 + zéro inset sur wells + sunken invisible → récessivité indisponible aux malvoyants.
- Casey (Mobile) : 10+ cartes blur(24px) + stage gradient = jank de compositing au scroll ; tuile pressable inerte mais change d'ombre, hover collé au tap.

## Minor Observations

- radius 4/6/8 sur bordures 1px : sm↔md sous JND — rationaliser.
- Tuile glass + floating : floating last-wins → recette d'ombre glass montrée nulle part.
- Focus ring + effects.pressable : boxShadow last-wins → la touche clavier fait chuter l'élévation du bouton au focus.
- Knob Toggle = background sur piste muted en dark : même couleur à l'état off.
- Button disabled opacity:0.45 efface aussi la bordure.
- glowRing (effects.stylex.ts:23) = seul consommateur non-mixé de shadowColor (halo full-alpha).
- ColorField : une seule rangée (warm tint + disabled), contrôle le moins couvert.

## Questions to Consider

1. Si le show-piece sunken ne se rend pas sur sa propre surface, le système d'élévation existe-t-il en dark — ou seulement sous forme de tokens ?
2. Quand une carte neutre flottante caste une ombre violette à 28%, comment l'utilisateur sépare hauteur et état, avec la tuile glow deux emplacements plus loin ?
3. Un dev visuel qui lit les rungs sans les voir : design system, ou index de celui-ci ?
4. Un seul light-dark() sur les alphas (dark ~35-40%) + une ligne claire sur sunken réparerait ~80% de l'ambiguïté dark ?
