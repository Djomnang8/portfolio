# Rapport d'audit — Fiche de cours « Structurer un document Word accessible »

**Référentiel :** WCAG 2.1 niveau AA · **Date :** 27 août 2026 · **Auditeur :** Joyce Djomnang
**Support audité :** [`avant/index.html`](../avant/index.html) — fiche de cours HTML, un écran
**Support corrigé :** [`apres/index.html`](../apres/index.html)

---

## 1. Résultat en une ligne

> **20 non-conformités**, dont **4 bloquantes**. Le support est inutilisable au clavier,
> illisible sur mobile, et sa structure est vide pour un lecteur d'écran.

Aucun de ces défauts n'est exotique. Tous ont été observés sur de vrais supports
pédagogiques en production, et la plupart sont **invisibles** pour la personne qui
les a créés : le support paraît propre sur l'écran de son auteur.

---

## 2. Mesures avant / après

Les deux versions ont été mesurées avec **le même outil**
([`tests/audit-page.js`](tests/audit-page.js)), dans les mêmes conditions.

| Indicateur | Avant | Après | Évolution |
| --- | ---: | ---: | --- |
| Non-conformités détectées automatiquement | **46** | **0** | −46 |
| Textes dont le contraste échoue | **37 / 37** | **0 / 65** | 100 % corrigés |
| Ratio de contraste moyen | **2,36:1** | **11,93:1** | **× 5,05** |
| Ratio de contraste minimum | **1,33:1** | **5,37:1** | seuil AA franchi |
| Images sans alternative | 2 | 0 | — |
| Champs sans étiquette | 3 | 0 | — |
| Cibles sous 24 × 24 px | 3 | 0 | — |
| Vrais titres dans le document | **0** | **14** | — |
| Éléments interactifs avec un focus visible | **0 / 8** | **12 / 12** | — |
| Éléments interactifs totalement inatteignables au clavier | **2 / 8** | **0 / 12** | — |
| Largeur de rendu sur un écran de 320 px | **1 140 px** | **320 px** | plus de zoom forcé |

**Le chiffre le plus parlant :** sur un téléphone de 320 px, la version d'origine
force une largeur de 1 140 px. Le navigateur réduit donc la page à **28 % de son
échelle**. Le texte de 13 px s'affiche à **3,6 px physiques**. Le titre principal,
à 7,3 px.

Ce n'est pas « peu confortable ». C'est illisible pour tout le monde.

---

## 3. Les 20 non-conformités

**Gravité :** *bloquant* = la fonction est inaccessible · *majeur* = accessible mais
fortement dégradé · *mineur* = confort.

### Bloquantes

#### C-06 — Le focus clavier est supprimé, et deux boutons n'en sont pas

| | |
| --- | --- |
| **Critères** | 2.4.7 Visibilité du focus · 2.1.1 Clavier · 4.1.2 Nom, rôle, valeur |
| **Gravité** | 🔴 Bloquant |

**Constaté.** La feuille de style contient `*:focus { outline: none; }`. Par ailleurs,
les deux boutons « Styles » et « Envoyer » sont des `<div>` et `<span>` porteurs d'un
`onclick`.

**Impact.** Une personne navigant au clavier ne voit jamais où elle se trouve : le
focus est invisible sur les 8 éléments interactifs de la page. Pire, les 2 faux
boutons ne sont pas focusables du tout. Le formulaire est donc **impossible à
soumettre sans souris**, et la galerie de styles impossible à ouvrir.

**Correctif.** Anneau de focus de 3 px avec 3 px de décalage, contrasté à 5,02:1.
Les faux boutons sont devenus de vrais `<button>`, avec `aria-expanded` pour celui
qui déploie la galerie.

---

#### C-01 — Le document n'a aucun titre réel

| | |
| --- | --- |
| **Critères** | 1.3.1 Information et relations · 2.4.6 En-têtes et étiquettes |
| **Gravité** | 🔴 Bloquant |

**Constaté.** **0 titre** dans le document. Les 9 intertitres visuels sont des `<div>`
stylés (`.gros-titre`, `.sous`, `.petit-titre`).

**Impact.** Le sommaire est vide. Une personne aveugle ne peut pas sauter de section
en section : elle doit écouter la totalité du support en linéaire pour trouver
l'information qu'elle cherche. C'est le défaut le plus courant des supports de cours,
et le plus invisible — le rendu visuel est identique.

