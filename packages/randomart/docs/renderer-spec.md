# Spec — Renderer

Version de travail 0.2. Termes définis dans `glossary.md`, décisions dans `architecture.md`, interface avec le shader dans `compiler-spec.md`.

## 1. Responsabilité

Le renderer exécute un shader compilé sur le GPU et en tire une image : à l'écran, ou sous forme de pixels et de PNG. C'est **le seul module qui touche à WebGL**.

Il ne connaît ni la grammaire, ni les expressions, ni la persistance. Il ne reçoit que le résultat du compilateur (`CompiledShader`, dont il n'importe que le type), une taille et une phase.

## 2. Principes

- **L'image et l'affichage sont deux choses.** L'image a sa propre taille (`RenderSize`), indépendante de celle du canvas. L'export ne dépend donc pas de la taille de la fenêtre.
- **Un échec GPU n'est pas une exception.** Un shader aléatoire peut être refusé par un pilote. `setShader` renvoie le résultat et conserve l'ancien programme.
- **Le renderer ne tient pas la boucle d'animation.** Il dessine une image pour une phase donnée ; qui appelle `draw`, et quand, est l'affaire de l'UI.
- **Reconstruisible.** Tout l'état GPU peut être refait à partir du dernier `CompiledShader` et des tailles (perte de contexte, §9).

## 3. Conventions d'image

- **Orientation** : `x` croît vers la droite, `y` croît vers le **haut** de l'image. Le pixel en haut à gauche correspond à `(-1, +1)`.
- **Mapping** : `[-1, 1]²` est étiré sur **toute** l'image, quelle que soit sa forme. Une image 16:9 est donc l'expression étirée, sans bande ni répétition.
- **Couleur** : l'expression donne des valeurs dans `[0, 1]` qui sont écrites **telles quelles** dans une texture RGBA8 et interprétées comme du sRGB. Aucune conversion linéaire.
- **Échantillonnage** : le pixel `(i, j)` d'une image `w × h` est évalué en son **centre** : `v_p = ((i + 0.5)/w × 2 − 1, (j + 0.5)/h × 2 − 1)`, `j` comptant depuis le bas.
- **Taille** : entiers `≥ 1`, bornés par les limites du GPU (`MAX_TEXTURE_SIZE`) et, en pratique, par `8192 × 8192`. Une image de cette taille occupe environ 256 Mo en RGBA8 (et autant pour l'`ImageData` d'un export) : un échec d'allocation est attrapé et relancé comme une erreur claire.

## 4. Interface

```ts
type RenderSize = Brand<{ readonly width: number; readonly height: number }, 'RenderSize'>;
createRenderSize(width: number, height: number): RenderSize   // erreur si non entier ou < 1

type FitMode = 'stretch' | 'contain';

type DisplayOptions = {
  fit?: FitMode;                                    // défaut 'contain'
  background?: readonly [number, number, number];   // chaque composante dans [0, 1], défaut [0, 0, 0]
};

type ShaderError = {
  stage: 'uniform' | 'compile' | 'link';
  message: string;                                  // inclut le journal du pilote, tronqué à 4 000 caractères
};
type SetShaderResult = { ok: true } | { ok: false; error: ShaderError };

type Renderer = {
  setShader(shader: CompiledShader): SetShaderResult;
  setRenderSize(size: RenderSize): void;
  draw(phase: number, display?: DisplayOptions): void;
  readPixels(size: RenderSize, phase: number): ImageData;       // première ligne = haut de l'image
  exportPng(size: RenderSize, phase: number): Promise<Blob>;
  readonly maxRenderSize: number;
  dispose(): void;
};

createRenderer(canvas: HTMLCanvasElement | OffscreenCanvas): Renderer   // erreur si WebGL2 est indisponible

type Rect = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

phaseAt(elapsedMs: number, periodMs: number): number            // pur, dans [0, 1)
containRect(image: RenderSize, canvas: { width: number; height: number }): Rect   // pur
```

Règles :

- **Phase** : `draw`, `readPixels` et `exportPng` exigent une phase finie dans `[0, 1)`, sinon erreur (« accepter moins, promettre plus »). `phaseAt` garantit cette plage.
- **Taille du canvas** : le renderer lit `canvas.width` et `canvas.height` à chaque `draw`. C'est l'UI qui fixe la taille de la zone de dessin (pixel ratio compris).
- **Avant le premier `setShader` réussi**, `draw` ne fait que remplir le canvas avec le fond.
- **`setShader`** valide d'abord les uniforms (étape `uniform`) : en v1, seul `u_phase` est connu. Un uniform inconnu est une erreur. Il compile ensuite, lie, et ne remplace l'ancien programme qu'en cas de succès.

## 5. Fonctionnement interne

### Contexte

`canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' })`. Pas de WebGL2 : le constructeur échoue avec un message clair.

### Les passes

```
passe expression : programme(fragment du compilateur) → texture RGBA8 de taille RenderSize
passe finale     : texture → canvas  (fit, fond)
```

La passe finale est séparée exprès : c'est là que viendra le **post-traitement**, sans toucher au reste (§10).

Pour `readPixels` et `exportPng`, le renderer utilise une **cible temporaire** de la taille demandée, indépendante de l'affichage : un export en 4096² n'altère pas ce qui est à l'écran.

### Vertex shader fixe

Un seul triangle qui couvre l'écran, produit à partir de `gl_VertexID` (aucun tampon), et fournit `v_p`.

```glsl
#version 300 es
out vec2 v_p;
void main() {
  vec2 pos = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  v_p = pos * 2.0 - 1.0;
  gl_Position = vec4(v_p, 0.0, 1.0);
}
```

Sur la zone visible, `v_p` varie bien de `-1` à `+1` ; le renderer n'a rien à faire pour garantir le contrat de plage du compilateur.

### Passe finale

```glsl
#version 300 es
precision highp float;
uniform sampler2D u_image;
in vec2 v_p;
out vec4 o_color;
void main() { o_color = texture(u_image, v_p * 0.5 + 0.5); }
```

Texture en `CLAMP_TO_EDGE`, filtrage `LINEAR`, sans mipmaps (un affichage très réduit peut donc créer de l'aliasing ; acceptable en v1).

### Mise à jour paresseuse

La passe expression n'est refaite que si le shader, la taille ou la phase ont changé. La phase est ignorée si le shader n'est pas animé (`animated: false`). Une image statique ne coûte donc qu'une passe finale quand la fenêtre change de taille.

## 6. Placement à l'affichage

- `stretch` : l'image occupe tout le canvas (éventuellement déformée).
- `contain` : l'image garde son rapport largeur/hauteur et est centrée. Le reste du canvas est rempli avec `background`.

```ts
containRect(image, canvas): Rect   // { x, y, width, height } en pixels entiers
```

`width` et `height` sont arrondis à l'entier inférieur (minimum 1 si le canvas n'est pas vide ; si le canvas est vide, rien n'est dessiné), le rectangle est centré, et `x`, `y` valent `floor((canvas − taille) / 2)`. Le canvas est d'abord vidé avec le fond, puis la passe finale n'est dessinée que dans ce rectangle (`gl.viewport`).

## 7. Phase et animation

```ts
phaseAt(elapsedMs, periodMs) = (((elapsedMs % periodMs) + periodMs) % periodMs) / periodMs   // modulo mathématique
```

- `periodMs` est la **durée de boucle** (finie et `> 0`, sinon erreur). Valeur par défaut proposée : `8000`.
- La durée de boucle est un paramètre de rendu qui fera partie de l'œuvre (module `artwork`). Pour un contrôle de lecture, c'est l'UI qui possède l'instant courant, l'état lecture/pause, et appelle `draw(phaseAt(...))` à chaque image d'animation.
- Un `elapsedMs` négatif est ramené dans la plage (modulo mathématique, pas celui de JavaScript). Un `elapsedMs` non fini est une erreur.
- Filet : si l'arrondi flottant donnait un résultat `≥ 1`, `phaseAt` renvoie `0`. La plage `[0, 1)` est donc garantie, comme `draw` l'exige.

## 8. Export

- `readPixels(size, phase)` : rend dans une cible temporaire de `size`, lit les pixels, **retourne les lignes** (le GL les donne de bas en haut) et renvoie un `ImageData`. C'est la primitive sur laquelle reposent les autres exports.
- `exportPng(size, phase)` : `readPixels`, puis encodage PNG dans un canvas 2D (`OffscreenCanvas` si disponible). Le PNG contient les valeurs brutes sRGB ; pas de profil de couleur.
- **Limites** : une taille qui dépasse `maxRenderSize` (ou `8192` de côté) est refusée avec une erreur claire.
- **GIF et vidéo** (plus tard) : ils reposent sur `readPixels` appelé pour chaque phase `k / N`, donc sur la boucle parfaite. Rien à changer dans le renderer.

## 9. Robustesse

- **Perte de contexte** (`webglcontextlost`) : les appels de dessin sont ignorés ; on appelle `preventDefault()` pour autoriser la restauration. À `webglcontextrestored`, le renderer recrée les programmes, textures et cibles à partir du dernier `CompiledShader` et de la taille courante, puis redessine à la prochaine demande.
- **Shaders lourds** : un shader coûteux, surtout à grande taille, peut dépasser le délai du pilote et provoquer une perte de contexte. Le contrôle de la taille (limites, §8) réduit le risque. Un export par **tuiles** est la réponse prévue plus tard (§10).
- **Contexte perdu pendant `setShader`** : `getShaderParameter` / `getProgramParameter` peuvent renvoyer `null` ; le renderer renvoie alors `ok: false` à l'étape `compile` (ou `link`) avec un message qui le dit, sans lever d'exception.
- **Compilation** : synchrone en v1. Elle peut bloquer l'interface quelques instants pour un gros shader.
- **Libération** : `dispose()` supprime programmes, textures, cibles, et retire les écouteurs ; il est idempotent. Après `dispose`, tout autre appel lève une erreur.

## 10. Prévu mais hors v1

- **Post-traitement** : une liste de passes entre la passe expression et la passe finale (texture A → texture B…). Le point d'insertion existe déjà.
- **Export par tuiles** : le vertex shader recevrait un rectangle `u_tile` pour calculer `v_p` ; le shader de l'expression ne change pas. Utile pour les très grandes images.
- **Cible plus précise** : RGBA16F (nécessite `EXT_color_buffer_float`) pour limiter les bandes dans les dégradés.
- **Compilation asynchrone** avec `KHR_parallel_shader_compile`, quand l'exploration lancera beaucoup de compilations à la suite.

## 11. Organisation du code

```
renderer/
  types.ts        // RenderSize, FitMode, DisplayOptions, ShaderError, SetShaderResult, Renderer
  size.ts         // createRenderSize
  phase.ts        // phaseAt
  layout.ts       // containRect
  shaders.ts      // vertex shader fixe, fragment de la passe finale
  gl.ts           // compilation, liaison, textures, cibles
  renderer.ts     // createRenderer
  export.ts       // inversion des lignes, encodage PNG
  index.ts
```

`phase.ts`, `layout.ts`, `size.ts` et l'inversion des lignes sont du code **pur**, testable sans GPU.

## 12. Tests

**Sans GPU**

1. `phaseAt` : valeurs aux bornes, boucle (`0` et la durée donnent la même phase), durée invalide, temps négatif ou non fini, résultat toujours `< 1` (y compris pour des valeurs juste sous un multiple de la durée).
2. `containRect` : image plus large ou plus haute que le canvas, canvas carré, arrondis, rectangle centré.
3. `createRenderSize` : rejette les non-entiers et les valeurs `< 1`.
4. Inversion des lignes : sur un petit tableau écrit à la main.

**Navigateur**

5. **Orientation et valeurs** : avec `r = x`, `g = y`, `b = const 0` en 4×4, la ligne du haut a `g` élevé et la colonne de gauche a `r` faible. Valeurs attendues, avec `round(255 × (0.5 + 0.5·v))` et `v` au centre des pixels (`±0.25`, `±0.75`) : colonnes `r = 32, 96, 159, 223` ; lignes de haut en bas `g = 223, 159, 96, 32` ; `b = 128` (tolérance ±1 sur chaque valeur).
6. **Phase** : avec `tsin`, la phase `0.25` donne la valeur maximale et la phase `0` la valeur milieu.
7. **Erreurs** : un shader invalide donne `ok: false` et conserve l'image précédente ; un uniform inconnu donne l'étape `uniform`.
8. **Taille** : une taille au-dessus de la limite est refusée.
9. **PNG** : l'en-tête est valide, les dimensions sont celles demandées, et les pixels décodés égalent ceux de `readPixels`.
10. **Perte de contexte** (via l'extension `WEBGL_lose_context`) : après perte puis restauration, le dessin suivant redonne la même image.
11. **Mise à jour paresseuse** : un `draw` répété à phase identique, ou à phase différente avec un shader statique, ne relance pas la passe expression (compteur interne de passes).
12. **Libération** : `dispose` est idempotent, et tout autre appel après lui lève une erreur.
13. **Fuzz de rendu** : les mille shaders du fuzzing du compilateur sont rendus en 64×64 sans erreur GL (`gl.getError() === NO_ERROR`).

## 13. Décisions prises

- **Indépendant de toute librairie graphique** (D36). `createRenderer` prend un canvas brut ; la gestion du pixel ratio et de la taille du canvas est faite par l'UI. Si une librairie doit s'intégrer plus tard, elle fournira le canvas.
- **Défauts** : taille de rendu `1024 × 1024`, boucle `8000 ms`, fond noir. Ces valeurs vivent dans le module `artwork` (taille, boucle) et l'UI (fond).
- **Réduction de résolution pendant l'animation** : fonction de l'UI, pas du renderer (D36).
- **Compilation synchrone** en v1 ; asynchrone (§10) quand l'exploration lancera beaucoup de compilations.
