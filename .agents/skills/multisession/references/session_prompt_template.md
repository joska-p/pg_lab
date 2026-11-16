# Template de Prompt de Session

À copier/adapter dans `_TMP/<project>/prompt.md` ou à soumettre directement à l'agent :

```markdown
Tu travailles dans /workspaces/<repo> sur <nom du projet ou migration>.

Lis d'abord _TMP/<project>/PLAN.md (point d'entrée obligatoire), puis les fichiers concernés avant toute modification.

CONTEXTE

- Sessions 1 à <N-1> terminées et validées.
- <Résumé ultra court de l'état actuel>.

OBJECTIF
Implémenter la Session <N> — <Titre de la session>.

DELIVERABLES (d'après le plan)

- <Livrable 1>
- <Livrable 2>
- <Livrable 3>

VÉRIFICATION

- vp -C packages/<pkg> check
- vp -C packages/<pkg> test
- vp check

FIN DE SESSION

- Mettre à jour dans _TMP/<project>/PLAN.md : Status, Current state, Next action.
- Mettre à jours _TMP/<project>/prompt.md pour le prochain agent.
- Marquer la Session <N> comme terminée.
- Committer uniquement les changements pertinents (ne pas committer _TMP/<project>/PLAN.md).
```