**Correctif.** 14 vrais titres, un seul `<h1>`, aucun saut de niveau. L'apparence
n'a pas changé : la taille vient du CSS, pas de la balise.

---

#### C-17 — Un compte à rebours ferme les inscriptions

| | |
| --- | --- |
| **Critère** | 2.2.1 Réglage du délai |
| **Gravité** | 🔴 Bloquant |

**Constaté.** Un `setInterval` décompte 5 minutes avant fermeture des inscriptions.
Aucun moyen de l'arrêter, de l'allonger ou de le désactiver.

**Impact.** Une personne utilisant un lecteur d'écran met deux à trois fois plus de
temps à remplir un formulaire. Une personne avec un trouble moteur, davantage encore.
Le délai les exclut mécaniquement.

**Correctif.** Compte à rebours supprimé. L'information de délai subsiste sous forme
de **date fixe** : « Inscriptions ouvertes jusqu'au 10 septembre inclus. »

---

#### C-14 — Largeur fixe de 1 100 px, aucune balise viewport

| | |
| --- | --- |
| **Critères** | 1.4.10 Redistribution · 1.4.4 Redimensionnement du texte |
| **Gravité** | 🔴 Bloquant |

**Constaté.** `body { width: 1100px }` et aucune balise `<meta name="viewport">`.

**Impact.** Sur un écran de 320 px, la page est rendue à 28 % de son échelle : texte
courant à 3,6 px, titre principal à 7,3 px. En France comme à Madagascar, la majorité
des consultations de supports de formation se fait sur téléphone.

**Correctif.** `max-width` en `rem`, grille qui repasse sur une colonne sous 60 rem,
balise viewport ajoutée. Mesuré à 320 px : `scrollWidth` = 320 px, aucun débordement.

---

### Majeures

#### C-04 — 37 textes sur 37 échouent au contraste

| | |
| --- | --- |
| **Critère** | 1.4.3 Contraste minimum |
| **Gravité** | 🟠 Majeur |

**Constaté.** Ratio moyen **2,36:1**, minimum **1,33:1**. Le corps de texte est en
`#999` sur blanc (2,85:1), les intertitres en `#b8c0cc` (1,83:1), et les libellés de
bouton en blanc sur `#cfe0ff` — **1,33:1**, à la limite de l'invisible.

**Impact.** Aucun texte du support n'atteint le seuil AA. Le support est illisible
pour une personne malvoyante, pour une personne de plus de 55 ans, et pour n'importe
qui en extérieur.

**Correctif.** Palette du Kit Design Pédagogique, dont chaque paire est vérifiée.
Résultat mesuré : ratio moyen 11,93:1, minimum 5,37:1, 0 échec sur 65 textes.

---

#### C-05 — Le statut n'est porté que par la couleur

| | |
| --- | --- |
| **Critère** | 1.4.1 Utilisation de la couleur |
| **Gravité** | 🟠 Majeur |

**Constaté.** Le tableau récapitulatif indique l'avancement par une pastille `●`
verte ou rouge. Une légende précise « Vert = fait, rouge = à faire ».

**Impact.** Environ 8 % des hommes présentent une déficience de la vision des
couleurs. Pour eux, les quatre lignes sont identiques. Un lecteur d'écran, lui,
annonce quatre fois « point noir moyen » — la légende ne sert à rien puisque la
couleur n'est pas restituée.

**Correctif.** Couleur **+ pictogramme + texte** : « ✓ Fait » / « ✕ À faire ».

---

#### C-07 — Trois champs de formulaire sans étiquette

| | |
| --- | --- |
| **Critères** | 3.3.2 Étiquettes ou instructions · 1.3.1 |
| **Gravité** | 🟠 Majeur |

**Constaté.** Les libellés « Nom », « Email », « Nombre de participants » sont des
`<p>` placés au-dessus des champs, sans `<label for>`.

**Impact.** Le lecteur d'écran annonce « zone d'édition » trois fois de suite, sans
dire laquelle. Et cliquer sur le libellé ne place pas le curseur dans le champ.

**Correctif.** Un `<label for>` par champ, un `id` sur chaque champ.

---

#### C-10 — Aucun retour d'erreur sur le formulaire

