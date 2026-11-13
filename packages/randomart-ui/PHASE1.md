# PHASE 1 — Post-processing : effet de grain

## Objectif

Valider le mécanisme de rendu en deux passes (multi-pass) dans `randomart-ui` :

```
shader randomart  →  texture intermédiaire  →  effet (grain)  →  canvas affiché
```

Un seul effet pour l'instant : **grain**, avec un toggle activer/désactiver dans `Controls`.

---

## Ce qui existe déjà (à réutiliser)

### `@repo/glaze` — `StateBuffer` (ping-pong)

Fichier : `packages/glaze/src/gpu/StateBuffer.ts`

- `StateBufferTargets` gère une paire de textures + framebuffers (FBO)
- `bindWrite()` lie le FBO d'écriture, `getReadTexture()` retourne la texture de lecture
- `swap()` échange lecture/écriture
- `step()` dans `StateBuffer` fait un cycle complet : lire texture N → dessiner plein écran → écrire dans FBO → swap
- `resize()` / `reinitialize()` gèrent le changement de taille et la restauration du contexte WebGL

C'est l'outil utilisé dans `packages/automa/src/engine/gpu/SimulationEngine.ts`. On peut s'en inspirer directement.

### Registre statiques (convention codex)

Fichier de référence : `packages/codex/docs/noUncheckedIndexedAccess.md` (section 5)

Pattern à suivre :

```ts
interface MaDefinition {
    readonly id: string;
    readonly label: string;
    // …
}

export const REGISTRE = [
    { id: '…', label: '…', /* … */ },
] as const satisfies readonly MaDefinition[];

export type MaDefinition = (typeof REGISTRE)[number];
export type MaId = MaDefinition['id'];
```

---

## Spécification Phase 1

### 1. Registre d'effets de post-processing

Fichier à créer : `packages/randomart-ui/src/postProcessing/effects.ts` (ou similaire)

```ts
interface PostProcessEffect {
    readonly id: string;               // ex: 'grain'
    readonly label: string;            // ex: 'Grain'
    readonly order: number;            // ordre d'exécution (plus petit = d'abord)
    readonly fragmentShader: string;   // GLSL de l'effet, lit une texture, écrit o_color
    readonly defaultActive: boolean;   // état par défaut du toggle
}

export const POST_PROCESS_EFFECTS = [
    { id: 'grain', label: 'Grain', order: 10, fragmentShader: GRAIN_FRAGMENT_SHADER, defaultActive: false },
] as const satisfies readonly PostProcessEffect[];
```

Dérivés automatiques (pas de liste parallèle) :

```ts
export type PostProcessEffectDefinition = (typeof POST_PROCESS_EFFECTS)[number];
export type PostProcessEffectId = PostProcessEffectDefinition['id'];

const postProcessEffectsById = new Map<string, PostProcessEffectDefinition>(
    POST_PROCESS_EFFECTS.map((e) => [e.id, e]),
);
```

L'ordre d'exécution est déduit de `order`, pas d'un tableau séparé.

### 2. État actif/inactif

Store zustand dédié (ex: `packages/randomart-ui/src/stores/postProcessingStore.ts`)

```ts
interface PostProcessingState {
    readonly activeEffects: Record<PostProcessEffectId, boolean>;
    setActive(id: PostProcessEffectId, active: boolean): void;
}
```

Initialisé depuis `defaultActive` de chaque définition du registre.

### 3. Rendu en deux passes

Modifier `RandomArtCanvas` (ou créer un composant wrapper) pour :

1. **Pass 1** : le shader randomart dessine dans une texture intermédiaire (FBO) au lieu du canvas directement
2. **Pass 2** : pour chaque effet actif, dans l'ordre `order`, faire un cycle ping-pong :
   - lire la texture produite par l'étape précédente
   - appliquer le shader de l'effet
   - écrire dans la texture suivante (ou le canvas final si dernier effet)
3. Gérer le resize et `webglcontextrestored` (comme `StateBuffer.resize()` / `reinitialize()`)

Si un seul effet est actif, on peut écrire directement dans le canvas final (pas besoin de ping-pong à deux textures). Si plusieurs effets sont actifs, il faudra alterner entre deux textures.

### 4. UI

Section « Post-processing » dans `Controls` (fichier existant : `packages/randomart-ui/src/components/Controls.tsx`)

Un toggle par effet enregistré :

```
□ Grain
```

Composants de la lib `@repo/ui` existants, aucun nouveau design.

### 5. Shader de grain (à écrire)

Fragment shader GLSL ES 3.00 qui :
- reçoit en input la texture du rendu randomart (uniform sampler2D)
- ajoute un bruit aléatoire par pixel
- écrit `o_color`

### Ce qui est EXCLU de la Phase 1

- ❌ Réordonnancement manuel des effets par l'utilisateur (l'ordre est hardcoded via `order`)
- ❌ Smooth maximum (idée A ou C, c'est pour la Phase 2)
- ❌ Autres effets que le grain
- ❌ Application du post-processing à l'export PNG (`renderOffscreen.ts`) — seulement le canvas live
- ❌ Modification de `randomart-core`

---

## Critères d'acceptation

- [ ] Le grain s'affiche quand son toggle est activé, disparaît quand désactivé
- [ ] On peut ajouter un nouvel effet au registre sans modifier le cœur du rendu
- [ ] L'ordre d'exécution est déterminé par `order`, pas par un tableau séparé
- [ ] Le rendu fonctionne après resize et restauration du contexte WebGL

---

## Prochaines étapes (nouvelle session)

1. Créer le registre d'effets (`src/postProcessing/effects.ts`)
2. Créer le store d'état (`src/stores/postProcessingStore.ts`)
3. Écrire le shader GLSL du grain
4. Modifier `RandomArtCanvas` pour le rendu en deux passes (texture intermédiaire + effet)
5. Ajouter les toggles dans `Controls`
6. Tester : activation/désactivation du grain, resize, restauration du contexte

---

## Notes pour reprendre

- Le ping-pong est déjà implémenté dans `@repo/glaze/src/gpu/StateBuffer.ts` — s'en inspirer ou l'utiliser directement
- La convention des registres statiques est dans `packages/codex/docs/noUncheckedIndexedAccess.md` (section 5)
- `RandomArtCanvas` actuel : `packages/randomart-ui/src/components/RandomArtCanvas.tsx` (utilise `GpuCanvas` de `@repo/glaze`)
- Contrat du shader randomart : lit `vUv`, `u_phase`, écrit `o_color` (voir `packages/randomart-core/src/glsl.ts`)
