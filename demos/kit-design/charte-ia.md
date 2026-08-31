# Charte de production assistée par IA

Une page. Elle répond aux questions qu'un client, un juriste ou un formateur
finissent toujours par poser.

---

## 1. Ce qui est généré, ce qui ne l'est pas

| Type de visuel | Production | Pourquoi |
| --- | --- | --- |
| Ambiance, couverture, bandeau, métaphore | **IA générative** | Composition libre, aucune donnée à représenter exactement. Trois minutes contre deux heures |
| Schéma, graphique, diagramme, comparatif chiffré | **SVG codé** | Doit être exact au chiffre près, rester net au zoom, basculer en thème sombre, peser quelques kilo-octets |
| Icône d'interface | **SVG codé** | Grille stricte, trait uniforme, `currentColor` |
| Photo de personne réelle | **Ni l'un ni l'autre** | Banque d'images sous licence, ou séance photo. Voir section 3 |
| Capture d'écran de logiciel | **Capture réelle** | Une interface générée est une interface qui n'existe pas. Sur un tutoriel, c'est une faute |

Le critère de décision tient en une question : **est-ce que ce visuel affirme
quelque chose de vérifiable ?** Si oui, il doit être exact, donc codé ou capturé.
Si non, il peut être généré.

---

## 2. Ce qui n'est jamais généré

Liste ferme, quel que soit le délai ou le budget.

- **Visages de personnes réelles**, ou images pouvant être prises pour telles
- **Logos, marques, chartes de tiers**
- **Données chiffrées** — graphiques, tableaux, statistiques
- **Captures d'interfaces** existantes
- **Documents officiels** — diplômes, attestations, pièces d'identité, factures
- **Signatures, tampons, mentions légales**
- **Situations de handicap représentées à titre illustratif** sans relecture par
  une personne concernée. Le risque de caricature est élevé, et la caricature est
  pire que l'absence d'image

---

## 3. Les personnes dans les visuels

Sujet sensible en formation, où l'on illustre souvent « des apprenants ».

**Position tenue :** les visuels de ce kit sont **non figuratifs**. Formes,
objets, interfaces — pas de personnages.

Trois raisons :

1. **Les biais.** Une IA reproduit les biais de son corpus. Sur une série de dix
   visuels de formation, on retrouve toujours les mêmes profils aux mêmes rôles.
   Ce n'est pas un détail esthétique dans un contexte pédagogique.
2. **Les artefacts.** Mains et visages restent les zones les plus défaillantes.
   Une main à six doigts dans un module de formation professionnelle décrédibilise
   l'ensemble.
3. **Le droit à l'image.** Un visage généré peut ressembler à une personne réelle.
   Le contentieux est théorique aujourd'hui ; il ne le restera pas.

Quand une figure humaine est indispensable : **banque d'images sous licence
explicite**, ou photo réalisée avec autorisation écrite.

---

## 4. Traçabilité

Chaque visuel généré entre dans le projet **avec sa fiche** :

- Le prompt complet, bloc de style inclus
- Le prompt négatif
- L'outil et sa version
- Le seed, quand l'outil en fournit un
- La date de génération
- Les retouches appliquées
- L'alternative textuelle, **rédigée à la main**
- La date de vérification des conditions d'utilisation

Sans cette fiche, l'image est irreproductible dans six mois. Et « peux-tu me
refaire la même en vert ? » devient un chantier au lieu d'une modification.

---

## 5. Droits d'usage

**Ce qui est vérifié avant chaque projet, et pas une fois pour toutes :**

- Les conditions d'utilisation de l'outil **au jour de la génération** — elles
  changent, et elles diffèrent entre plan gratuit et plan payant
- L'usage commercial est-il couvert par le plan souscrit ?
- La cession au client est-elle possible ?
- Le fournisseur revendique-t-il des droits sur les sorties ?

**Ce qui est consigné :** la date de vérification et la version des CGU
consultée, dans la fiche du visuel.

**Ce qui est dit au client :** que des visuels assistés par IA figurent dans la
livraison, et lesquels. Ce n'est pas un aveu. C'est une information dont il a
besoin s'il rediffuse le support.

---

## 6. Accessibilité des visuels générés

Trois obligations, sans exception.

### L'alternative textuelle est rédigée à la main

Depuis **l'image obtenue**, jamais depuis le prompt envoyé. Le prompt décrit
l'intention ; l'alternative doit décrire le résultat. Entre les deux, il y a
toujours un écart — et c'est cet écart que l'utilisateur d'un lecteur d'écran
subirait.

Le réflexe qui marche : décrire l'image à voix haute à quelqu'un au téléphone.
Ce qu'on dit spontanément est la bonne alternative.

### Aucun texte dans l'image

Le prompt l'interdit ; la relecture le vérifie. Un texte résiduel est supprimé à
la retouche. Motif : critère WCAG 1.4.5 — et de toute façon un texte généré est
presque toujours illisible.

### Le contraste est mesuré après superposition

Si un titre se pose sur le visuel, le ratio se calcule entre la couleur du texte
et **la zone effectivement située dessous** — pas la moyenne de l'image. Soit on
réserve une zone unie dans le prompt, soit on applique un voile et on mesure sur
la couleur résultante.

---

## 7. Ce que l'IA ne remplace pas

Elle produit vite une image plausible. Elle ne décide pas :

- **si** un visuel est nécessaire — un module sur-illustré fatigue plus qu'il n'aide ;
- **ce que** le visuel doit faire comprendre ;
- **si** le résultat dit vrai ;
- **comment** le décrire à quelqu'un qui ne le verra pas.

Ces quatre décisions constituent le métier. L'outil accélère l'exécution ; il ne
prend aucune de ces décisions à la place du concepteur.
