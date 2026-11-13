Verdict
L'idée est bonne. Le grain est un bon « canary » : il est visuellement évident, simple à implémenter, et il force à valider toute la mécanique multi-passe (FBO, sampling, resize, contexte perdu, UI). Le découpage registre / store / UI est sain et cohérent avec le reste du repo.
En revanche, PHASE1 n'est pas exécutable tel quel. Le plan sous-estime deux choses : le point d'intégration dans @repo/glaze, et le render gate de RandomArtCanvas. Sans les traiter, tu vas soit bloquer, soit contourner GpuCanvas avec du code jetable.
Ce qui est solide

- Le pipeline shader → texture → effet → canvas est la bonne architecture pour des effets indépendants de la grammaire.
- Le registre statique avec order, defaultActive et types dérivés est le bon seam.
- Grain désactivé par défaut, toggle seul, export PNG et smooth maximum différés : bon contrôle du scope.
- Un seul effet suffit largement à valider la mécanique.
  Les points à trancher avant de coder

1. GpuCanvas n'a aucun point d'insertion propre (bloquant)
   Aujourd'hui, GpuCanvas fait toujours :
   program.setUniforms(...)
   frame.renderProgram(program) // dessine directement dans le framebuffer par défaut

- GpuSurface n'expose ni son gl, ni une API de render target.
- StateBuffer.step() est spécialisé GPGPU : il binde la texture de lecture sur u_state, utilise son propre programme actif, et écrit dans son FBO. Ce n'est pas un pipeline de post-processing générique.
- StateBufferTargets est réutilisable pour les cibles, mais il faut gérer soi-même la passe 1, le swap(), et la passe finale vers le canvas.
- Program.render() force le viewport à gl.drawingBufferWidth/Height. Tant que le FBO fait exactement la taille du drawing buffer, ça passe ; sinon le viewport sera faux. Pour la Phase 1 en live, c'est acceptable, mais c'est une contrainte à documenter.
- StateBuffer.reinitialize() recrée les textures/FBO mais ne recompile pas les programmes ajoutés via addProgram(). Sur webglcontextrestored, des effets créés ainsi seraient morts.
  Deux options :
- A. Petite extension de glaze (recommandé) : ajouter un hook renderFrame?: (surface, program) => void à GpuCanvas. Par défaut, il appelle surface.renderProgram(program). RandomArtCanvas fournit alors sa propre implémentation : passe 1 dans le FBO, effets, dernière passe vers le canvas. C'est une couture minime qui préserve la gestion du shader, du clock et du render gate par GpuCanvas.
- B. Contourner GpuCanvas dans randomart-ui : utiliser createGpuStack / onFrame et refaire la compilation, les erreurs de shader et le gate. Ça marche, mais c'est de la duplication et probablement du code jetable.
  Je recommande A. Si tu veux garder tout le pipeline hors du composant, tu peux aussi ajouter un GpuPostProcessCanvas dans glaze, mais c'est plus de travail pour la Phase 1.
  Pour les ressources : utilise surface.createProgram() pour les shaders d'effet et surface.createStateBuffer().targets pour les cibles. Ils sont possédés par la surface, donc détruits et réinitialisés correctement. Évite StateBuffer.addProgram() pour l'instant.

2. Le toggle ne déclenchera pas de redraw quand c'est en pause (bloquant)
   needsRender compare uniquement phase, width, height, dpr, animated (packages/randomart-ui/src/renderer/renderGate.ts). Si tu actives le grain alors que le canvas est en pause, le gate répondra « non » et l'écran ne changera pas.
   Il faut inclure un signature de post-processing dans RenderKey :
   interface RenderKey {
   // ...
   readonly postProcess: string; // ex: 'grain' ou 'grain:0.4'
   }
   Cette signature doit changer quand un effet est activé/désactivé, quand l'intensité change, etc. Et si aucun effet n'est actif, le chemin direct doit rester identique au rendu actuel.
