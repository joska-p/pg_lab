# glaze3d — Spécifications

Ce document définit l'API et les décisions de conception pour chaque brique
identifiée dans l'objectif et les use cases. Chaque section : responsabilité,
API proposée, décisions de conception (avec la raison), hors scope pour
cette itération, points ouverts (à trancher pendant l'implémentation, pas
avant).

Convention générale : coordonnées main droite (right-handed), comme
three.js — ça évite d'avoir à retourner les données `.mol`/`.sdf` ou les
calculs de `drawPattern()` qui sont écrits en implicite three.js-compatible.
Unités : sans dimension physique imposée (la démo travaille directement en
angströms, glaze3d n'a pas d'avis là-dessus).

---

## 1. Maths

**Responsabilité** : Vector3, Quaternion, Matrix4 — juste ce qu'utilise la
démo (cf. use case B3, B2), pas une lib d'algèbre générale.

**API**

```ts
class Vec3 {
  x: number;
  y: number;
  z: number;
  constructor(x = 0, y = 0, z = 0);
  static fromArray(a: [number, number, number]): Vec3;
  clone(): Vec3;
  copy(v: Vec3): this;
  add(v: Vec3): this;
  sub(v: Vec3): this;
  static subVectors(a: Vec3, b: Vec3): Vec3;
  lerp(target: Vec3, t: number): this;
  length(): number;
  normalize(): this;
}

class Quat {
  x: number;
  y: number;
  z: number;
  w: number;
  constructor(x = 0, y = 0, z = 0, w = 1);
  copy(q: Quat): this;
  setFromUnitVectors(from: Vec3, to: Vec3): this;
  angleTo(q: Quat): number;
  // multiply / slerp : ajoutés seulement si les controls (section 7) en
  // ont besoin à l'implémentation — pas anticipés ici.
}

class Mat4 {
  elements: Float32Array; // longueur 16, column-major (convention GL)
  static perspective(fovYRadians: number, aspect: number, near: number, far: number): Mat4;
  static identity(): Mat4;
  compose(position: Vec3, rotation: Quat, scale?: Vec3): this; // construit la matrice monde locale
  multiply(m: Mat4): this;
  invert(): this; // nécessaire pour matrixWorldInverse (use case A6/B3)
  clone(): Mat4;
}
```

**Décisions**

- Mutation en place (`this`) pour les méthodes qui modifient l'objet
  (cohérent avec three.js, évite les allocations par frame dans la boucle
  de rendu) ; les opérations binaires statiques (`subVectors`, `fromArray`)
  retournent une nouvelle instance.
- `Mat4.elements` exposé publiquement en `Float32Array` : nécessaire pour
  A6, où un système externe (le shader raw) doit pouvoir lire
  `matrixWorldInverse.elements` directement, exactement comme dans
  `mol-demo.js:413-420`.

**Hors scope** : Matrix3, Euler angles, opérations SIMD/optimisées, tout ce
qui n'est pas consommé par la démo.

**Points ouverts** : `Quat.multiply` sera nécessaire si l'implémentation de
l'orbit control (section 7) construit une orientation par composition plutôt
que par angles sphériques directs — à voir au moment d'écrire les controls.

---

## 2. Scene graph

**Responsabilité** : transforms hiérarchiques, un objet peut être attaché à
un autre et hériter de sa transform (use case B2 — lumière attachée à la
caméra).

**API**

```ts
class Object3D {
  position: Vec3;
  quaternion: Quat;
  scale: Vec3;
  parent: Object3D | null;
  children: Object3D[];

  matrix: Mat4; // transform locale
  matrixWorld: Mat4; // transform accumulée depuis la racine

  add(child: Object3D): this;
  remove(child: Object3D): this;
  clear(): this; // vide children (use case A4 : remplacer une molécule)

  updateMatrix(): void; // recalcule `matrix` depuis position/quaternion/scale
  updateMatrixWorld(force?: boolean): void; // propage récursivement aux enfants
}

class Group extends Object3D {}
class Mesh extends Object3D {
  geometry: Geometry;
  material: Material;
}
class Light extends Object3D {
  color: [number, number, number];
  intensity: number;
}
class AmbientLight extends Light {}
class DirectionalLight extends Light {} // la direction = orientation de l'objet, pas un champ séparé
```

**Décisions**

- `Scene` n'est qu'un `Group` racine, pas une classe à part — pas de
  comportement spécial identifié qui justifierait une classe séparée
  (cohérent avec le non-objectif "pas de sur-généralisation").
- `updateMatrixWorld()` est appelé explicitement par le renderer avant
  chaque `render()`, pas automatiquement à chaque mutation — évite de
  recalculer une hiérarchie entière à chaque `position.x = ...`
  (comportement identique à three.js).
