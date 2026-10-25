## Rôle et Objectif

Tu es un extracteur de connaissances. Nous approchons de la fin de notre session de codage. Le contexte va s'effacer, mais notre interaction contient de la matière première intellectuelle. Ton objectif est d'extraire les "unités de savoir" atomiques et de les sauvegarder dans `./codex/knowledge/inbox/`.

## Instructions d'extraction

- Parcours notre conversation et identifie les éléments ayant une valeur de réutilisation ou de réflexion.
- Ignore le bruit de session (erreurs de syntaxe corrigées en direct, tests basiques, discussions annexes).
- Sois intransigeant sur le découpage : une idée = un fichier. Ne génère rien si la session ne contient aucune matière véritablement exploitable.

## Règles de formatage et de routage

Pour chaque unité, crée le dossier `./codex/knowledge/inbox/` si nécessaire et génère un fichier `.md`.
Nom du fichier : `<type>_<slug-court-descriptif>.md` (ex: `bug_react-useeffect-cleanup.md`).

Choisis le type le plus approprié parmi les 5 suivants :

### Type 1 : IDEA (Pistes d'amélioration / features)

Fichier : `./codex/knowledge/inbox/idea_<slug>.md`
Contenu :
---

# [Titre de l'idée]

**Contexte :** [Pourquoi on en a parlé]
**Description :** [L'idée détaillée]
**Lien codebase :** [Fichiers concernés]

### Action Kanban

```bash
./scripts/kanban.sh idea "[Titre]" -b "[Contexte + Description courte]"

```

---

### Type 2 : BUG (Dysfonctionnements à corriger)

## Fichier : `./codex/knowledge/inbox/bug_<slug>.md`

Contenu :

# [Titre du bug]

**Contexte :** [Quand se produit-il ?]
**Corps :** [Explication de la cause à effet, ou le problème constaté]
**Lien codebase :** [Fichiers concernés]

### Action Issue GitHub

```bash
gh issue create --title "[Titre]" --body "[Contexte + Corps]"

```

---

### Type 3 & 4 : RULE & SNIPPET (Grimoire Astro)

## Fichier : `./codex/knowledge/inbox/rule_<slug>.md` ou `./codex/knowledge/inbox/snippet_<slug>.md`

Contenu :

---

## title: '[Titre clair]'

date: YYYY-MM-DD
type: rule # ou snippet
tags: [tags pertinents, ex: react, bash, architecture]

**Contexte :** [En 1-2 phrases, pourquoi on en a parlé / quel problème cela résout]

**Corps :**
[Pour RULE: La règle stricte et le piège (gotcha) à éviter.]
[Pour SNIPPET: Le bout de code concret et réutilisable, dépouillé de contexte trop spécifique.]

## **Lien codebase :** [Si applicable]

### Type 5 : OBSERVATION (Matière pour audit de style)

## Fichier : `./codex/knowledge/inbox/observation_<slug>.md`

Contenu :

# [Titre de l'observation]

## **Corps :** [Remarque sur mes habitudes de code, mes biais, ou inconsistances avec les conventions déclarées.]

**Exemple session :** [Ce qui s'est passé aujourd'hui qui illustre cette observation]

## Exécution

Génère et sauvegarde tous les fichiers pertinents maintenant dans `./codex/knowledge/inbox/`.
Confirme-moi la liste exacte des fichiers créés à la fin.
