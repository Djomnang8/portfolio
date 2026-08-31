# Protocole de test au lecteur d'écran — avant / après

**Statut : à exécuter.** Ce protocole est écrit et prêt ; le test n'a pas encore été
mené. Voir la section 6 de [`../rapport-wcag.md`](../rapport-wcag.md).

L'intérêt de ce protocole est sa forme comparative : **le même parcours, sur les deux
versions**. C'est ce qui transforme une liste de correctifs en démonstration.

---

## Préparation

| | |
| --- | --- |
| **Lecteur d'écran** | NVDA 2024.x — [téléchargement gratuit](https://www.nvaccess.org/download/) |
| **Navigateur** | Firefox |
| **Version A** | http://localhost:4174/avant/index.html |
| **Version B** | http://localhost:4174/apres/index.html |
| **Durée** | Environ 40 minutes pour les deux |

**Raccourcis utiles :** `Insert`+`F7` liste les titres et les liens · `H` titre
suivant · `K` lien suivant · `F` champ de formulaire suivant · `T` tableau suivant ·
`Ctrl` interrompt la lecture.

> Écoutez la version A **en premier**, et jusqu'au bout. La tentation est de passer
> vite parce que c'est pénible. C'est précisément ce qui est à documenter.

---

## Test 1 — Se repérer dans la page

| # | Action | Version A (attendu) | Version B (attendu) | Constaté |
| --- | --- | --- | --- | --- |
| 1.1 | Charger la page | « Fiche » | « Structurer un document Word accessible — Module 3 » | |
| 1.2 | `Insert`+`F7`, onglet Titres | **Liste vide** | 14 titres, hiérarchie complète | |
| 1.3 | `Insert`+`F7`, onglet Repères | Aucun | banner, main, contentinfo | |
| 1.4 | `Tab` une fois | Premier champ du formulaire | « Aller directement au contenu, lien » | |

**Le point à documenter :** en version A, une personne aveugle n'a **aucun moyen** de
savoir ce que contient la page sans tout écouter. C'est la conséquence concrète des
9 faux titres, et c'est le constat le plus parlant de tout l'audit.

---

## Test 2 — La prononciation

| # | Action | Version A | Version B | Constaté |
| --- | --- | --- | --- | --- |
| 2.1 | Écouter un paragraphe avec NVDA réglé en anglais | Le français est prononcé avec la phonétique anglaise | La voix bascule en français | |

Sans `lang="fr"`, « structurer un document » devient inintelligible. À enregistrer si
possible : c'est plus convaincant à l'écoute qu'à la lecture.

---

## Test 3 — Les images

| # | Action | Version A | Version B | Constaté |
| --- | --- | --- | --- | --- |
| 3.1 | Atteindre le logo | « logo.png, graphique » | Ignoré (alternative vide) | |
| 3.2 | Atteindre la capture d'écran | « capture-word.png, graphique » | La description du volet de saisie, puis la légende | |

---

## Test 4 — Le tableau récapitulatif

| # | Action | Version A | Version B | Constaté |
| --- | --- | --- | --- | --- |
| 4.1 | `T` pour atteindre le tableau | Annoncé sans légende | « Avancement des quatre actions du module » | |
| 4.2 | Parcourir les lignes | Suite de valeurs sans en-tête | « Textes de remplacement, Statut : ✕ À faire » | |
| 4.3 | Écouter la colonne Statut | « point noir moyen » × 4 | « Fait » / « À faire » | |

**Le point à documenter :** en version A, la légende « Vert = fait, rouge = à faire »
est parfaitement inutile — la couleur n'est pas restituée. L'information est perdue,
alors qu'elle est visuellement présente.

---

## Test 5 — Le formulaire

| # | Action | Version A | Version B | Constaté |
| --- | --- | --- | --- | --- |
| 5.1 | `F` sur le premier champ | « zone d'édition » | « Nom et prénom, zone d'édition, requis » | |
| 5.2 | Deuxième champ | « zone d'édition » | « Adresse électronique… Elle servira uniquement à confirmer l'inscription » | |
| 5.3 | Atteindre le bouton d'envoi | **Jamais atteint** | « S'inscrire, bouton » | |
| 5.4 | Soumettre vide | Impossible au clavier | « 3 champs sont à corriger », lu automatiquement | |

**Le point à documenter :** en version A, le formulaire est **impossible à soumettre
au clavier**. Ce n'est pas un inconfort : la fonction n'existe pas.

---

## Test 6 — Le compte à rebours

| # | Action | Version A | Version B | Constaté |
| --- | --- | --- | --- | --- |
| 6.1 | Rester sur la page 2 minutes | Le compteur se met à jour chaque seconde | Aucun mouvement | |

À vérifier : NVDA interrompt-il la lecture à chaque mise à jour ? Selon la
configuration, une zone qui change toutes les secondes peut rendre la page
totalement inécoutable.

---

## Test 7 — La galerie de styles (version B uniquement)

| # | Action | Attendu | Constaté |
| --- | --- | --- | --- |
| 7.1 | Atteindre le bouton | « Voir la galerie de styles, bouton, réduit » | |
| 7.2 | Activer | « développé », le libellé devient « Masquer… » | |
| 7.3 | Continuer la lecture | La liste des 4 styles est lue | |

---

## Restitution

| # | Version | Écart constaté | Critère | Gravité | Statut |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

**Ce qui compte le plus dans cette restitution :** noter le **temps** mis pour
accomplir chaque tâche sur les deux versions. « Trouver le formulaire d'inscription »
prend quelques secondes en version B — avec `Insert`+`F7` puis un titre. En version A,
sans plan de document, il faut écouter la page entière.

C'est ce chiffre-là qui convainc une direction, bien plus qu'une liste de critères.
