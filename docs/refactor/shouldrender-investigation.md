# Investigation : effet de bord de `shouldRender` sur `lastRenderRef`

Dans `RandomArtCanvas.tsx`, le rappel `shouldRender` écrit `lastRenderRef.current = key`
dès qu'il retourne `true`, _avant_ que le dessin n'ait eu lieu. Si le dessin est ensuite
sauté ou lève, `lastRenderRef` croit avoir rendu la clé et `needsRender` répondra `false`
aux frames suivantes : l'affichage peut rester périmé.

Ce document sépare, pour chaque question, ce que le code montre de ce que je suppose.
Tous les chemins de code lus sont référencés `fichier:ligne`.

## 1. Entre `shouldRender` → `true` et le draw effectif, une exception ou un saut est-il possible ?

### Ce que le code montre

- `packages/randomart-ui/src/components/RandomArtCanvas.tsx:93-104` : `shouldRender` calcule la clé, appelle `needsRender(lastRenderRef.current, key)` (L101), et — si vrai — assigne `lastRenderRef.current = key` (L104) puis retourne `true`. L'assignation précède le dessin de façon synchrone.
- `packages/glaze/src/react/GpuCanvas.tsx:166-182` : la boucle d'animation appelle `shouldRender(frame)` (L173) dans le rappel `onFrame`, puis, si `wanted`, exécute `program.setUniforms(...)` (bloc L176), `frame.renderProgram(program)` (L177) et seulement ensuite fige `renderedProgramRef.current = program` (L178).
- `packages/glaze/src/gpu/GpuSurface.ts:142-146` : `renderProgram` fait `this.#flushBatch()` puis `if (this.#lost) { return this; }` : le draw est **sauté silencieusement** quand le contexte WebGL est perdu. Aucun `throw` JS n'est levé par `renderProgram` lui-même.
- `packages/glaze/src/gpu/shader/Program.ts` : `setUniforms` et `render()` n'appellent que des méthodes WebGL (`useProgram`, `uniform1f`, `drawArrays`, …), qui ne lèvent pas d'exception JS sur un contexte perdu (ignorées ou signalées via `getError`).

### Ce que je suppose

- `flushBatch` et `setUniforms` ne lèvent pas d'exception JS en cours de frame (non vérifié ligne par ligne pour `flushBatch`, mais ni `renderProgram` ni `setUniforms` ne contiennent de `throw`).
- Un draw "sauté" sans exception ne peut donc venir que de `this.#lost` (contexte perdu), puisque `renderProgram` retourne tôt avant toute commande GL.

### Conclusion Q1

Oui, un **saut** de draw est démontré : contexte perdu → `#lost = true` → `renderProgram` ne dessine pas, alors que `lastRenderRef.current = key` a déjà été écrit par `shouldRender`. Une **exception JS** entre les deux n'est démontrée par aucun chemin de code lu.

## 2. Perte puis restauration du contexte : `lastRenderRef` remis à `null` sur `webglcontextrestored`. Trou de temporisation ?

### Ce que le code montre

- `packages/randomart-ui/src/components/RandomArtCanvas.tsx:73-75` : `handleMount` s'abonne à `webglcontextrestored` et remet `lastRenderRef.current = null`. Il n'existe **aucun** écouteur `webglcontextlost` dans ce composant.
- `packages/glaze/src/gpu/GpuSurface.ts:92-93` : la surface s'abonne aux deux événements. `#onContextLost` (L316-318) passe `#lost = true` ; `#onContextRestored` (L321-322) repasse `#lost = false` et réinitialise programmes et tampons.
- Pendant la perte, la boucle d'animation tourne toujours (`#frameStep` appelle `runFrameSubscribers` chaque frame) : `shouldRender` continue d'être évaluée et `lastRenderRef.current` continue d'avancer au fil des clés, mais `renderProgram` ne dessine plus (`#lost`).

### Ce que je suppose

- Le navigateur apporte bien l'événement `webglcontextrestored` quand le contexte est restauré (contrat WebGL) ; l'écouteur de `RandomArtCanvas` s'exécute alors de façon synchrone avant le prochain `#frameStep`.
- Entre la perte et la restauration, l'écran est forcément figé (impossible de dessiner sans contexte) : c'est inhérent à la perte de contexte, pas un bug de ce composant.