| | |
| --- | --- |
| **Critères** | 3.3.1 Identification des erreurs · 3.3.3 Suggestion après erreur · 4.1.3 Messages de statut |
| **Gravité** | 🟠 Majeur |

**Constaté.** Le bouton déclenche `alert('Envoyé')`. Aucune validation, aucun message
d'erreur, aucune région live.

**Correctif.** Validation avec message explicite dans une région `role="status"` :
« ✕ 3 champs sont à corriger », chaque erreur liée au champ concerné par une ancre,
`aria-invalid` positionné, et le focus déplacé sur le message.

---

#### C-03 — Le tableau n'a ni en-têtes déclarés ni légende

| | |
| --- | --- |
| **Critère** | 1.3.1 Information et relations |
| **Gravité** | 🟠 Majeur |

**Constaté.** Les cellules d'en-tête sont des `<td><b>`. Pas de `<th>`, pas de
`scope`, pas de `<caption>`, pas de `<thead>`.

**Impact.** Le lecteur d'écran ne peut pas annoncer « Statut : À faire » en
parcourant les lignes. L'utilisateur entend une suite de valeurs sans savoir à quelle
colonne elles appartiennent.

**Correctif.** `<caption>`, `<thead>`, `<th scope="col">` et `<th scope="row">`.

---

#### C-02 — Deux images sans alternative textuelle

| | |
| --- | --- |
| **Critère** | 1.1.1 Contenu non textuel |
| **Gravité** | 🟠 Majeur |

**Constaté.** `<img src="logo.png">` et `<img src="capture-word.png" width="420">`.
Aucun attribut `alt`.

**Impact.** Le lecteur d'écran annonce le nom du fichier. La capture d'écran, qui
montre l'emplacement exact de la fonction enseignée, n'est accessible à personne
d'autre qu'aux voyants.

**Correctif.** Le logo est décoratif — le nom de l'organisme figure à côté :
`alt=""`. La capture est informative : alternative descriptive rédigée, plus une
`<figcaption>`.

---

#### C-16 — Un `<marquee>` défile en boucle

| | |
| --- | --- |
| **Critères** | 2.2.2 Mettre en pause, arrêter, masquer · 4.1.1 |
| **Gravité** | 🟠 Majeur |

**Constaté.** Une annonce défile horizontalement, en boucle, sans commande d'arrêt.

**Impact.** Un texte en mouvement est illisible pour une personne dyslexique et
difficile à suivre pour tout le monde. Il capte l'attention en permanence, ce qui
pénalise particulièrement les troubles de l'attention. La balise est par ailleurs
obsolète depuis HTML 4.

**Correctif.** Encadré statique. L'information est plus lisible et reste consultable
autant de temps qu'il faut.

---

#### C-15 — Texte à 13 px, interlignage à 1,2

| | |
| --- | --- |
| **Critères** | 1.4.4 · 1.4.8 · 1.4.12 Espacement du texte |
| **Gravité** | 🟠 Majeur |

**Constaté.** `font-size: 13px` et `line-height: 1.2` sur le `<body>` — soit
15,6 px d'interligne pour 13 px de texte. Certains blocs descendent à 11 px.

**Correctif.** 18 px de base, interlignage 1,6, jamais moins de 16 px nulle part.

---

### Mineures

#### C-12 — Trois liens intitulés « ici » ou « cliquez ici »

| | |
| --- | --- |
| **Critère** | 2.4.4 Fonction du lien |
| **Gravité** | 🟡 Mineur |

**Constaté.** « cliquez ici », « ici », « ici ».

**Impact.** Un lecteur d'écran permet de lister les liens d'une page. La liste
affiche ici trois fois le même mot vide de sens.

**Correctif.** Intitulés explicites, compréhensibles hors contexte :
« Documentation Microsoft sur l'accessibilité dans Word », « RGAA 4.1 — référentiel
français d'accessibilité », « W3C Web Accessibility Initiative ».

---

#### C-19 — Trois cibles de 155 × 23 px

| | |
| --- | --- |
| **Critère** | 2.5.8 Taille de la cible |
| **Gravité** | 🟡 Mineur |

**Constaté.** Les trois champs du formulaire font 23 px de haut, sous le seuil de 24.
**Correctif.** 44 px partout.

---

#### C-13 — Pas de lien d'évitement

| | |
| --- | --- |
| **Critère** | 2.4.1 Contournement de blocs |
| **Gravité** | 🟡 Mineur |

