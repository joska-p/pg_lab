# glaze3d — Objectif & scope

## Contexte

`glaze` est un moteur 2D (shapes fullscreen, batch, caméra pan/zoom, shaders
unlit). Le besoin actuel (visualiseur de molécules, remplacement de three.js
dans `mol-demo.js`) demande des briques 3D qui n'ont aucun recouvrement
conceptuel avec `glaze` : scene graph, caméra perspective, géométries,
shading Phong, orbit controls (voir gap analysis du 20/09).

Plutôt que de forcer ces briques dans `glaze`, on crée un package séparé :
`glaze3d`.

## Double objectif du projet

Ce n'est pas un produit — pas d'utilisateurs, pas de deadline, pas de
contrainte business. C'est un projet de coding récréatif. Ce cadrage a une
conséquence concrète : le "niveau vitrine" ci-dessous n'a de valeur que
comme terrain d'essai, jamais comme livrable à satisfaire pour lui-même.

Le projet a deux niveaux, et c'est assumé dès le départ — ça évite de
confondre "ce qui sert la démo" et "ce qui sert la lib" quand viendra le
moment de trancher une décision d'API.

**Niveau vitrine — le prétexte concret**
Un registre de molécules consultable, avec une visualisation 3D interactive
de chaque molécule (rotation, éventuellement chargement de fichiers `.mol`/
`.sdf` par l'utilisateur). C'est ce qui existe déjà partiellement dans
`mol-demo.js.txt`.

**Niveau technique — l'objectif réel**
Construire `glaze3d`, un petit framework 3D WebGL2 réutilisable, pensé pour
être _le_ successeur maison de three.js sur ce type de besoin (scène simple,
peu d'objets, pas de moteur de jeu). Le registre de molécules sert de terrain
de test complet : il exerce à peu près toutes les briques qu'on a identifiées
(maths, scene graph, caméra, géométries, shading, controls), donc s'il tourne
bien dessus, le framework est probablement solide pour d'autres usages
similaires.

**Priorité entre les deux** : en cas d'arbitrage, le niveau technique gagne
systématiquement. Si une décision d'API rend le code du viewer un peu moins
direct mais rend `glaze3d` plus propre à réutiliser ailleurs, on prend
l'option "lib propre". Le viewer est un client de la lib, pas l'inverse —
et comme il n'y a pas d'utilisateur final à satisfaire, rien n'oblige à
polir le viewer au-delà de ce qu'il faut pour exercer la lib correctement.

## Ce que glaze3d doit couvrir (scope)

Dérivé directement du gap analysis — c'est la liste de ce que three.js
apportait à la démo et que `glaze3d` doit reproduire :

- Maths 3D minimales (Vector3, Quaternion, Matrix4 — juste ce qu'il faut,
  pas une lib d'algèbre linéaire générale)
- Scene graph léger (transforms hiérarchiques, un objet peut être attaché à
  un autre et hériter de sa transform — ex. lumière attachée à la caméra)
- Caméra perspective (fov/aspect/near/far, matrices projection + vue
  exposées, pas seulement utilisées en interne par un renderer opaque)
- Génération de géométries simples (sphère, cylindre — pas un système de
  géométrie procédurale générique)
- Shading Phong basique (ambient + diffuse + specular, plusieurs lumières)
- Renderer minimal WebGL2 (wrap d'un canvas fourni, pas créé par la lib)
- Orbit controls (rotation par drag, damping, autoRotate)

## Non-objectifs (ce qu'on ne cherche PAS à faire)

Explicite pour éviter le scope creep — glaze3d n'est pas :

- Un concurrent généraliste de three.js (pas de shadows, pas de PBR, pas de
  post-processing, pas de loaders de formats de fichiers 3D exotiques, pas
  de skinning/animation, pas de raycasting)
- Un moteur de jeu (pas de physique, pas d'audio, pas de gestion de scènes
  multiples)
- Une lib de géométrie procédurale générale (on ne génère que sphère +
  cylindre au départ ; d'autres formes s'ajoutent seulement si un usage
  concret les demande)
- WebGL1-compatible : WebGL2 uniquement, comme `glaze` (cohérent avec le
  reste de la stack et avec le shader `#version 300 es` déjà utilisé côté
  pattern de diffraction)

## Critères de succès

- `mol-demo.js` tourne intégralement sur `glaze3d`, sans import three.js,
  avec un rendu visuellement équivalent (mêmes sphères/cylindres, éclairage
  Phong crédible, orbit control fluide avec damping/autoRotate)
- Le shader WebGL2 raw du pattern de diffraction (`drawPattern`) continue de
  fonctionner en lisant la caméra `glaze3d` (position/orientation des atomes
  projetés dans le plan caméra) — c'est le point d'intégration le plus
  sensible, il ne doit pas être un angle mort de l'API
- L'API de `glaze3d` est assez générale pour qu'un deuxième usage (pas
  encore identifié) puisse s'appuyer dessus sans réécrire les briques de
  base — sans pour autant sur-généraliser avant d'avoir ce deuxième cas réel
