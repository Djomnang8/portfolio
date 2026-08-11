# Rendre les projets démarrables depuis le portfolio

Objectif : qu'un recruteur qui ouvre le portfolio puisse **utiliser** MecaTrack,
DevisPro et BuildTrack, et pas seulement lire du code.

Trois niveaux, du plus simple au plus complet. Le niveau 2 suffit dans la
majorité des cas.

---

## Niveau 0 — ce qui est déjà en place

Chaque carte de la section « Projets » de `index.html` pointe vers :

- **Code source** → le dépôt GitHub public ;
- **Lancer en local** → le README du dépôt, qui contient déjà la commande
  `docker compose up --build`, les ports et les comptes de démonstration.

Rien à faire de plus si le recruteur accepte d'installer Docker. La plupart ne
le feront pas : d'où le niveau 1.

---

## Niveau 1 — une démo en ligne cliquable (gratuit, 10 min par projet)

MecaTrack, DevisPro et BuildTrack **fonctionnent sans base de données** : au
démarrage, le frontend interroge `GET /api/health`, et s'il n'obtient pas de
réponse il bascule sur le dépôt local (`localStorage`) avec le même jeu de
données `shared/demo-data.json`.

Conséquence : **le frontend seul, déployé en statique, est une démo complète.**

### Déploiement sur Netlify (à répéter pour chaque projet)

1. Créer un compte sur <https://netlify.com> et le relier à GitHub.
2. **Add new site → Import an existing project → GitHub → choisir le dépôt.**
3. Renseigner :

   | Projet | Base directory | Build command | Publish directory |
   |---|---|---|---|
   | BuildTrack | `frontend` | `npm run build` | `frontend/dist` |
   | DevisPro | `frontend` | `npm run build` | `frontend/dist` |
   | MecaTrack | `frontend` | `npm run build` | `frontend/dist/frontend/browser` |

   MecaTrack est en Angular : la sortie du build est `dist/frontend/browser`
   (vérifié dans `frontend/angular.json`, projet `frontend`).

4. **Deploy site**, puis **Site settings → Change site name** pour obtenir une
   URL lisible : `mecatrack-demo.netlify.app`.

5. Reporter l'URL dans `index.html`, sur la carte du projet :

   ```html
   <a href="https://mecatrack-demo.netlify.app" class="project__link"
      target="_blank" rel="noreferrer">→ Démo en ligne</a>
   ```

   et remplacer la pastille `badge--code` par :

   ```html
   <span class="badge badge--live"><span class="badge__dot"></span>EN LIGNE</span>
   ```

6. Dans la description de la carte, préciser les identifiants de démonstration
   (`admin@demo.cm` / `Demo1234`) pour que la personne puisse se connecter tout
   de suite.

> Vercel, GitHub Pages ou Cloudflare Pages font exactement la même chose avec
> les mêmes trois champs.

---

## Niveau 2 — l'API Django en ligne (pour un poste Python)

Pour un recruteur Python, la démo qui compte est **l'API MecaTrack qui répond
vraiment**. Hébergement gratuit sur Render :

1. <https://render.com> → **New → PostgreSQL** : créer la base, copier l'URL
   interne.
2. **New → Web Service** → dépôt `MecaTrack`, **Root Directory** `backend`.
   - Build : `pip install -r requirements.txt && python manage.py migrate && python manage.py seed_demo`
   - Start : `gunicorn config.wsgi:application`
   - Variables : `DATABASE_URL`, `SECRET_KEY`, `DEBUG=0`,
     `ALLOWED_HOSTS=<sous-domaine>.onrender.com`
3. Ajouter `gunicorn` et `dj-database-url` à `backend/requirements.txt` s'ils
   n'y sont pas, et autoriser l'origine Netlify dans `CORS_ALLOWED_ORIGINS`.
4. Dans le frontend déployé, pointer la variable d'environnement d'API vers
   `https://<sous-domaine>.onrender.com/api`.

Le portfolio peut alors afficher trois liens par projet :
**Démo en ligne** · **API** · **Code source**.

> L'offre gratuite de Render met le service en veille après inactivité : la
> première requête prend ~30 s. Le mode démo local du frontend masque
> entièrement ce délai — c'est justement l'intérêt de l'architecture.

---

## Niveau 3 — les trois projets Python

| Projet | Démo en ligne | Comment |
|---|---|---|
| **energytrack-api** | Render (gratuit) | La documentation `/docs` **est** la démo : le recruteur s'authentifie et appelle les endpoints depuis son navigateur. Build : `pip install -r requirements.txt`, start : `python -m app.seed && uvicorn app.main:application --host 0.0.0.0 --port $PORT`. SQLite suffit — aucune base à provisionner. |
| **factures-insights** | [Streamlit Community Cloud](https://share.streamlit.io) | Connecter le dépôt, fichier principal `app.py`, déployer. Rien d'autre à configurer. |
| **websec-audit** | Pas de démo web | C'est un outil en ligne de commande : le README montre la sortie console, et le rapport HTML produit peut être publié tel quel comme exemple. |

Pour `websec-audit`, une bonne démonstration en entretien consiste à l'exécuter
en direct sur le site du recruteur — l'outil n'a besoin d'aucune installation.

---

## Mise en ligne du portfolio lui-même

Le portfolio est un site statique : aucun build nécessaire.

```bash
git add .
git commit -m "Refonte du portfolio : thèmes clair/sombre et nouvelle grille de projets"
git push origin main
```

Puis sur Netlify : **Import an existing project → dépôt `portfolio`** →
Build command : *(vide)* → Publish directory : `.` → **Deploy**.

---

## Après chaque nouveau projet

1. Dupliquer un bloc `<article class="project">` dans `index.html`.
2. Renseigner : titre, description, `project__tags` (stack), liens, image.
3. Placer la capture dans `assets/projets/` (format paysage, ~640 × 360 px).
4. Commiter et pousser : Netlify redéploie automatiquement.
