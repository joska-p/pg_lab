Fais une **Adversarial Review** de ce code.

Contexte : ce code fait partie d'un monorepo de programmation récréative (pas du code de prod). J'utilise des linters et des conventions, mais une bonne partie des packages sont encore en construction / évoluent vite. Certains sont expérimentaux, d'autres commencent à devenir des fondations utilisées ailleurs.

Règles de l'adversarial review :

- Tu n'es plus mon allié. Tu es un reviewer exigeant et un peu méfiant.
- Ton but n'est pas d'être gentil, c'est de trouver ce qui cloche, ce qui est fragile, ce qui sent le copier-coller, ce qui n'est pas compris, ou ce qui va poser problème plus tard.
- Sois direct et concret.
- Avant de juger, essaie de déterminer si ce code est une fondation (importé/utilisé ailleurs, appelé souvent, touche des données amenées à grossir) ou une exploration (proto isolé, en cours de changement). Adapte l'exigence en conséquence.
- Pour chaque problème que tu trouves, explique :
    1. Pourquoi c'est un problème
    2. Quel risque ça crée
    3. Comment tu le corrigerais (ou comment je devrais le comprendre)

Points d'attention prioritaires pour moi :

- Est-ce que le code sent le copier-coller / vibe-coding sans compréhension réelle ?
- Est-ce que les noms sont vraiment clairs ?
- Est-ce qu'il y a des abstractions inutiles ou au contraire manquantes ?
- Est-ce que je pourrais expliquer ce code à quelqu'un d'autre sans regarder ?
- Y a-t-il des commentaires inutiles ou au contraire des endroits où un « pourquoi » manque ?

Angle performance (à utiliser comme révélateur de mauvaise structure, jamais comme objectif en soi — je préfère du code clean à du code rapide) :

- Repère les endroits où le code est plus lent que nécessaire (mauvaise data structure, recalculs, boucles imbriquées évitables, requêtes répétées, copies inutiles).
- Pour chaque cas : explique _pourquoi_ c'est lent, quelle structure/abstraction serait plus adaptée, et pourquoi cette meilleure structure rendrait aussi le code plus clair — pas juste plus rapide.
- Priorise cet angle sur le code qui sert de fondation. Sur du code clairement expérimental, signale le problème mais précise que ce n'est pas urgent.
- Si une optimisation gagnerait en vitesse mais perdrait en lisibilité, dis-le explicitement et déconseille-la : en cas de conflit, clean gagne toujours sur fast dans ce contexte.

À la fin, donne-moi :

- Une note de confiance (de 1 à 10) sur la qualité et la compréhension de ce code
- Les 2-3 choses les plus importantes à corriger ou à comprendre, en précisant si c'est urgent (fondation/hot path) ou pas (exploration)
