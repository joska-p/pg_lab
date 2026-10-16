# Random Art — documentation de conception

> **Statut (décision du 2026-10-16) : DEPRÉCIATION.** Cette collection de specs de conception
> est condamnée : sa doctrine est absorbée **dans les commentaires du code**, au fur et à
> mesure. Ne pas l'épaissir. Ce qui fait foi aujourd'hui :
>
> - l'**état réel** : `../PLAN.md` (mis à jour à chaque session) ;
> - le **système de types** : `findings.md` (§1 audit glaze/réalité, §4 direction, §5 pièges,
>   §7 décisions d'implémentation) ;
> - la **conception vivante** : les commentaires des modules concernés — quand on modifie un
>   in variant documenté ici, le déplacer dans le code, pas ici.

Décisions historiques encore utiles : WebGL2 (GLSL ES 3.00), pas d'évaluateur CPU, une
expression = trois arbres (r, g, b), une grammaire invalide n'existe pas, un seul shader,
l'expression exportée est la référence. Les numéros de décision `D1`–`D42` cités par le code
et le plan venaient de `architecture.md` (conservé comme archive).

## Ancien ordre de lecture (archive)

`product-brief.md` (intention) → `glossary.md` (vocabulaire) → `architecture.md`
(modules, D1–D42, en voie de dissolution) → specs de module (`catalog-spec`,
`expression-spec`, `grammar-generator-spec`, `compiler-spec`, `renderer-spec`,
`artwork-spec`) → `explorer-spec.md` (UI) ; `idea-bank.md` est une réserve d'idées, pas
une source de vérité. La revue des specs a été supprimée : tous ses défauts sont corrigés
et l'historique vit dans git.