### Conclusion Q2

Non, pas de **trou persistant** après restauration : `lastRenderRef.current = null` (L74) force `needsRender(null, key) = true` à la frame suivante, donc un redraw a lieu dès le premier frame post-restauration. La seule fenêtre de figement est la perte de contexte elle-même, qui ne peut pas être comblée (pas de contexte = pas de draw).

## 3. GpuCanvas expose-t-il un callback "après rendu" pour écrire `lastRenderRef` après le draw ?

### Ce que le code montre

- `packages/glaze/src/react/types.ts:137` : `GpuCanvasProps.onFrame?: GpuDraw` — "Appelée à chaque image, après le dessin."
- `packages/glaze/src/react/GpuCanvas.tsx:182` : `onFrameRef.current?.(frame)` est appelé à la fin du rappel de frame, **après** le bloc de draw. Mais il s'exécute aussi quand `wanted` est `false` (aucun `setUniforms`/`renderProgram`) et quand `#lost` fait sortir `renderProgram` tôt : ce n'est **pas** un hook "après draw réussi".
- Il n'existe pas de prop dédiée "après un draw effectif" dans `GpuCanvasProps` (types.ts:136-137).

### Ce que je suppose

- Aucune : l'absence de hook post-draw est lisible directement dans les props et le corps de l'effet de frame.

### Conclusion Q3

`onFrame` existe (types.ts:137, appelé GpuCanvas.tsx:182) mais il n'est pas draw-gaté : il tire aussi sur les frames sautées. Le plus petit ajout dans glaze serait une nouvelle prop optionnelle, par exemple `onAfterRender?: (surface: GpuSurface) => void`, appelée uniquement dans le bloc de draw juste après `frame.renderProgram(program)` (GpuCanvas.tsx:177) — soit 1 champ dans `types.ts` + 1 appel (+ wiring `useLatest`) dans `GpuCanvas.tsx`, environ 6 à 8 lignes sur 2 fichiers.

## 4. Cas réel, démontrable depuis le code, où l'écran reste périmé à cause de cet effet de bord ?

### Ce que le code montre

- Cas démontré (contexte perdu) : `shouldRender` écrit la clé (RandomArtCanvas.tsx:104), `renderProgram` saute le draw (GpuSurface.ts:144-146), l'écran garde la frame précédente. Cet écran figé dure tant que le contexte est perdu — aucune commande GL ne peut s'exécuter — et se répare dès `webglcontextrestored` (RandomArtCanvas.tsx:74 → `lastRenderRef.current = null` → redraw frame suivante).
- Cas non démontré : une exception entre `shouldRender` → `true` et le draw (voir Q1).
- Auto-guérison : à la prochaine clé qui change (phase, taille, dpr, `animated`), `needsRender` retourne `true` même si `lastRenderRef` était optimistement avancé, donc un draw est redemandé immédiatement après.

### Ce que je suppose

- Aucun cas d'écran périmé durable n'est démontrable : le seul saut de draw identifié (contexte perdu) est intrinsèquement temporaire et se répare lui-même ; aucune exception intermédiaire n'est visible dans le code lu.

### Conclusion Q4

Non : il n'y a pas de cas réel démontrable depuis le code où l'écran reste périmé de façon durable à cause de cet effet de bord.

## Recommandation

Laisser tel quel : le seul saut de draw démontré (contexte WebGL perdu) se répare dès `webglcontextrestored`, qui remet `lastRenderRef` à `null` (RandomArtCanvas.tsx:74) et force un redraw la frame suivante ; le prochain changement de clé redemande aussi un draw via `needsRender`. Aucune exception entre `shouldRender` et le draw n'est démontrée dans le code lu. Pour supprimer la fenêtre théorique d'une image, ajouter dans glaze une prop `onAfterRender` appelée juste après `frame.renderProgram` (≈ 6-8 lignes sur `types.ts` + `GpuCanvas.tsx`) et y committer `lastRenderRef`.