3. Statique ou animé ? À décider maintenant
   Le rendu actuel est lazy : en pause, le GPU ne fait rien. Un grain animé (u_time, bruit qui bouge à chaque frame) casse ce modèle : il faut rendre en continu, même en pause.
   Pour la Phase 1, je recommande un grain statique, déterministe, basé sur les coordonnées pixel et éventuellement une graine fixe. Ça reste testable, reproductible, et ça préserve le render gate. Si tu veux vraiment un grain animé, il faut l'assumer explicitement et adapter le gate.
4. Intensité : incohérence entre les deux docs
   POST-PROCESSING.md parle d'un « toggle ou curseur … intensité ». PHASE1.md ne prévoit qu'un toggle, et le store ne stocke que des booléens.
   Tranche :

- Phase 1 = toggle seulement : alors retire l'intensité des critères de Phase 1 et assume que le store évoluera.
- Phase 1 = toggle + intensité : alors il faut prévoir dès maintenant un champ strength dans le store et un uniform dans le shader. Le registre doit aussi permettre de décrire les paramètres d'un effet, sinon « ajouter un effet sans modifier le cœur » deviendra faux dès le deuxième effet.

5. Contrat d'effet à préciser
   Le plan dit « reçoit une texture, écrit o_color », mais il manque les détails qui vont bloquer l'implémentation :

- nom du sampler d'entrée : u_source (ou u_texture) ;
- uniform de résolution : u_resolution (déjà fourni par GpuSurface) ;
- éventuellement u_time si animé ;
- vertex shader : le même fullscreen triangle que randomart, avec vUv ;
- dernier effet : écrit directement dans le canvas, pas dans une texture.
  Et si la Phase 2 doit mélanger l'image originale avec l'effet, le contrat mono-entrée ne suffira pas : il faudra un pass multi-entrées. Ce n'est pas bloquant maintenant, mais ne verrouille pas l'API plus que nécessaire.

6. Erreurs d'effet et restauration de contexte

- Un shader d'effet qui ne compile pas ne doit pas casser l'artwork. Compile-le avec tryCreateProgram et, en cas d'échec, désactive l'effet ou fais un fallback direct.
- Si renderFrame lève une exception, le lastRenderRef a déjà été enregistré par le gate : le canvas risque de ne jamais réessayer. Garde renderFrame non-throwing.
- Teste explicitement WEBGL_lose_context et le resize. Le plan le demande, mais il faut aussi vérifier que les programmes d'effet sont recompilés et que les cibles sont recréées.
  Petits points
- Le chemin packages/codex/docs/noUncheckedIndexedAccess.md est faux : c'est codex/docs/noUncheckedIndexedAccess.md.
- « Deux passes » est un abus de langage : avec un effet, c'est 2 draws ; avec N effets, N+1 draws. Ce n'est pas grave, mais précise-le dans le plan.
- L'ordre order doit être testé. Deux effets avec le même order doivent avoir un tie-break déterministe (ordre du registre) ou une validation.
- Le store devrait être lu par Scene puis passé à RandomArtCanvas, comme artwork et duration, pour garder le composant canvas découplé du store.
- Ajoute un test unitaire sur l'ordre + l'état initial du store, et un test du RenderKey avec post-processing. Le reste (visuel) peut rester manuel.
  Plan révisé suggéré

0. Trancher : grain statique, toggle seul, chemin direct si aucun effet.
1. Ajouter le hook renderFrame à GpuCanvas (ou acter le bypass).
2. Définir le contrat d'effet (u_source, u_resolution, vUv, o_color).
3. Créer le registre + le store + tests d'ordre/initialisation.
4. Écrire le shader de grain.
5. Brancher le pipeline dans RandomArtCanvas via renderFrame, avec ressources possédées par la surface.
6. Ajouter la signature post-processing au RenderKey.
7. Ajouter les toggles dans Controls via ControlSection + Toggle.
8. Tester : toggle en pause, resize, perte/restauration de contexte, chemin sans effet, erreur de shader d'effet.
   Conclusion : ce n'est pas une mauvaise idée, et la direction est bonne. Mais ne commence pas par le registre ou l'UI : commence par le point d'intégration dans glaze et par le render gate. Sinon tu risques de construire une belle UI autour d'un pipeline qui ne peut pas se déclencher.
