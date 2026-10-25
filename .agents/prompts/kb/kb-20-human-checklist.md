**Étape 1 : Fin de Session (Cristallisation)**

- [ ] Envoyer le **Prompt 1** à l'agent avant de fermer la session.
- [ ] Vérifier que l'agent a bien créé les fichiers dans `@codex/knowledge/inbox/`.

**Étape 2 : La Station de Tri (Poubelle & Scission)**

- [ ] Ouvrir le dossier `@codex/knowledge/inbox/`.
- [ ] **La Poubelle :** Supprimer les fichiers qui n'ont plus de sens à froid. Ne pas avoir peur de tout jeter si la session était inutile.
- [ ] **La Scission :** Ouvrir chaque fichier. Si une note contient 2 idées indépendantes, la dupliquer et couper le contenu en deux.

**Étape 3 : Le Routage (L'Action)**

- [ ] **Pour les fichiers `idea_*.md` :** Copier-coller la commande `./scripts/kanban.sh idea ...` dans le terminal. Exécuter. Supprimer le fichier de l'inbox.
- [ ] **Pour les fichiers `bug_*.md` :** Copier-coller la commande `gh issue create ...` dans le terminal. Exécuter. Supprimer le fichier de l'inbox.
- [ ] **Pour les fichiers `rule_*.md` et `snippet_*.md` :** Déplacer le fichier directement vers `./apps/playground/src/content/docs/rules/` (ou `snippets/`). Commit & push.
- [ ] **Pour les fichiers `observation_*.md` :** Les laisser s'accumuler. Ne rien faire.

**Étape 4 : La Synthèse Mensuelle (L'Audit)**

- [ ] Quand `@codex/knowledge/inbox/` contient une vingtaine de `observation_*.md`.
- [ ] Envoyer le **Prompt 2** à l'agent.
- [ ] Récupérer le rapport généré, le sauvegarder dans `./apps/playground/src/content/docs/audits/`.
- [ ] Supprimer les fichiers `observation_*.md` de l'inbox (ils ont été synthétisés).
