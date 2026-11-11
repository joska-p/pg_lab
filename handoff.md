Handoff — Aligner randomart sur le contrat GLSL Shadertoy-like

Objectif

Faire en sorte que le shader généré par randomart-core soit directement copiable-collable dans l'éditeur de Shadertoy (ou un hôte respectant le même
contrat) sans modification manuelle. On ne cherche pas à « copier » Shadertoy, mais à s'aligner sur un contrat éprouvé.

Ce n'est pas une option de compilation à ajouter. C'est un changement du contrat par défaut d'émission.

────────────────────────────────────────────────────────────────────────────────

Contrat actuel (randomart → glaze)

Émis par packages/randomart-core/src/emit.ts :

```glsl
  #version 300 es
  precision highp float;

  in vec2 vUv;                    // fourni par le vertex shader de glaze
  out vec4 o_color;               // sortie

  uniform float u_phase;          // injecté manuellement par RandomArtCanvas

  const float PI = ...;
  // fonctions ra_* (ra_fold2, ra_sqr, ra_oklch, etc.)

  void main() {
      vec2 v_p = vUv * 2.0 - 1.0;
      // ... DAG ...
      o_color = vec4(ra_<espace>(vec3(r, g, b)), 1.0);
  }
```

Hôte actuel (glaze) :

- Vertex shader par défaut FULLSCREEN_TRIANGLE fournit vUv (0..1).
- createStandardUniformValues injecte u_resolution, u_time, u_clockTime, u_mouse, u_aspect, u_dpr, u_camera.
- RandomArtCanvas injecte u_phase via le callback uniforms.

────────────────────────────────────────────────────────────────────────────────

Contrat cible (Shadertoy-like)

```glsl
  #version 300 es
  precision highp float;

  uniform vec3 iResolution;   // fourni par l'hôte (glaze)
  uniform float iTime;        // fourni par l'hôte (glaze)

  out vec4 fragColor;         // sortie

  const float PI = ...;
  // fonctions ra_* (inchangées)

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
      // gl_FragCoord est built-in GLSL ES 3.00, pas besoin de le passer depuis le vertex
      vec2 v_p = (fragCoord / iResolution.xy) * 2.0 - 1.0;
      // ... DAG (inchangé) ...
      fragColor = vec4(ra_<espace>(vec3(r, g, b)), 1.0);
  }
```

────────────────────────────────────────────────────────────────────────────────

### Référence : uniforms natifs de Shadertoy

Voici la liste complète des uniforms que Shadertoy fournit nativement. Glaze n'a probablement pas besoin de tous les fournir, mais c'est une bonne référence pour comprendre quelles données sont utiles dans un contexte de shader temps-réel. Il y a sûrement une bonne raison pour laquelle Shadertoy expose chacun d'eux.

```glsl
uniform vec3      iResolution;           // viewport resolution (in pixels)
uniform float     iTime;                 // shader playback time (in seconds)
uniform float     iTimeDelta;            // render time (in seconds)
uniform float     iFrameRate;            // shader frame rate (in frames per seconds)
uniform int       iFrame;                // shader playback frame
uniform float     iChannelTime[4];       // channel playback time (in seconds)
uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
uniform samplerXX iChannel0..3;          // input channel. XX = 2D/Cube
uniform vec4      iDate;                 // (year, month, day, time in seconds)
uniform float     iSampleRate;           // sound sample rate (i.e., 44100)
```

Parmi ceux-ci, `iResolution` et `iTime` sont les seuls strictement nécessaires pour aligner le contrat randomart sur Shadertoy. Les autres (`iMouse`, `iDate`, `iFrame`, `iChannel*`, etc.) pourraient être ajoutés ultérieurement si randomart en a besoin.

────────────────────────────────────────────────────────────────────────────────

### Correspondances exactes

┌────────────────────────────┬───────────────────────────────────────────────────────┬──────────────┐
│ Élément actuel │ Contrat cible │ Qui fournit │
├────────────────────────────┼───────────────────────────────────────────────────────┼──────────────┤
│ in vec2 vUv │ gl_FragCoord (built-in) │ GLSL ES 3.00 │
├────────────────────────────┼───────────────────────────────────────────────────────┼──────────────┤
│ uniform float u_phase │ uniform float iTime │ glaze │
├────────────────────────────┼───────────────────────────────────────────────────────┼──────────────┤
│ out vec4 o_color │ out vec4 fragColor │ shader │
├────────────────────────────┼───────────────────────────────────────────────────────┼──────────────┤
│ void main() │ void mainImage(out vec4 fragColor, in vec2 fragCoord) │ shader │
├────────────────────────────┼───────────────────────────────────────────────────────┼──────────────┤
│ vec2 v_p = vUv * 2.0 - 1.0 │ vec2 v_p = (fragCoord / iResolution.xy) * 2.0 - 1.0 │ shader │
├────────────────────────────┼───────────────────────────────────────────────────────┼──────────────┤
│ u_resolution (device px) │ iResolution (vec3 x,y,1.0) │ glaze │
└────────────────────────────┴───────────────────────────────────────────────────────┴──────────────┘

