# Les démos du portfolio

Quatorze projets se lancent directement depuis le portfolio, sans installation,
sans compte et sans serveur à démarrer. C'est le point qui change tout :
un recruteur ne clonera pas quatorze dépôts pour vérifier si le travail tient.

Chaque bouton « Lancer la démo » ouvre l'application **dans un nouvel onglet** :
le portfolio reste ouvert derrière, et revenir ne coûte pas de retrouver sa
place dans la grille. Le lien porte `rel="noopener"` et une mention
« (nouvel onglet) » masquée visuellement — un changement de fenêtre doit être
annoncé à qui ne le voit pas se produire.

| Démo | Ce qu'on peut faire | Sans serveur ? |
|---|---|---|
| [Atelier de marque](demos/atelier-marque/) | Lire la charte, voir la construction du logo, les 17 contrastes recalculés | Recalcul dans le navigateur |
| [Sanaga](demos/sanaga/) | Composer une armée, la placer, lancer le combat | Le moteur tourne dans l'onglet |
| [Cuisine Locale](demos/cuisine-locale/) | Filtrer la carte, remplir un panier, commander, réserver une table | Panier et validations dans le navigateur |
| [Fait Main](demos/fait-main/) | Lire les 6 articles, parcourir les numéros de la lettre, basculer le thème | Site généré, entièrement statique |
| [Module e-learning](demos/module-a11y/) | Suivre les 7 écrans, jouer les 4 exercices | Entièrement statique |
| [Kit design](demos/kit-design/) | Voir les 20 paires de contraste recalculées à l'affichage | Entièrement statique |
| [Audit accessibilité](demos/audit-a11y/) | Comparer avant / après, remplir la grille des 38 points | Entièrement statique |
| [Entrepôt de données](demos/entrepot-bi/) | Lire le tableau de bord produit par le pipeline | HTML généré, autonome |
| [Banc d'essai RAG](demos/rag-bench/rapport.html) | Comparer les 6 configurations mesurées | Rapport autonome |
| [Gestion des stocks](demos/stock/) | Piloter le stock, commander, contrôler la cohérence | Dépôt local, mêmes règles |
| [Assistant Ops](demos/assistant-ops/) | Poser une question, voir l'outil appelé, confirmer une action sensible | L'agent tourne dans l'onglet |
| [BuildTrack](demos/buildtrack/) | Chantiers, tâches, stock, dépenses | Bascule sur `localStorage` |
| [DevisPro](demos/devispro/) | Devis, factures, encaissements | Bascule sur `localStorage` |
| [MecaTrack](demos/mecatrack/) | Interventions, pièces, QR | Bascule sur `localStorage` |

Comptes de démonstration pour les trois dernières : `admin@demo.cm` /
`Demo1234`.

---

## Comment c'est fabriqué

Netlify ne déploie qu'un seul dépôt : il n'a **aucun accès aux dépôts
voisins**. Le dossier `demos/` est donc versionné ici — mais c'est un produit
de construction, jamais édité à la main.

```bash
node outils/construire-demos.js            # tout reconstruire
node outils/construire-demos.js stock      # une seule démo
```

Le script lit `outils/demos.json`, va chercher chaque application dans son
dépôt d'origine — qui reste la seule source de vérité — et produit :

- `demos/<slug>/…` l'application, servie sous `/demos/<slug>/` ;
- `demos/index.json` l'inventaire, avec le poids réel de chaque démo ;
- `_redirects` les règles de routage Netlify.

Quatre modes de fabrication :

| Mode | Ce qu'il fait | Démos concernées |
|---|---|---|
| `copie` | Recopie les fichiers statiques | Sanaga, Cuisine Locale, Atelier de marque, et les cinq autres statiques |
| `node` | Lance le générateur du dépôt avec un préfixe et un dossier de sortie | Fait Main |
| `vite` | `vite build --base=/demos/<slug>/` | Assistant Ops, BuildTrack, DevisPro |
| `angular` | `ng build --base-href=/demos/<slug>/` | MecaTrack |

Le `--base` n'est pas un détail : sans lui, le HTML produit pointe vers
`/assets/…` et la démo affiche une page blanche dès qu'elle n'est pas à la
racine du domaine. Côté application, le routeur lit ce même préfixe
(`import.meta.env.BASE_URL` en React et Vue, `<base href>` en Angular), ce qui
permet à chacune de fonctionner à la racine d'un domaine comme dans un
sous-répertoire — sans code conditionnel.

Le mode `node` applique le même principe à un générateur maison, sans passer par
npm :

```
node outils/build-site.js --base=/demos/fait-main --sortie=dist-demo
```

La sortie va dans un dossier à part, jamais dans le dépôt d'origine : le blog
reste servi à la racine de son propre domaine, et la version préfixée n'existe
que le temps d'être recopiée ici. Les `robots.txt` et `sitemap.xml` produits sont
supprimés au passage — sous `/demos/`, ils feraient double emploi avec ceux du
portfolio, et un second `robots.txt` n'est de toute façon jamais lu.

## Les règles de routage

Les trois applications à routage interne ont besoin de recevoir leur propre
`index.html` pour toute route profonde :

```
/demos/buildtrack/*   /demos/buildtrack/index.html   200
```

Le code **200** compte : une redirection 301 changerait l'URL affichée et
casserait la navigation arrière. Sans cette règle, recharger la page sur
`/demos/devispro/factures` renvoie 404.

`serveur-local.js` applique exactement le même repli, et **seulement pour ces
trois-là** : pour une démo statique, un fichier absent doit rester un 404 en
local comme en ligne, sinon le serveur de développement masque des liens
cassés jusqu'au déploiement.

## Le mode dégradé, et pourquoi il compte

Six démos ont normalement besoin d'une API. Aucune n'en a besoin ici : elles
sondent leur serveur au démarrage et, sans réponse, basculent sur une version
locale qui applique **les mêmes règles**, refus compris.

Pour la gestion des stocks, cela va jusqu'au bout : le dépôt local du
navigateur refuse une sortie supérieure au stock (409), refuse une quantité
négative (400), engage le stock avant d'enregistrer la commande, et sait
recalculer le contrôle de cohérence. La console ne sait pas lequel des deux
dépôts elle utilise — c'est ce qui garantit que la démonstration se comporte
comme le produit, et non « à peu près comme ».

---

## Mise en ligne

Le portfolio est un site statique, sans build :

```bash
git add . && git commit -m "..." && git push origin main
```

Netlify redéploie automatiquement. Publish directory : `.`, aucune commande de
build.

## Ajouter une démo

1. Ajouter une entrée dans `outils/demos.json`.
2. `node outils/construire-demos.js <slug>`.
3. Ajouter le lien sur la carte du projet dans `index.html` :

   ```html
   <a href="demos/<slug>/" class="project__link project__link--demo"
      target="_blank" rel="noopener"
      >&#9654; Lancer la démo<span class="sr-only"> (nouvel onglet)</span></a>
   ```

4. Placer la carte dans `outils/ordonner-projets.js`, puis :

   ```bash
   node outils/ordonner-projets.js --verifier   # contrôle, sans rien écrire
   node outils/ordonner-projets.js              # applique l'ordre
   ```

   Le script refuse de réécrire la page si une carte manque à la liste ou si un
   titre de la liste est introuvable : une carte perdue en silence est
   exactement le défaut qu'il doit empêcher.

5. Commiter `demos/`, `_redirects` et `index.html` ensemble.

Une démo dont la construction échoue disparaît de `demos/index.json` au lieu
d'y laisser un lien mort.

---

## Ce qui n'a pas de démo, et pourquoi

| Projet | Raison |
|---|---|
| `energytrack-api` | API pure — la documentation `/docs` **est** l'interface ; déployable sur Render en quelques minutes |
| `factures-insights` | Streamlit : demande un exécuteur Python, pas hébergeable en statique |
| `websec-audit` | Outil en ligne de commande ; le rapport HTML produit peut être publié tel quel |
| `docurag` | Le frontend n'a pas de mode dégradé : sans serveur, il n'a rien à afficher |
| `api-contrat-reference` | Deux implémentations à lancer côte à côte ; le rapport de conformité tient lieu de preuve |

`assistant-ops` était dans ce cas ; il n'y est plus. Plutôt qu'un dépôt local
écrit à part, l'application web **importe les sources du serveur** — `Session`,
le catalogue d'outils, les schémas de validation, le portefeuille — et les
exécute dans l'onglet. Il n'y a donc pas deux implémentations à maintenir : la
démonstration hors ligne ne peut pas diverger du produit, puisque c'est le même
code.

Trois obstacles ont dû être levés côté serveur, tous par des changements qui
l'améliorent :

- `config.ts` lisait `process.env` et chargeait `dotenv` à l'import. Le
  chargement du `.env` appartient désormais à `index.ts`, seul module propre à
  Node ; un module de configuration ne devrait de toute façon pas avoir d'effet
  de bord à l'import.
- `Portefeuille` prenait un **chemin de fichier**. Il prend maintenant le
  **contenu** ; le chargement disque vit dans `donnees-fichier.ts`. Une seule
  implémentation d'analyse pour les deux côtés.
- `agent.ts` importait `node:crypto`. Il utilise `globalThis.crypto`, présent
  des deux côtés, avec un repli qui produit la même forme qu'un UUID — sans quoi
  la validation `z.string().uuid()` des jetons de confirmation échouerait.

Les 54 tests du serveur passent après ces changements.

Reste `docurag`, pour lequel la même approche s'appliquerait.
