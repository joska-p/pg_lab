# Spec — Œuvre (artwork)

Version de travail 0.1. Termes définis dans `glossary.md`, décisions dans `architecture.md`, expressions dans `expression-spec.md`, grammaires dans `grammar-generator-spec.md`.

## 1. Responsabilité

Le module **artwork** définit le format de l'œuvre et de la grammaire exportées, et leur import/export. C'est de la donnée pure : il ne rend rien, ne génère rien (sauf pour la vérification optionnelle de §5) et ne dessine rien.

Il dépend de `expression`, de `grammar` et, pour la vérification, de `generator`. Il ne sait rien du renderer : les bornes de taille sont des constantes propres au module.

## 2. Principes

- **L'expression est la référence** (D1). La provenance (grammaire, seed) est informative : elle dit d'où vient l'œuvre, pas ce qui la définit.
- **Une œuvre invalide n'existe pas.** On l'obtient par `createArtwork` ou `parseArtwork`, qui valident.
- **Un fichier porte son format et sa version** (D4). Pas de migration en v1 : une version inconnue est refusée avec un message clair.
- **Texte stable.** Mêmes données → même texte (clés dans un ordre fixe, indentation de 2 espaces), pour des différences lisibles dans un dépôt.

## 3. Types

```ts
type RenderSettings = {
  readonly width: number;      // entier, 1..8192
  readonly height: number;     // entier, 1..8192
  readonly loopMs: number;     // fini, 500..120000
};

type Provenance = {
  readonly grammar: Grammar;
  readonly seed: Seed;
  readonly generatorVersion: number;
};

type Artwork = Brand<{
  readonly expression: Expression;
  readonly render: RenderSettings;
  readonly provenance?: Provenance;
  readonly title?: string;           // 1..200 caractères
}, 'Artwork'>;

createArtwork(input: { expression; render?; provenance?; title? }): Artwork
```

Défauts de `render` : `1024 × 1024`, `loopMs = 8000` (D36). `createArtwork` lève une erreur si une borne est violée.

## 4. Fichiers

```ts
serializeArtwork(artwork): string        // JSON, 2 espaces, clés dans l'ordre ci-dessous
parseArtwork(catalog, text: string): Artwork

serializeGrammarFile(grammar): string
parseGrammarFile(catalog, text: string): Grammar
```

### Œuvre (`.randomart.json`)

```json
{
    "format": "random-art",
    "version": 1,
    "title": "Vagues",
    "render": { "width": 1024, "height": 1024, "loopMs": 8000 },
    "provenance": {
        "generatorVersion": 1,
        "seed": 123456,
        "grammar": {
            "weights": { "x": 3 },
            "constraints": { "minDepth": 3, "maxDepth": 8, "maxNodes": 60 }
        }
    },
    "expression": { "r": { "op": "x" }, "g": { "op": "y" }, "b": { "op": "tsin" } }
}
```

Ordre des clés : `format`, `version`, `title`, `render`, `provenance`, `expression`. Les champs facultatifs absents sont omis.

### Grammaire (`.randomart-grammar.json`)

```json
{
    "format": "random-art-grammar",
    "version": 1,
    "grammar": {
        "weights": { "x": 3, "y": 3 },
        "constraints": { "minDepth": 3, "maxDepth": 8, "maxNodes": 60 }
    }
}
```

### Règles de lecture

- Le texte est limité à **1 Mo** (D35) ; au-delà : erreur avant tout `JSON.parse`.
- `format` doit être la chaîne attendue, `version` doit valoir `1`. Sinon : erreur qui cite la valeur trouvée (« version 2 non prise en charge »).
- L'expression passe par `deserialize` (limites d'import de `expression-spec.md` §4 bis) ; la grammaire par `deserializeGrammar` ; `render` et `provenance` sont validés champ par champ.
- Les champs inconnus sont **refusés** (« accepter moins, promettre plus ») : un fichier d'une version future ne passe pas pour une version 1 sans le dire.
- Les messages d'erreur donnent le chemin du champ fautif (`render.loopMs`, `expression.g.in[1]`…).

## 5. Provenance et vérification

```ts
checkProvenance(catalog, artwork): 'none' | 'matches' | 'differs' | 'version-mismatch'
```

- `none` : pas de provenance.
- `version-mismatch` : `generatorVersion` ≠ `GENERATOR_VERSION` courante (la seed ne se rejoue plus ; l'expression garde la référence).
- `matches` / `differs` : on régénère avec `(grammar, seed)` et on compare `nodeKey` des trois canaux.

L'UI s'en sert pour dire « régénérable » ou « modifiée à la main » (`differs`). Une œuvre éditée garde sa provenance : on ne perd pas la fonction d'origine (brief §6).

## 6. Ce qui n'est pas dans le fichier

- L'**image** (PNG) : produite par le renderer à la demande. Pas de métadonnées dans le PNG en v1 (une extension future pourrait y mettre un chunk `tEXt` avec le JSON de l'œuvre).
- L'instant de lecture, la pause, la taille du canvas, le fond : état d'UI.
- L'historique et les collections : explorer (UI).

## 7. Organisation du code

```
artwork/
  types.ts        // RenderSettings, Provenance, Artwork, constantes de bornes
  create.ts       // createArtwork
  serialize.ts    // serializeArtwork, parseArtwork, fichiers de grammaire
  provenance.ts   // checkProvenance
  index.ts
```

## 8. Tests

1. **Aller-retour** : `parseArtwork(serializeArtwork(a))` égale `a` (expression par `nodeKey`, reste par valeur).
2. **Texte stable** : deux œuvres égales donnent le même texte ; un instantané sur un exemple fixe.
3. **Bornes** : tailles `0`, `8193`, non entières ; `loopMs` `499`, `120001`, `NaN` ; titre vide ou trop long.
4. **Format et version** : `format` erroné, `version` `2`, `version` absente : chacun donne le bon message.
5. **Champs inconnus** : refusés avec leur chemin.
6. **Taille** : un texte de plus de 1 Mo est refusé sans être parsé.
7. **Expression invalide** : l'erreur de `deserialize` est relayée avec son adresse.
8. **Provenance** : `matches` sur une œuvre générée ; `differs` après `replaceNode` ; `version-mismatch` avec une autre version ; `none` sans provenance.
9. **Fichier de grammaire** : aller-retour, grammaire invalide refusée par `createGrammar`.

## 9. Décisions prises et questions restantes

- Grammaire sauvegardée : fichier individuel en v1 (D37) ; liste et comparaison en v2.
- Bornes de `loopMs` (`500..120000`) et de taille (`8192`) : valeurs de départ.
- Reste ouvert (v2) : stocker plusieurs variations dans un seul fichier (collection) ; métadonnées dans le PNG.
