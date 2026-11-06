# Prompt de session — correction des warnings `no-unsafe-type-assertion`

Réutilise ce prompt en début de chaque session. Il guide l'agent pour traiter les avertissements ESLint `typescript/no-unsafe-type-assertion` (rule à `'warn'` dans `vite.config.ts:220`).

---

## Objectif

Éliminer **tous** les avertissements `typescript/no-unsafe-type-assertion` remontés par `vp check`, cas par cas, sans introduire de régression (pas de nouveau warning ni d'erreur de type).

## Règles d'or

- **Ne pas** modifier la configuration ESLint ni désactiver la règle globalement.
- Les cas de **branding** (types nominaux, unions littérales de marques) sont attendus et seront traités au cas par cas : soit corrigés proprement, soit conservés avec un commentaire `// oxlint-disable-next-line typescript/no-unsafe-type-assertion` quand le branding est légitime. À décider au fil de l'eau, pas de dogme.
- Chaque avertissement doit disparaître de `vp check` (ou `vp -C <package> check`) **ou** être explicitement justifié par un commentaire de désactivation.

## Workflow de la session

À chaque ouverture de session, l'agent procède dans cet ordre :

### 1. Lire le contexte
Lire `context.md` pour comprendre le but, les commandes et les patterns de correction observés dans les commits précédents.

### 2. Lire la progression
Lire `progress.md` pour connaître la liste des tâches et leur état (`pending` / `done`).

### 3. Choisir la tâche suivante
Prendre la **première tâche marquée `pending`** dans `progress.md` (ordre du haut vers le bas). Lire le fichier correspondant `tasks/task-XX.md`.

### 4. Exécuter la tâche
Pour chaque warning listé dans le fichier tâche :
- Consulter l'extrait de code (ligne et colonne données).
- Appliquer l'une des approches de `context.md` (garde-fous `typeof`, `instanceof`, suppression d'assertion inutile, `Map` + getter, helper `typedKeys`, etc.).
- Vérifier qu'aucun nouveau warning ou erreur de type n'est introduit.

### 5. Vérifier
Relancer la commande de vérification :
- Repo entier : `vp check`
- Ou uniquement le package concerné : `vp -C packages/<packageName> check`

Confirmer que le(s) warning(s) du fichier traité n'apparaît(ent) plus.

### 6. Mettre à jour la progression
- Passer la tâche de `pending` à `done` dans `progress.md`.
- Si de nouveaux fichiers avec des warnings apparaissent, ajouter une nouvelle tâche dans `progress.md` (et créer éventuellement un `tasks/task-XX.md`).

### 7. Continuer
Passer à la tâche `pending` suivante et répéter jusqu'à ce qu'il n'en reste plus.

## Fin de session

Quand toutes les tâches sont `done` :
- Relancer `vp check` sur le repo entier.
- Confirmer qu'il reste **0 avertissement** `typescript/no-unsafe-type-assertion`.
- Le cas échéant, signaler les cas de branding volontairement conservés avec un commentaire de désactivation.

---

## Fichiers de référence

- `context.md` — but, règle, commandes, patterns, classification, workflow détaillé.
- `progress.md` — liste des tâches et états.
- `tasks/task-XX.md` — une tâche par fichier (emplacement, message, extrait de code, approche suggérée).
