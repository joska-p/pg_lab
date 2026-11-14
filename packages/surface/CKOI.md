Voici une analyse détaillée de ce qu'est surface, de ce dont automa a besoin, et des enseignements tirés de glaze pour concevoir les ajouts au
compte-gouttes sans reproduire les erreurs passées.
──────

### 1. Où en est surface aujourd'hui (après art-canvas)

surface a été conçu avec une approche beaucoup plus ciblée et épurée que glaze :

• Convention Shadertoy native : Injection automatique de iResolution, iTime, iTimeDelta, iFrame, iMouse. Les shaders peuvent utiliser soit
mainImage(out vec4, in vec2) soit void main().
• Pipeline WebGL2 propre : Plein écran via un triangle unique (gl_VertexID), gestion automatique du DPR et du redimensionnement, restauration de
contexte (webglcontextrestored).
• Composant React robuste (SurfaceCanvas) : Remplacement de shader à chaud sans clignotement ni crash (conservation du dernier programme valide en
cas d'erreur de compilation), synchronisation automatique avec un store global de lecture (usePlayback).
• Séparation saine : Pas de types "brandés" à outrance (PositiveNumber, NonNegativeSeconds, etc.), pas d'usine à gaz d'observables ou d'architecture
monolithique.
──────

### 2. Ce que fait automa actuellement avec glaze

automa est un simulateur d'automates cellulaires 2D avec rendu et calcul sur GPU. Il sollicite 5 axes majeurs :

    ┌────────────────────────────────────────────────────────┐
    │                   packages/automa                      │
    └────────────────────────────────────────────────────────┘
              │                   │                 │
              ▼                   ▼                 ▼
       1. Simulation GPU     2. Affichage      3. Navigation & Saisie
       ─────────────────     ────────────      ──────────────────────
       • Ping-Pong FBO       • Shader mesh     • Caméra 2D (Pan / Zoom)
       • sim-step.frag       • Sampler2D       • Coordonnées screenToWorld
       • gpu-paint.frag        (texture grille)• Pinceau / Paint drag
       • StateBuffer         • Palette d'états • Contrôles molette/middle

1. Simulation GPGPU (Ping-Pong) :
   SimulationEngine utilise StateBuffer de glaze. Deux shaders hors-écran font évoluer la grille :
   • sim-step.frag (règles de voisinage, accumulation d'âge/chaleur)
   • gpu-paint.frag (peinture d'une cellule ou injection d'une créature)
   Ces passes s'exécutent sur un duo de textures/FBO inversées à chaque pas (step()).
2. Échantillonnage de texture (sampler2D) sur le canvas principal :
   Le shader d'affichage (cell-mesh.frag) reçoit la texture active via engine.getDisplayTexture() et l'échantillonne via texelFetch(u_grid, ...).
3. Caméra 2D & Interaction Pointeur (Picking / Peinture) :
   • Zoom et pan interactifs (pan via clic molette, zoom centré sur la souris via la molette).
   • Projection bidirectionnelle : les clics souris sont convertis en coordonnées cellules (eventToGridPoint -> screenToWorld -> getCellAtWorld), et
   le shader fait la transformation inverse pour projeter la texture de grille à l'écran.
4. Boucle de frame & Playback :
   La simulation avance au rythme du deltaTime du rendu via tickSimulation(surface.deltaTime) branché sur le onFrame de la surface.
5. Déchets / Over-engineering résiduel hérité de glaze :
   automa importe encore des wrappers cosmétiques : createCssColor, CssColor, msToSeconds, Point2D, NonNegativeSeconds.
   ──────

### 3. Les manques actuels dans surface pour accueillir automa

Feature requise par automa │ Présent dans surface ? │ Diagnostic
─────────────────────────────────────────────┼────────────────────────┼──────────────────────────────────────────────────────────────────────────────
Support de WebGLTexture dans setUniforms │ ❌ Non │ setUniforms ne gère SAMPLER_2D qu'avec des entiers (number), et crasherait
│ │ si on lui passe une WebGLTexture (tente un new Float32Array). Il n'y a pas
│ │ d'activation d'unité de texture (gl.activeTexture) ni de gl.bindTexture.
Passes Offscreen / FBO / Ping-Pong │ ❌ Non │ surface ne sait rendre que directement sur le canvas écran par défaut. Il
│ │ n'y a pas d'abstraction de framebuffer/texture cible pour le GPGPU.
Hook / Prop onFrame dans SurfaceCanvas │ ⚠ Partiel │ Surface.onFrame existe dans le cœur, mais SurfaceCanvasProps ne l'expose pas
│ │ directement (oblige à passer par onMount).
Caméra 2D (Pan & Zoom) │ ❌ Non │ Complètement absent de surface.
Gestion d'interactions utilisateur avancées │ ⚠ Minimal │ surface écoute seulement pointerdown/move/up pour nourrir iMouse. Il
│ │ n'expose pas d'écouteurs custom ou de transmission des events du <canvas>.
──────

### 4. Analyse ergonomique & Séparation des responsabilités

C'est ici qu'il faut être vigilant pour ne pas réintroduire les erreurs de glaze :

#### Erreur de glaze n°1 : Le composant canvas "fourre-tout"

• Dans glaze : GpuCanvas gérait tout en bloc : l'horloge, les gestes (PanGesture, PinchGesture), la caméra 2D, les options de zoom, l'adaptateur
d'interactions, etc. Résultat : une complexité folle, et des effets de bord absurdes (ex: définir onStart désactivait silencieusement le pan par
défaut !).
• Vision recommandée pour surface :
• SurfaceCanvas doit rester un simple conteneur WebGL2 réactif.
• Pour les interactions, il suffit que SurfaceCanvas propage les props standards HTML du canvas (React.CanvasHTMLAttributes<HTMLCanvasElement>
comme onPointerDown, onWheel, etc.) ou fournisse une ref.
• La caméra 2D peut être un utilitaire pur (ex: une classe ou un hook useCamera2D) indépendant du moteur de rendu, qui fournit simplement camera.
x, camera.y, camera.zoom et la projection screenToWorld / worldToScreen.

#### Erreur de glaze n°2 : Les types brandés et les utilitaires triviaux

• createCssColor('#ff0000') ou msToSeconds(50) : du bruit inutile. Dans surface et automa, de simples strings hex et des nombres en millisecondes ou
secondes suffisent largement.

#### Comment intégrer les fonctionnalités nécessaires dans surface ?

1. Binding automatique des Textures (sampler2D) :
   • Évolution naturelle et indispensable de setUniforms.ts.
   • Si une valeur passée dans uniforms est une WebGLTexture, setUniforms attribue une texture unit (TEXTURE0 + unit), binde la texture, et appelle
   gl.uniform1i(location, unit).
   • On peut aussi supporter la convention Shadertoy (iChannel0, iChannel1, etc.).
2. Rendu Offscreen & Ping-Pong (GPGPU) :
   • automa en a un besoin critique pour calculer ses générations sur GPU.
   • Comment garder cela minimal et propre ?
   • Option A : Un objet léger RenderTarget / RenderTargetPair (ou PingPong) dans @repo/surface/gpu qui encapsule la création des textures RGBA
   et du Framebuffer (FBO) avec une méthode simple swap() et step(program, uniforms).
   • Option B : Laisser le moteur de simulation posséder ses WebGLTextures brutes et n'ajouter à surface que les primitives nécessaires
   (createFramebuffer, createTexture).
   (L'option A avec un RenderTargetPair très épuré, sans l'armada de types de glaze, semble le juste équilibre).

3. Exposition de onFrame sur SurfaceCanvas :
   • Ajouter simplement onFrame?: (surface: Surface) => void dans SurfaceCanvasProps.
4. Caméra 2D :
   • Est-ce que la caméra 2D a sa place dans le core de surface ?
   • Recommandation : la sortir du composant canvas. Si on crée un module surface/camera ou useCamera2D, il est optionnel, découplé du shader et du
   canvas, et réutilisable aussi bien pour de la 2D que pour du canvas 2D CPU ou du SVG.
