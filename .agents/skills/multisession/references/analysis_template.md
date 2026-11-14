# Analyse — <Sujet / Migration>

## 0. Vérifications initiales

- `vp check` → OK
- `vp test` → OK
- Lecture attentive des packages concernés et des contrats d'interfaces.
- Aucun fichier modifié avant validation du plan.

---

## 1. État réel des briques existantes

| Sujet / Feature | État réel                         | Diagnostic / Conséquence        |
| --------------- | --------------------------------- | ------------------------------- |
| `<Feature A>`   | `<Existant / Incomplet / Absent>` | `<Impact direct sur le projet>` |
| `<Feature B>`   | `<...>`                           | `<...>`                         |

---

## 2. Besoins réels du consommateur

Identifier précisément ce que le consommateur utilise :

1. **Composants et cycle de vie :** (ex: canvas, render gate, context restore).
2. **Gestion du temps et horloge :** (ex: boucle infinie, loop temporisé, phase normalisée).
3. **Pipeline de rendu :** (ex: simple quad, multi-passes, ping-pong, post-processing).
4. **Unités et coordonnées :** (ex: pixels CSS vs physiques, DPR, conventions UV).
5. **Types et imports :** (ex: détection des types brandés ou wrappers superflus).

---

## 3. Écarts et points bloquants

### 3.1 <Écart bloquant 1>

<Description détaillée du manque ou de l'incompatibilité et proposition de solution minimale.>

### 3.2 <Écart bloquant 2>

<Description détaillée.>

---

## 4. Dettes techniques et simplifications recommandées

- Supprimer les types cosmétiques ou brandés inutiles (`PositiveNumber`, `DurationSeconds`, etc.).
- Ne pas introduire d'abstractions prématurées sans besoin applicatif concret.

---

## 5. Découpage stratégique en sessions

<Proposition initiale du découpage par incréments vérifiables avant rédaction du PLAN.md.>
