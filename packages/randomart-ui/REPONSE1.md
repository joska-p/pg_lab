Réponse courte
Ce n'est pas une erreur de design fondamentale, et tu n'en demandes pas trop. Glaze a de bonnes fondations : Program, compileProgram, ShaderError, FrameLoop, Camera, InputStore, le render gate, les tests. J'ai lancé vp -C packages/glaze check et vp -C packages/glaze test : tout passe, 60 tests. Ce n'est pas un château de cartes.
Ce qui bloque, c'est que glaze n'a pas encore deux concepts génériques :

- une cible de rendu (RenderTarget) ;
- une passe de rendu personnalisable (un hook pour décider comment dessiner une frame).
  Le ping-pong n'est pas un truc de post-processing. C'est une primitive GPU. En revanche, le pipeline d'effets, l'ordre, les uniforms, l'UI et l'intensité du grain ne doivent pas entrer dans glaze. C'est là qu'il faut mettre la frontière.

1. Ce qui est sain et qu'il ne faut pas réécrire

- Program / compileProgram / ShaderError : propre, testé, avec nettoyage des shaders en cas d'échec.
- FrameLoop : simple, avec injection de now/schedule, testable.
- Camera, InputStore, Clock, les brands : cohérents.
- Le modèle GpuSurface + GpuCanvas + onMount / shouldRender / onFrame est une bonne base pour du rendu lazy.
- StateBufferTargets est déjà, de fait, un RenderTargetPair. Il est isolé et testé. C'est une extraction à faire, pas une invention.
  Le problème est localisé : GpuSurface, GpuCanvas, StateBuffer, et le viewport hardcodé dans Program / ShapeBatcher.

2. Les vrais bugs, indépendants du post-processing
   Sévérité Problème Preuve Impact
   P0 Les programmes de StateBuffer ne sont pas recompilés après une perte de contexte StateBuffer.reinitialize() ne recrée que les targets (StateBuffer.ts:124) ; GpuSurface ne recompile que les programmes qu'il possède (GpuSurface.ts:329) Après webglcontextrestored, StateBuffer.step() utilise des WebGLProgram morts. Automa est probablement concerné.
   P0 StateBuffer.destroy() ne prévient pas GpuSurface GpuSurface.createStateBuffer ajoute le buffer à #buffers (GpuSurface.ts:135), mais StateBuffer n'a pas de destroy hook SimulationEngine.destroy() détruit son buffer, mais la surface le garde et le réinitialisera au prochain restore. Fuite / résurrection.
   P0 GpuCanvas ne redessine pas après restauration en mode shouldRender renderedProgramRef n'est pas réinitialisé (GpuCanvas.tsx:99) ; le workaround est dans RandomArtCanvas.tsx:77 Canvas noir après perte de contexte pour tout consommateur qui utilise le gate. La lib ne devrait pas dépendre d'un workaround côté app.
   P1 StateBuffer.step() ne remet pas à zéro l'allocateur d'unités de texture Program.#nextTextureUnit n'est remis à zéro que par Program.render() (Program.ts:52), que step() n'appelle pas (StateBuffer.ts:275) ; u_state est câblé en dur sur l'unité 0 Si un shader de state a un autre sampler, les unités dérivent ou se chevauchent. Latent aujourd'hui, bloquant pour un usage générique.
   P1 GpuSurface.renderProgram suppose le framebuffer par défaut GpuSurface.ts:143 ne binde aucune cible ; Program.render() force le viewport au drawing buffer (Program.ts:55) ; ShapeBatcher.flush() fait pareil (ShapeBatcher.ts:228) Impossible de rendre dans un FBO de taille différente. C'est le blocage principal du multi-passe.
   P1 GpuCanvas hardcode le draw GpuCanvas.tsx:177 appelle toujours frame.renderProgram(program) ; onFrame arrive après Aucun moyen propre d'insérer une passe.
   Petit bug en plus : isWebGLTextureValue utilise value instanceof WebGLTexture (setUniforms.ts:9). C'est fragile en cross-realm / headless. À remplacer par un test plus tolérant ou une union explicite.
   Et le README promet une « Context Loss Recovery » complète (README.md:31), alors que les programmes de StateBuffer et l'état de simulation ne sont pas restaurés. Soit tu corriges, soit tu précises la promesse.
3. Les manques de design qui bloquent le multi-passe
   Ce ne sont pas des bugs : ce sont des coutures absentes.
   a) RenderTarget / RenderTargetPair
   StateBufferTargets fait déjà le travail : bindWrite, unbind, getReadTexture, getWriteTexture, swap, resize, reinitialize, destroy. Il faut l'extraire en primitive générique.

- StateBufferTargets = ping-pong de textures.
- StateBuffer = sémantique GPGPU (init, u_state, step).
- Le post-processing a besoin du premier, pas du second.
  C'est la réponse à ta question : oui, glaze peut être responsable du ping-pong, mais du ping-pong comme mécanique de render targets, pas comme pipeline d'effets.
  b) renderProgramTo(program, target) et le viewport
  Aujourd'hui, Program.render() et ShapeBatcher.flush() considerent que la seule cible est le canvas. Il faut :
