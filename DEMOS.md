# Les démos du portfolio

Neuf projets se lancent directement depuis le portfolio, sans installation,
sans compte et sans serveur à démarrer. C'est le point qui change tout :
un recruteur ne clonera pas neuf dépôts pour vérifier si le travail tient.

| Démo | Ce qu'on peut faire | Sans serveur ? |
|---|---|---|
| [Module e-learning](demos/module-a11y/) | Suivre les 7 écrans, jouer les 4 exercices | Entièrement statique |
| [Kit design](demos/kit-design/) | Voir les 20 paires de contraste recalculées à l'affichage | Entièrement statique |
| [Audit accessibilité](demos/audit-a11y/) | Comparer avant / après, remplir la grille des 38 points | Entièrement statique |
| [Entrepôt de données](demos/entrepot-bi/) | Lire le tableau de bord produit par le pipeline | HTML généré, autonome |
| [Banc d'essai RAG](demos/rag-bench/rapport.html) | Comparer les 6 configurations mesurées | Rapport autonome |
| [Gestion des stocks](demos/stock/) | Piloter le stock, commander, contrôler la cohérence | Dépôt local, mêmes règles |
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

Trois modes de fabrication :

| Mode | Ce qu'il fait | Démos concernées |
|---|---|---|
| `copie` | Recopie les fichiers statiques | les six premières |
| `vite` | `vite build --base=/demos/<slug>/` | BuildTrack, DevisPro |
| `angular` | `ng build --base-href=/demos/<slug>/` | MecaTrack |

Le `--base` n'est pas un détail : sans lui, le HTML produit pointe vers
`/assets/…` et la démo affiche une page blanche dès qu'elle n'est pas à la
racine du domaine. Côté application, le routeur lit ce même préfixe
(`import.meta.env.BASE_URL` en React et Vue, `<base href>` en Angular), ce qui
permet à chacune de fonctionner à la racine d'un domaine comme dans un
sous-répertoire — sans code conditionnel.

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

Cinq démos ont normalement besoin d'une API. Aucune n'en a besoin ici :
elles sondent leur serveur au démarrage et, sans réponse, basculent sur un
dépôt local qui applique **les mêmes règles**, refus compris.

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
      >&#9654; Lancer la démo</a>
   ```

4. Commiter `demos/`, `_redirects` et `index.html` ensemble.

Une démo dont la construction échoue disparaît de `demos/index.json` au lieu
d'y laisser un lien mort.

---

## Ce qui n'a pas de démo, et pourquoi

| Projet | Raison |
|---|---|
| `energytrack-api` | API pure — la documentation `/docs` **est** l'interface ; déployable sur Render en quelques minutes |
| `factures-insights` | Streamlit : demande un exécuteur Python, pas hébergeable en statique |
| `websec-audit` | Outil en ligne de commande ; le rapport HTML produit peut être publié tel quel |
| `docurag`, `assistant-ops` | Le frontend n'a pas de mode dégradé : sans serveur, il n'a rien à afficher |
| `api-contrat-reference` | Deux implémentations à lancer côte à côte ; le rapport de conformité tient lieu de preuve |

Pour `docurag` et `assistant-ops`, ajouter un dépôt local comme celui de la
gestion des stocks est la suite logique — c'est ce qui les rendrait
démontrables sans rien installer.