────────────────────────────────────────────────────────────────────────────────

Décisions architecturales (figées pour cohérence)

1.  Pas d'option de compilation (target: 'shadertoy'). Le contrat par défaut de compile() devient le contrat Shadertoy-like.
2.  Le cœur du générateur ne bouge pas : lower.ts, emitDag, les fonctions ra_* dans glsl.ts, et les color spaces dans colors.ts restent identiques. Seuls
    les bords changent (header, point d'entrée, uniforms, coordonnées, sortie).
3.  iTime remplace u_phase. La sémantique change (temps absolu vs phase bouclée 0..1 sur une durée). C'est assumé : un shader généré pour randomart
    continuera d'animer avec iTime, mais sans boucle temporelle intégrée.
4.  glaze fournit iResolution et iTime via createStandardUniformValues. u_time et u_resolution peuvent être conservés en parallèle pour ne pas casser
    d'autres utilisateurs de glaze, mais iResolution/iTime doivent exister.
5.  RandomArtCanvas n'injecte plus u_phase (ou le retire du callback uniforms). Le temps vient de glaze.
6.  Vertex shader FULLSCREEN_TRIANGLE : vUv devient optionnel/inutile. On peut le garder pour la rétrocompatibilité avec d'autres usages de glaze, ou le
    supprimer si aucun autre package n'en dépend.

────────────────────────────────────────────────────────────────────────────────

Fichiers concernés et rôle dans le refactor

### packages/randomart-core/ (émission du GLSL)

┌──────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Fichier │ Changement attendu │
├──────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ src/emit.ts │ Changer SHADER_HEADER (ou en ajouter un), remplacer void main() par void mainImage(...), remplacer out vec4 o_color │
│ │ par out vec4 fragColor, remplacer in vec2 vUv + uniform float u_phase par les uniforms cibles, adapter le calcul de │
│ │ v_p. │
├──────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ src/glsl.ts │ SHADER_HEADER actuel contient in vec2 vUv, out vec4 o_color, uniform float u_phase. À réécrire pour le nouveau │
│ │ contrat. Les fonctions ra_fold2, ra_sqr ne bougent pas. │
├──────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ src/colors.ts │ Aucun changement (les fonctions ra_* sont déjà du GLSL pur). │
├──────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ src/lower.ts │ Aucun changement (DAG indépendant du contrat de sortie). │
├──────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ src/emit.test.ts / │ Les snapshots vont changer. À mettre à jour après modification. │
│ emit.golden.test.ts │ │
└──────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

### packages/glaze/ (hôte GPU)

┌──────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Fichier │ Changement attendu │
├──────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ src/gpu/shader/setUniforms.ts │ createStandardUniformValues doit retourner iResolution (vec3) et iTime (float). │
├──────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ src/gpu/shader/compileProgram.ts │ FULLSCREEN_TRIANGLE : vUv optionnel. À évaluer si d'autres packages l'utilisent. │
├──────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ src/gpu/GpuSurface.ts │ renderProgram appelle déjà createStandardUniformValues. Pas de changement structurel si la fonction ci-dessus est │
│ │ modifiée. Vérifier l'unité de iResolution (CSS px vs device px). │
└──────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

### packages/randomart-ui/ (pilotage)

┌──────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────┐
│ Fichier │ Changement attendu │
├──────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ src/components/RandomArtCanvas.tsx │ Retirer u_phase du callback uniforms. iTime/iResolution viennent de glaze. │
├──────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ src/components/Scene.tsx │ Aucun changement structurel (passe fragmentShader et animated). │
├──────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ src/stores/artworkStore.ts │ Aucun changement (useCompiledShader retourne source et animated). │
├──────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│ src/components/controls/ShaderSource.tsx │ Aucun changement (affiche juste la chaîne). │
└──────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────────────────────

Plan de sessions suggéré

Chaque session doit commencer par sa propre analyse (lecture des fichiers concernés, exécution des tests, lecture des snapshots) avant de toucher au
code.

### Session 1 — Audit et contrat figé (analyse uniquement, zéro modification)

- Lire emit.ts, glsl.ts, colors.ts, lower.ts.
- Lire glaze/src/gpu/shader/setUniforms.ts, compileProgram.ts, GpuSurface.ts.
- Lire randomart-ui/src/components/RandomArtCanvas.tsx, Scene.tsx.
- Exécuter les tests : vp check ou vp test sur randomart-core et glaze.
- Capturer un snapshot du shader généré actuellement (ex: preset default, seed 42) pour avoir une référence avant/après.
- Livrable : confirmation que le contrat actuel correspond à l'analyse ci-dessus, et liste exacte des chaînes à remplacer dans emit.ts/glsl.ts.

### Session 2 — randomart-core : nouveau contrat d'émission

- Modifier glsl.ts : nouveau SHADER_HEADER (uniforms iResolution, iTime; sortie fragColor; point d'entrée mainImage).
- Modifier emit.ts : adapter la génération de main() → mainImage(...), o_color → fragColor, vUv → gl_FragCoord / iResolution.xy.
- Mettre à jour les tests et snapshots (emit.test.ts, emit.golden.test.ts).
- Vérifier que le shader généré compile mentalement dans un contexte Shadertoy (pas de vUv, pas de u_phase).
- Livrable : un compiledShader.source qui ressemble à du GLSL Shadertoy valide.

### Session 3 — glaze : fournir iResolution et iTime

- Modifier setUniforms.ts : ajouter iResolution et iTime dans createStandardUniformValues.
- Décider de l'unité de iResolution (CSS pixels vs device pixels). Vérifier ce que GpuSurface fournit déjà (width/height en CSS px, dpr séparé).
- Vérifier que compileProgram.ts / FULLSCREEN_TRIANGLE ne casse pas (garder vUv si nécessaire pour la rétrocompat).
- Vérifier qu'aucun autre package utilisant glaze ne dépend exclusivement de u_time/u_resolution (grep dans packages/).
- Livrable : glaze injecte iResolution et iTime sous ces noms exacts.

### Session 4 — randomart-ui : retirer le pilotage manuel du temps

- Modifier RandomArtCanvas.tsx : retirer u_phase du callback uniforms (ou le garder si un autre usage l'exige, mais le shader par défaut ne doit plus en
  dépendre).
- Vérifier que Scene.tsx et artworkStore.ts n'ont pas besoin de changement.
- Livrable : l'app affiche le shader généré avec le nouveau contrat, animé par iTime fourni par glaze.

### Session 5 — Intégration, tests et vérification

- Exécuter vp check --fix sur l'ensemble du monorepo (ou au moins randomart-core, glaze, randomart-ui).
- Tester manuellement : copier le compiledShader.source affiché dans ShaderSource.tsx et le coller dans shadertoy.com/new. Vérifier qu'il s'affiche et
  anime.
- Vérifier qu'aucun snapshot n'est oublié.
- Livrable : preuve que le shader généré par l'app tourne sur Shadertoy sans modification.

────────────────────────────────────────────────────────────────────────────────

Points de vigilance / risques

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬────────────┐
│ Risque │ Mitigation │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────┤
│ iTime ne boucle pas contrairement à u_phase (0..1 sur duration). Les shaders utilisant sin(2.0*PI*... * u_phase) animeront mais ne │ │
│ boucleront pas sur la durée de l'appli. C'est assumé et documenté. │ │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────┤
│ Unité de iResolution. Shadertoy attend généralement la résolution d'affichage. Glaze fournit width/height en CSS px et dpr séparément. │ │
│ À clarifier dans setUniforms.ts. │ │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────┤
│ Autres utilisateurs de glaze. glaze3d, mol-demo, etc. peuvent dépendre de u_time/u_resolution. Faire un grep avant de renommer. │ │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────┤
│ Snapshots dorés. emit.golden.test.ts a des snapshots qui vont tous changer. Prévoir de les régénérer. │ │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────┤
│ vUv dans le vertex shader. Si on supprime vUv de FULLSCREEN_TRIANGLE, d'autres shaders de glaze pourraient casser. À vérifier par grep. │ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────────┘

────────────────────────────────────────────────────────────────────────────────

Commandes utiles

```bash
  # Depuis la racine du monorepo
  vp check                                    # format, lint, type-check global
  vp -C packages/randomart-ui check           # vérification ciblée
  vp -C packages/randomart-core test          # tests du core (inclut les snapshots)
  vp -C packages/glaze test                   # tests de glaze
```

────────────────────────────────────────────────────────────────────────────────

État actuel du repo (à la date de ce handoff)

- Aucun fichier n'a été modifié pour ce refactor.
- Le dev server de randomart-ui tourne (selon l'utilisateur).
- Le contrat actuel est exactement celui analysé ci-dessus (vérifié par lecture des sources).

────────────────────────────────────────────────────────────────────────────────

Ce handoff est conçu pour que le prochain agent puisse démarrer la Session 1 sans avoir à re-élaborer le contrat ni les décisions. À chaque session, il
est attendu que l'agent relise les fichiers concernés et confirme l'analyse avant de coder.