- Program.render(viewport?) ou Program.renderTo(width, height) ;
- ShapeBatcher.flush(viewport?) ;
- GpuSurface.renderProgramTo(program, target) qui binde la cible, règle le viewport, rend, puis unbind.
  Attention : pour une cible de taille différente du canvas, il faut aussi passer un contexte de passe (largeur, hauteur, dpr) pour les uniforms standard. Pour la Phase 1 où la cible fait la taille du canvas, c'est simple. Pour un export offscreen, ça devient un vrai contrat.
  c) Un hook renderFrame sur GpuCanvas
  Le plus petit changement qui débloque tout :
  // GpuCanvasProps
  renderFrame?: (surface: GpuSurface, program: Program) => void;
  Par défaut, il appelle surface.renderProgram(program). RandomArtCanvas peut alors fournir sa propre implémentation : passe 1 dans un FBO, effets, dernière passe vers le canvas. Ça préserve la gestion du shader, du clock, des erreurs et du render gate par GpuCanvas.
  C'est mieux que de contourner GpuCanvas et de réimplémenter la compilation + les erreurs de shader.
  d) isLost et onContextRestored
- GpuSurface a #lost privé, mais aucun getter. Un consommateur qui fait du rendu custom ne peut pas savoir s'il doit éviter de recréer des ressources.
- Il faut un callback onContextRestored pour que les consommateurs puissent re-seeder leur état. La restauration WebGL recrée des textures vides : ce n'est pas une reprise d'état.
  e) La politique de passe
  Aujourd'hui, GpuSurface.#configureState() active BLEND globalement. Pour des passes de post-processing, il faut souvent désactiver le blend ou clear la cible. Ce n'est pas bloquant pour le grain si tout écrit alpha = 1, mais c'est un manque pour des effets génériques.
  f) Les tests
  Il y a des tests pour Program, StateBuffer (targets), FrameLoop, CpuSurface. Il n'y a aucun test pour GpuSurface, GpuCanvas, la perte/restauration de contexte, ou StateBuffer avec des programmes. C'est précisément la zone fragile.

4. Ce qui n'est pas le job de glaze
   Ne mets pas dans glaze :

- le registre d'effets (grain, vignette, …) ;
- l'ordre des effets ;
- les uniforms/intensités ;
- les toggles UI ;
- la politique d'export PNG ;
- un pipeline de post-processing complet.
  Glaze doit fournir les primitives : render targets, passes, viewport, resize, context restore, nettoyage. L'application compose. Si un deuxième consommateur apparaît, tu extrais un @repo/postprocessing. Pas avant.
  C'est la bonne frontière :
  glaze → render targets, passes, viewport, lifecycle
  randomart-ui → quels effets, dans quel ordre, avec quels uniforms

5. Est-ce que tu en demandes trop ?
   Non, si tu demandes les bonnes primitives. Oui, si tu demandes à glaze de gérer le post-processing.
   Le ping-pong est une mécanique générique et facile à rater (FBO incomplet, resize, restore, viewport, texture units). Ça a sa place dans glaze. Le choix « grain puis vignette », l'intensité, le toggle, l'export : ça n'a rien de générique, ça reste dans l'app.
   Et surtout : ne transforme pas StateBuffer en pipeline de post-processing. C'est un buffer GPGPU spécialisé. Il doit devenir un consommateur de RenderTargetPair, pas l'inverse.
6. Refactor minimal recommandé
   P0 — correctness, sans changer l'API publique
7. StateBuffer.reinitialize() doit aussi appeler program.reinitialize() sur ses programmes.
8. Ajouter un destroy hook à StateBuffer, comme Program, pour que GpuSurface le retire de #buffers.
9. GpuCanvas doit reset renderedProgramRef sur webglcontextrestored et exposer un onContextRestored.
10. Clarifier l'allocateur d'unités de texture : soit setUniforms reset au début, soit un beginPass/endPass explicite. StateBuffer.step ne doit pas laisser le compteur dériver.
11. Ajouter des tests avec un mock GL pour ces chemins.
    P1 — les primitives qui débloquent le multi-passe
12. Extraire RenderTarget / RenderTargetPair de StateBufferTargets.
13. Ajouter GpuSurface.createRenderTarget, createRenderTargetPair, avec tracking + reinitialize + destroy hook.
14. Modifier Program.render et ShapeBatcher.flush pour accepter un viewport.
15. Ajouter GpuSurface.renderProgramTo(program, target) et isLost.
16. Ajouter GpuCanvas.renderFrame.
    P2 — polish
17. Politique blend/clear par passe.
18. Gestion du changement de DPR.
19. Clamp des tailles aux limites GPU.
20. instanceof WebGLTexture plus robuste.
21. README aligné sur les garanties réelles.
    Conclusion
    Tu n'as pas à réécrire glaze. Les fondations sont bonnes. Les P0 sont petits : quelques lignes et des tests. Le P1 est surtout une extraction de ce qui existe déjà (StateBufferTargets) plus une couture dans GpuCanvas.
    La bonne décision, c'est de mettre le post-processing en pause et de faire ce mini-refactor de glaze. Ensuite, le post-processing dans randomart-ui deviendra simple : un registre d'effets, un store, un shader de grain, et un renderFrame qui compose les passes avec les primitives de glaze.
    Si tu veux, je peux transformer ça en plan de refactor priorisé dans packages/glaze/REFACTOR.md, ou attaquer directement le P0 avec des tests de non-régression.
