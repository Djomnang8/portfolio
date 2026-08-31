# Gabarits — spécifications de montage

Six mises en page couvrant l'essentiel d'un module. Chacune existe sous trois
formes : un **aperçu HTML** dans [`gabarits/`](gabarits/), une **spécification de
montage** Canva et Genially, et des **règles d'accessibilité** propres au gabarit.

| Gabarit | Usage | Aperçu |
| --- | --- | --- |
| **G1** · Écran titre | Ouverture de module | [g1-titre.html](gabarits/g1-titre.html) |
| **G2** · Contenu illustré | La mise en page de travail, ~60 % des écrans | [g2-contenu.html](gabarits/g2-contenu.html) |
| **G3** · Comparaison | Avant / après, à faire / à éviter | [g3-comparaison.html](gabarits/g3-comparaison.html) |
| **G4** · Étapes | Processus en 3 à 5 temps | [g4-etapes.html](gabarits/g4-etapes.html) |
| **G5** · Quiz | Question, options, retour commenté | [g5-quiz.html](gabarits/g5-quiz.html) |
| **G6** · Récapitulatif | Bilan de fin, ressources | [g6-recap.html](gabarits/g6-recap.html) |

Régénérer les six : `node outils/build-gabarits.js`

---

## Réglages communs à tout montage

### Format et grille

| | Écran (16:9) | Fiche imprimable | Réseaux sociaux |
| --- | --- | --- | --- |
| Dimensions | 1920 × 1080 px | A4, 210 × 297 mm | 1200 × 630 px |
| Marges | 96 px | 20 mm | 64 px |
| Grille | 12 colonnes, gouttière 24 px | 6 colonnes | 6 colonnes |
| Corps de texte | 18 pt minimum | 11 pt minimum | 20 pt minimum |

### Palette de marque à créer dans l'outil

À saisir une fois, puis à réutiliser. Valeurs issues de
[`tokens/tokens.json`](../tokens/tokens.json), toutes vérifiées.

| Rôle | Hex | Contraste sur blanc |
| --- | --- | --- |
| Texte principal | `#16213E` | 15,89:1 |
| Texte secondaire | `#4A5673` | 7,32:1 |
| Fond de section | `#F1F5FB` | — |
| Action principale | `#1D4ED8` | 6,70:1 |
| Accent | `#B03A0B` | 6,08:1 |
| Réussite | `#146C39` | 6,49:1 |
| Erreur | `#A81E1E` | 7,32:1 |
| Bordure porteuse de sens | `#78859F` | 3,97:1 |

### Typographie

- **Jamais moins de 16 px** (12 pt) pour du texte courant
- **Interlignage 1,5 minimum** — c'est le réglage le plus souvent oublié, et
  celui qui change le plus la lisibilité
- **68 caractères par ligne maximum** : au-delà, l'œil perd la ligne au retour
- Hiérarchie : un seul titre de niveau 1 par écran, jamais de saut de niveau

---

## Canva — points de vigilance

| Point | Ce qui se passe | Ce qu'il faut faire |
| --- | --- | --- |
| **Export PDF** | Le PDF standard perd la structure de titres. Le sommaire est vide pour un lecteur d'écran | Exporter en *PDF standard*, puis rétablir les balises dans Acrobat. Ou livrer aussi une version HTML |
| **Modèles proposés** | Utilisent massivement du gris clair sur blanc, souvent sous 3:1 | Repartir d'une page vierge avec la palette de marque, plutôt que d'adapter un modèle |
| **Typographies décoratives** | Certaines sont rastérisées à l'export : le texte devient une image | Se limiter aux polices système ou aux polices non rastérisées. Vérifier en sélectionnant le texte dans le PDF exporté |
| **Texte de remplacement** | Champ disponible mais non obligatoire, donc souvent vide | Le renseigner image par image avant chaque export |
| **Cibles tactiles** | Aucune contrainte imposée par l'outil | Vérifier manuellement les 44 × 44 px sur les éléments cliquables des documents interactifs |

---

## Genially — points de vigilance

| Point | Ce qui se passe | Ce qu'il faut faire |
| --- | --- | --- |
| **Ordre de tabulation** | Suit l'ordre d'empilement des calques, pas l'ordre visuel | Réordonner le panneau *Calques* dans l'ordre de lecture, **et revérifier après chaque modification** |
| **Éléments décoratifs** | Chacun est un élément distinct, donc annoncé par le lecteur d'écran | Fusionner le décoratif dans l'image de fond. Ne garder en éléments distincts que ce qui porte du sens |
| **Animations d'entrée** | Actives par défaut, ignorent `prefers-reduced-motion` | Désactiver, ou limiter à un fondu de 200 ms. Aucune translation ni rotation |
| **Calques d'interaction** | Un retour de quiz placé sous le bouton peut ne pas être annoncé | Placer le calque de retour **au-dessus** du déclencheur |
| **Quiz natif** | Fonctionne, mais les retours par défaut sont vides de contenu | Réécrire chaque retour : deux textes distincts, un pour la réussite, un pour l'erreur |
| **Publication en iframe** | L'accessibilité de l'éditeur ne préjuge pas de celle de la publication | Tester **sur l'URL publiée**, jamais dans l'éditeur |

---

## Liste de contrôle avant livraison

À passer sur chaque écran, quel que soit l'outil.

**Structure**
- [ ] Un seul titre de niveau 1
- [ ] Aucun saut de niveau dans la hiérarchie
- [ ] Les listes sont de vraies listes, pas des lignes avec un tiret

**Texte**
- [ ] 16 px minimum partout
- [ ] Interlignage 1,5 minimum
- [ ] 68 caractères par ligne maximum
- [ ] Aucun texte en image

**Couleur**
- [ ] Tous les contrastes de texte ≥ 4,5:1
- [ ] Éléments graphiques porteurs de sens ≥ 3:1
- [ ] Aucune information portée par la seule couleur

**Images**
- [ ] Chaque image porteuse de sens a une alternative rédigée
- [ ] Chaque image décorative a une alternative vide, ou est fusionnée au fond
- [ ] Les visuels générés par IA ont leur fiche de traçabilité

**Interaction**
- [ ] Parcours complet au clavier, souris débranchée
- [ ] Focus visible à chaque étape
- [ ] Cibles cliquables de 44 × 44 px minimum
- [ ] Aucun minuteur imposé

**Mouvement**
- [ ] Animations désactivées ou réduites à un fondu court
- [ ] Aucun clignotement, aucun défilement automatique

> Cette liste existe aussi en **version interactive avec score** dans le projet
> [audit-accessibilite-supports-pedagogiques](../../audit-accessibilite-supports-pedagogiques/outil-checklist/).
