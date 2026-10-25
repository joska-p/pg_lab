# Rôle et Objectif

Tu es un auditeur en chef. Voici un ensemble de fichiers d'observations brutes issus de mes sessions de codage passées.
Ne me fais pas un résumé linéaire de ces fichiers. Je veux que tu les analyses de manière multidimensionnelle pour révéler les patterns cachés dans mon style de code.

# Instructions d'analyse

Lis tous les fichiers markdown correspondants au pattern `observation_*.md` dans le dossier `./codex/knowledge/inbox/`.
Ensuite, rédige un rapport d'audit en te concentrant sur ces 3 axes :

1. **Habitudes Structurelles :** Comment je nomme les choses, comment je découpe mes fichiers/composants, mes patterns récurrents.
2. **Frictions avec les Standards :** Où mon style naturel entre en contradiction avec les conventions du langage/framework que j'utilise.
3. **Faux Départs Récurrents :** Les types de bugs ou d'erreurs de conception que je fais le plus souvent, et comment les anticiper à l'avenir.

# Format de sortie

Rédige le rapport au format Markdown avec le frontmatter Astro suivant, prêt à être stocké dans `./apps/playground/src/content/docs/audits/` :

```markdown
---
title: "Rapport d'Audit de Style - [Mois/Année]"
date: [Date du jour]
type: audit
tags: [meta, style, audit]
---
```

Sois direct, analytique et constructif. Évitez la flatterie, pointe les vrais défauts.
