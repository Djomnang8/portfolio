# Charte visuelle

Ce que doit respecter tout visuel entrant dans un support pédagogique produit
avec ce kit — qu'il soit généré, codé, photographié ou monté dans Canva.

---

## 1. Le principe directeur

> **Un visuel pédagogique n'est pas une décoration. C'est un raccourci de
> compréhension.**

S'il n'accélère pas la compréhension, il la ralentit : il occupe de l'espace, de
l'attention et du temps de chargement. La première question devant chaque image
n'est pas « est-elle belle ? » mais **« qu'est-ce qu'elle fait comprendre plus
vite que la phrase à côté ? »**.

Si la réponse ne vient pas en cinq secondes, l'image ne sert à rien.

---

## 2. Les invariants de style

| Attribut | Règle |
| --- | --- |
| **Traitement** | Vectoriel plat. Aucun dégradé, aucune ombre portée, aucun effet de matière |
| **Trait** | Épaisseur uniforme de 2 unités sur une grille de 24. Extrémités et jonctions arrondies |
| **Palette** | Les tokens du kit, exclusivement. Trois teintes maximum par visuel, plus le fond |
| **Densité** | Faible. Le vide est un élément de composition, pas de l'espace perdu |
| **Figuration** | Non figuratif. Formes, objets, interfaces — pas de personnages (voir [charte IA](../charte-ia.md), section 3) |
| **Texte** | Aucun texte à l'intérieur d'un visuel raster. Dans un SVG, uniquement du vrai `<text>` |
| **Cadrage** | Composition centrée ou en tiers. Jamais de sujet coupé par un bord |

---

## 3. Le vocabulaire de formes

Un système visuel tient à la constance de son vocabulaire. Ces sept formes
suffisent à couvrir l'essentiel d'un module.

| Forme | Ce qu'elle signifie | Où on l'emploie |
| --- | --- | --- |
| **Cercle** | Une personne, un acteur, un point d'étape | Parcours, rôles |
| **Rectangle arrondi** | Un contenu, un document, un écran | Supports, interfaces |
| **Ligne pleine** | Un lien établi, un flux réel | Processus |
| **Ligne pointillée** | Un lien possible, une correspondance | Mise en relation |
| **Flèche** | Une direction, une conséquence | Causalité, séquence |
| **Coche** | Une conformité, un acquis | Validation |
| **Croix** | Une non-conformité, une erreur | Contre-exemple |

**Règle de constance :** une forme garde le même sens dans tout un parcours. Si
le cercle est une personne au module 1, il ne devient pas une étape au module 3.

---

## 4. La règle des trois canaux

Cette règle décide à elle seule de la conformité de la moitié des visuels.

> **Une information ne repose jamais sur la seule couleur.**
> Elle est portée par **la couleur**, **une forme ou un pictogramme**, et **un texte**.

| Mauvais | Bon |
| --- | --- |
| Une barre rouge, une barre verte | Barre rouge **+ croix + « Non conforme »** · barre verte **+ coche + « Conforme »** |
| Un point de couleur pour le statut | Point coloré **+ forme distincte + libellé** |
| Un tracé rouge sur un graphique | Tracé rouge **+ style de trait différent + étiquette directe** |

Motif : environ 8 % des hommes présentent une déficience de la vision des
couleurs. Et personne ne distingue une nuance de rouge sur un écran de téléphone
en plein soleil — ce qui est la condition de consultation réelle d'une bonne
partie des apprenants.

---

## 5. Contraste dans les visuels

Le critère WCAG 1.4.11 impose **3:1** pour tout élément graphique porteur
d'information.

Concrètement :

- Un trait qui distingue deux zones : 3:1 minimum contre son fond
- Une forme qui porte du sens : 3:1 minimum
- Un motif purement décoratif : aucune exigence — mais alors il ne doit **rien**
  signifier
- Un texte superposé : 4,5:1, mesuré contre la zone effectivement située sous le
  texte, pas contre la moyenne de l'image

Pour vérifier : `node outils/check-contrast.js`, ou le tableau vivant du
[styleguide](../index.html#contrastes).

---

## 6. Formats de sortie

| Usage | Format | Raison |
| --- | --- | --- |
| Schéma, icône, diagramme | **SVG** | Net à toute échelle, texte réel, léger, modifiable |
| Ambiance, couverture | **PNG** ou **WebP** | Le vectoriel n'a pas de sens pour une composition riche |
| Impression | **PDF vectoriel** | Conserve la structure et la netteté |
| Réseaux sociaux | **PNG 1200 × 630** | Format d'aperçu standard |

**Poids visé :** moins de 200 Ko par visuel raster. Un module qui met huit
secondes à s'afficher sur une connexion mobile n'est pas consulté — c'est un
critère de conception, pas une optimisation de fin de projet.

---

## 7. Le protocole de relecture

Six étapes, dans cet ordre, pour tout visuel entrant dans un support.

1. **Générer ou produire 4 variantes.** Une seule ne dit rien de la stabilité du
   procédé.
2. **Relire l'image :** texte parasite ? artefacts ? stéréotypes ? détails non
   demandés ?
3. **Recaler les couleurs** sur les tokens. Sans cette étape, une série de dix
   visuels dérive lentement.
4. **Mesurer le contraste** des éléments porteurs de sens, et du texte superposé
   s'il y en a.
5. **Rédiger l'alternative textuelle** à la main, en regardant l'image finale.
6. **Consigner** la fiche : prompt, outil, seed, retouches, alternative.

Une étape sautée se paie plus tard. La 3 et la 5 sont celles qu'on saute le plus,
et ce sont celles qui coûtent le plus cher.