**Correctif.** Lien « Aller directement au contenu » en premier élément focusable.

---

#### C-20 — Déclaration du document incomplète

| | |
| --- | --- |
| **Critères** | 3.1.1 Langue de la page · 2.4.2 Titre de page · 4.1.1 |
| **Gravité** | 🟡 Mineur |

**Constaté.** Pas de `<!DOCTYPE>`, pas d'attribut `lang`, pas de `<meta charset>`,
et un `<title>` réduit à « Fiche ».

**Impact.** Sans `lang="fr"`, un lecteur d'écran configuré en anglais prononce le
texte français avec la phonétique anglaise — le contenu devient incompréhensible.
Le titre « Fiche » ne permet de retrouver l'onglet ni dans un historique ni dans une
liste de favoris.

**Correctif.** `<!DOCTYPE html>`, `lang="fr"`, `<meta charset="utf-8">`,
titre explicite.

---

#### C-08 · C-09 · C-11 · C-18 — Quatre défauts de finition

| Réf. | Critère | Constaté | Correctif |
| --- | --- | --- | --- |
| **C-08** | 3.3.2 | Aucun format attendu indiqué sur les champs | Aide liée par `aria-describedby` |
| **C-09** | 1.3.5 Identifier la finalité des champs | Pas d'`autocomplete` sur nom et adresse électronique | `autocomplete="name"` et `"email"` |
| **C-11** | 1.3.1 | La ligne « Module 3 • Durée 18 min • Niveau débutant » est un texte plat séparé par des puces | Liste de définitions `<dl>`, qui exprime la relation clé/valeur |
| **C-18** | 1.4.8 | Lignes de 130 caractères dans la colonne principale | Largeur bornée à 68 caractères |

---

## 4. Ce que l'audit automatique n'a pas vu

L'outil a détecté **46 problèmes**. Il en a manqué plusieurs, qui n'ont été trouvés
qu'à la main :

| Défaut | Pourquoi l'automatique passe à côté |
| --- | --- |
| **Les 9 faux titres** | Un `<div>` stylé est un `<div>` valide. Aucune règle ne peut deviner qu'il *devrait* être un titre |
| **Le compte à rebours** | Un `setInterval` est du JavaScript légitime. Seul un humain voit qu'il impose un délai |
| **Les liens « ici »** | Un lien avec du texte est un lien valide. Juger de sa pertinence demande de comprendre le sens |
| **Le statut par couleur seule** | L'outil mesure le contraste de la pastille, pas le fait qu'elle porte seule l'information |
| **Le `<marquee>`** | Détectable par une règle dédiée, mais aucun contrôle générique ne le signale |
| **La pertinence des alternatives** | L'outil vérifie la **présence** de l'attribut, jamais sa **qualité** |

C'est l'ordre de grandeur admis dans le métier : **l'automatique couvre environ 30 %
des non-conformités**. Un rapport qui se limite à un score Lighthouse vert ne prouve
pas l'accessibilité — il prouve seulement qu'aucune erreur grossière n'a été commise.

---

## 5. Reproduire cet audit

```bash
node audit-accessibilite-supports-pedagogiques/serveur-local.js
```

- Version d'origine : http://localhost:4174/avant/index.html
- Version corrigée : http://localhost:4174/apres/index.html

Ouvrir la console du navigateur (F12) et y coller
[`audit/tests/audit-page.js`](tests/audit-page.js). Le script fonctionne sur
n'importe quelle page web.

**Test manuel, 30 secondes :** posez votre souris. Sur la version d'origine, essayez
d'atteindre le bouton « Envoyer » avec `Tab`. C'est impossible.

---

## 6. Limites de cet audit

1. **Un seul écran** a été audité. Un support complet en compte des dizaines.
2. **Le test au lecteur d'écran reste à faire.** Le protocole est prêt dans
   [`tests/protocole-nvda.md`](tests/protocole-nvda.md). Les impacts décrits ici sont
   déduits des critères, pas constatés à l'écoute.
3. **Aucun test utilisateur.** Aucune personne en situation de handicap n'a utilisé
   ces deux versions. C'est la limite la plus sérieuse.
4. **Le support d'origine est une reconstitution.** Il reproduit des défauts observés
   en production, mais ce n'est pas le support d'un client réel — un dépôt public ne
   peut pas exposer le travail d'un tiers sans son accord.
