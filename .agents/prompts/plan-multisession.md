Le plan ci-dessus est validé. Crée un DOCUMENT DE TRAVAIL multisessions persistant (fichier .md) qui servira de mémoire de projet entre nos sessions. Je vais réutiliser ce fichier à chaque nouvelle session pour que tu saches exactement où reprendre, sans que tu aies besoin de refaire l'analyse ni de tout redemander.

STRUCTURE ATTENDUE :

1. **Contexte & objectif** (3-5 lignes)
   Résume le "quoi" et le "pourquoi" en une phrase, pas le détail technique.

2. **Décisions actées**
   Reprends telles quelles les décisions déjà validées. Ce sont des faits acquis — tu ne les rediscutes plus sauf si je le demande explicitement.

3. **Plan de tâches**
   Transforme les étapes en tâches numérotées avec statut (TODO / IN PROGRESS / DONE / BLOCKED). Découpe si une étape est trop grosse pour tenir dans une seule session sans saturer le contexte. Chaque tâche doit être suffisamment précise pour être reprise à froid.

4. **Questions ouvertes / points de blocage**
   Liste dès maintenant les "Impacts collatéraux" que tu as identifiés comme options ouvertes si il y en a.
   LCe sont des choix que je dois trancher, pas toi. Ajoute toute nouvelle ambiguïté que tu rencontres en cours de route ici, jamaistranchée seul.

5. **Invariants à préserver**
   Section dédiée pour les contraintes techniques non négociables. Sert de garde-fou pour ne pas les casser par erreur dans une session future.

6. **Journal de session**
   Une entrée par session : date, ce qui a été fait, ce qui a changé.

RÈGLES DE COMPORTEMENT (valables pour toutes les session sur ce document) :

- Au début de chaque session, lis le document en entier avant d'agir.
  Ne refais jamais une tâche DONE.
- Ne tranche jamais seul un choix structurant (les 3 options ouvertes du
  redesign, ou toute contradiction/ambiguïté qui surgit pendant
  l'implémentation). Arrête-toi, note la question dans "Questions
  ouvertes", et pose-la moi directement dans ta réponse.
- Les micro-décisions non structurantes (nommage local, détails
  d'implémentation évidents) tu peux les prendre seul, mais note-les dans
  le journal pour transparence.
- À la fin de chaque session : mets à jour les statuts, le journal, les
  décisions actées si j'en ai validé de nouvelles, puis termine ta réponse
  par "Prochaine tâche : [X]".
- Reste concis : ce document est un outil de travail, pas un compte-rendu
  exhaustif. Résume les résultats, ne recolle pas de gros blocs de code
  ou de raisonnement brut.

Crée le fichier à la racine du packages (ou à l'endroit que tu juges pertinent), nomme-le PLAN.md, puis confirme-moi soncontenu avant de commencer.

L'objectif est de ne faire qu'une seule tache par session, et de pouvoir reprendre facilement la session suivante.