- Une lumière attachée à une caméra (`camera.add(light)`) doit voir sa
  `matrixWorld` calculée en tenant compte de celle de la caméra — c'est le
  test décisif de cette section (cf. objectif : "ne doit pas être un angle
  mort de l'API").

**Hors scope** : layers/visibility flags, `traverse()`, événements
`added`/`removed`, clonage profond d'un sous-arbre.

**Points ouverts** : représentation de `DirectionalLight` — three.js utilise
`.position` comme direction implicite (le vecteur vers l'origine). À
documenter clairement dans le code pour ne pas piéger un futur usage.

---

## 3. Caméra

**Responsabilité** : caméra perspective, matrices projection + vue exposées
publiquement (use case B3, A6).

**API**

```ts
class PerspectiveCamera extends Object3D {
  fov: number; // degrés, converti en radians en interne
  aspect: number;
  near: number;
  far: number;

  projectionMatrix: Mat4;
  matrixWorldInverse: Mat4; // = inverse de matrixWorld, recalculée par updateMatrixWorld()

  updateProjectionMatrix(): void; // à appeler après changement de fov/aspect/near/far
}
```

**Décisions**

- `matrixWorldInverse` est un champ mis à jour automatiquement dans
  `updateMatrixWorld()` (override de la méthode `Object3D`), pas calculée à
  la demande — c'est exactement le pattern de `mol-demo.js:413` qui lit
  `camera.matrixWorldInverse.elements` chaque frame dans `drawPattern()`
  sans appel explicite de recalcul.
- Pas de `lookAt()` dans cette itération : la démo positionne la caméra une
  fois (`camera.position.set(4,3,11)`) et laisse l'orbit control gérer la
  suite — `lookAt()` n'est pas un besoin actif (cf. use case A6, B8 : pas de
  sur-ingénierie sans second cas d'usage).

**Hors scope** : caméra orthographique, frustum culling, plusieurs viewports.

**Points ouverts** : aucun à ce stade — cette section est la plus directement
dérivée de la démo, peu d'ambiguïté.

---

## 4. Géométries

**Responsabilité** : générer sphère et cylindre (vertices, normales,
indices) — use case B4.

**API**

```ts
interface GeometryData {
  positions: Float32Array; // 3 floats / vertex
  normals: Float32Array; // 3 floats / vertex
  indices: Uint16Array | Uint32Array;
}

class Geometry {
  data: GeometryData;
}

class SphereGeometry extends Geometry {
  constructor(radius: number, widthSegments: number, heightSegments: number);
}

class CylinderGeometry extends Geometry {
  constructor(radiusTop: number, radiusBottom: number, height: number, radialSegments: number);
}
```

**Décisions**

- Buffers non entrelacés (positions/normales séparés) plutôt qu'entrelacés :
  plus simple à générer et à déboguer, la démo n'a pas de contrainte de
  perf qui justifierait l'entrelacement (peu d'atomes, ~60 max).
- `Uint16Array` par défaut, `Uint32Array` seulement si le nombre de vertices
  dépasse 65536 (ne devrait jamais arriver ici, mais autant ne pas fixer une
  limite silencieuse).

**Hors scope** : UV mapping (pas de texture dans cette itération), géométrie
procédurale générique, tore/cube/plan (ajoutés seulement si un besoin réel
apparaît — cf. non-objectifs).

**Points ouverts** : aucun.

---

## 5. Shading / matériaux

**Responsabilité** : matériau Phong (ambient + diffuse + specular),
plusieurs lumières dans un seul shader — use case B5.

**API**

```ts
class Material {
  // classe de base, volontairement peu de comportement commun
}

class PhongMaterial extends Material {
  color: [number, number, number];
  shininess: number;
  specular: [number, number, number];
}
```

Le renderer (section 6) est responsable de générer/compiler le shader Phong
en fonction du nombre et du type de lumières présentes dans la scène — pas
le matériau lui-même, pour éviter qu'un `PhongMaterial` ait besoin de
connaître la scène qui l'entoure.

**Décisions**

- Un seul type de matériau dans cette itération (`PhongMaterial`), pas de
  hiérarchie `Material` riche — cohérent avec le non-objectif "pas de PBR".
- Nombre de lumières supportées : fixé à une constante compile-time
  raisonnable (ex. 1 ambient + 4 directional), pas de système dynamique de
  lights illimité — la démo en utilise 1 ambient + 3 directional, une petite
  marge suffit.
- Échappatoire conservée (cf. use case B5, dernière phrase) : possibilité de
  fournir un shader custom en GLSL pour un mesh donné, au cas où
  `PhongMaterial` ne suffit pas à un usage futur — même logique que
  `createProgram()` dans glaze.

**Hors scope** : normal mapping, shadow mapping, environment mapping,
matériaux physiques (metalness/roughness).

**Points ouverts** : structure exacte des uniforms lumière côté shader
(tableaux de structs vs uniforms à plat) — décision d'implémentation, pas de
conséquence sur l'API publique du matériau.

---

## 6. Renderer

**Responsabilité** : wrap d'un canvas fourni, dessiner une scène complète en
un appel — use case B1, B6.

**API**

```ts
interface RendererOptions {
  canvas: HTMLCanvasElement;
  alpha?: boolean; // défaut true (fond transparent, use case A2/A6)
  antialias?: boolean;
}

class Renderer {
  constructor(options: RendererOptions);
  setSize(width: number, height: number): void;
  setPixelRatio(ratio: number): void;
  setClearColor(color: [number, number, number], alpha: number): void;
  render(scene: Object3D, camera: PerspectiveCamera): void;
}
```

**Décisions**

- `render(scene, camera)` appelle `scene.updateMatrixWorld()` et
  `camera.updateMatrixWorld()` en interne avant de dessiner — l'appelant n'a
  pas à s'en soucier (comportement three.js standard).
- `setSize`/`setPixelRatio` sont des méthodes explicites plutôt que
  déduites automatiquement du canvas à chaque frame (contrairement au
  `#resize()` privé de `GpuSurface` dans glaze) : c'est un point de
  divergence assumé avec glaze, nécessaire ici parce que three.js expose
  ces méthodes et que le code de resize de la démo (`resizeMol()`) les
  appelle explicitement.
- `DEPTH_TEST` activé par défaut (contrairement à `GpuSurface` qui le
  désactive) — indispensable dès qu'on a plusieurs meshes 3D qui peuvent se
  chevaucher à l'écran (sphères + cylindres).

**Hors scope** : plusieurs passes de rendu, render targets/framebuffers
custom, post-processing.

**Points ouverts** : partage de plomberie bas niveau avec `GpuSurface` de
glaze (création de contexte WebGL2, compilation de programme) — évoqué dans
l'objectif comme piste, à évaluer concrètement une fois le renderer écrit :
si l'extraction complique plus qu'elle ne simplifie, on duplique sans
remords (peu de code concerné).

---

## 7. Controls (orbit)

**Responsabilité** : rotation par drag, damping, autoRotate — use case A3,
B7.

**API**

```ts
interface OrbitControlsOptions {
  enableDamping?: boolean; // défaut true
  dampingFactor?: number; // défaut 0.05
  autoRotate?: boolean; // défaut false
  autoRotateSpeed?: number; // défaut 2.0
  enablePan?: boolean; // défaut true, la démo le met à false
  enableZoom?: boolean; // défaut true, la démo le met à false
}

class OrbitControls {
  constructor(camera: PerspectiveCamera, domElement: HTMLElement, options?: OrbitControlsOptions);
  update(): void; // à appeler chaque frame, applique damping/autoRotate, retourne void
  addEventListener(type: "change", callback: () => void): void;
  dispose(): void; // détache les listeners DOM
}
```

**Décisions**

- Coordonnées sphériques autour d'une cible fixe (par défaut l'origine,
  pas de `target` mobile dans cette itération — la démo ne fait tourner la
  molécule qu'autour de son propre centre).
- `enablePan`/`enableZoom` sont dans l'API dès le départ (pas juste
  `enableRotate`) même si la démo les désactive tous les deux : ça évite de
  devoir changer la signature publique si un futur usage (cf. B8) en a
  besoin, et le coût d'avoir le flag sans l'implémenter derrière (juste
  ignorer l'input pan/zoom) est négligeable.
- Event `change` : nécessaire pour `patDirty = true` dans la démo (le
  pattern de diffraction ne se recalcule que si la caméra a bougé) — c'est
  un besoin d'intégration direct, pas un nice-to-have.

**Hors scope** : touch multi-doigts avancé (pinch-zoom), inertie
post-relâchement au-delà du damping standard, contraintes d'angle
(min/maxPolarAngle) — ajoutées seulement si la démo en a besoin à l'usage.

**Points ouverts** : implémentation interne du pan/zoom (juste des no-op qui
consomment l'option, ou vraie implémentation minimale) — à trancher à
l'implémentation, sans impact sur l'API ci-dessus.

---

## Récapitulatif : ordre d'implémentation

Inchangé par rapport à ce qui avait été dégagé, les specs ne changent pas
l'ordre — elles le rendent juste actionnable :

1. Maths (section 1)
2. Scene graph (section 2)
3. Renderer minimal — un triangle codé en dur, pour valider le pipeline
   WebGL2 avant d'ajouter de la complexité (section 6, version squelette)
4. Caméra perspective + intégration renderer (section 3)
5. Géométries (section 4)
6. Shading Phong (section 5)
7. Orbit controls (section 7) — peut être développé en parallèle de 5-6,
   comme noté précédemment (ne dépend que de 1 et 3)
