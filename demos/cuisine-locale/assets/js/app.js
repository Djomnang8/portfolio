/**
 * app.js — Socle commun à toutes les pages.
 *
 * Contient le panier, les favoris, le menu mobile et les utilitaires de
 * formatage. Chargé partout, après donnees.js.
 *
 * Le stockage passe par localStorage, toujours sous try/catch : en navigation
 * privée, ou quand le navigateur bloque le stockage, la lecture lève une
 * exception. Le site doit rester utilisable dans ce cas — le panier vit alors
 * le temps de la visite au lieu d'être perdu avec une page blanche.
 */

'use strict';

/* ---------- Formatage ---------- */

/** 1500 -> « 1 500 FCFA ». Espace insécable : le prix ne se coupe jamais en fin de ligne. */
function prixFCFA(montant) {
  return `${Number(montant).toLocaleString('fr-FR').replace(/ | | /g, ' ')} FCFA`;
}

const platParId = (id) => PLATS.find((p) => p.id === id);
const categorieParId = (id) => CATEGORIES.find((c) => c.id === id);

/* ---------- Stockage tolérant aux pannes ---------- */

const Stockage = {
  lire(cle, defaut) {
    try {
      const brut = localStorage.getItem(cle);
      return brut === null ? defaut : JSON.parse(brut);
    } catch (e) {
      return defaut;
    }
  },
  ecrire(cle, valeur) {
    try {
      localStorage.setItem(cle, JSON.stringify(valeur));
      return true;
    } catch (e) {
      // Quota dépassé ou stockage refusé : l'état reste en mémoire pour la
      // durée de la page. On ne casse rien, on ne ment pas non plus.
      return false;
    }
  },
};

/* ---------- Panier ---------- */

const CLE_PANIER = 'cl-panier';

const Panier = {
  /** @returns {Object<string, number>} identifiant de plat -> quantité */
  contenu() {
    const brut = Stockage.lire(CLE_PANIER, {});
    // Un plat retiré du catalogue ne doit pas rester dans un panier existant :
    // il n'a plus de prix, et le total deviendrait faux.
    const propre = {};
    for (const [id, q] of Object.entries(brut)) {
      if (platParId(id) && Number.isFinite(q) && q > 0) propre[id] = Math.min(Math.floor(q), 99);
    }
    return propre;
  },

  enregistrer(contenu) {
    Stockage.ecrire(CLE_PANIER, contenu);
    document.dispatchEvent(new CustomEvent('panier:change'));
  },

  ajouter(id, quantite = 1) {
    if (!platParId(id)) return false;
    const c = this.contenu();
    c[id] = Math.min((c[id] || 0) + quantite, 99);
    this.enregistrer(c);
    return true;
  },

  definir(id, quantite) {
    const c = this.contenu();
    if (quantite <= 0) delete c[id];
    else c[id] = Math.min(Math.floor(quantite), 99);
    this.enregistrer(c);
  },

  retirer(id) {
    const c = this.contenu();
    delete c[id];
    this.enregistrer(c);
  },

  vider() { this.enregistrer({}); },

  /** Nombre total d'articles, pas de lignes. */
  nombreArticles() {
    return Object.values(this.contenu()).reduce((s, q) => s + q, 0);
  },

  /** Lignes détaillées, prêtes à afficher. */
  lignes() {
    return Object.entries(this.contenu()).map(([id, quantite]) => {
      const plat = platParId(id);
      return { plat, quantite, sousTotal: plat.prix * quantite };
    });
  },

  sousTotal() {
    return this.lignes().reduce((s, l) => s + l.sousTotal, 0);
  },

  /**
   * Frais de livraison pour un quartier donné.
   * Au-delà de LIVRAISON_OFFERTE, la livraison est gratuite — la règle est
   * appliquée ici, à un seul endroit, pour que le panier et la page de
   * commande ne puissent pas afficher deux totaux différents.
   */
  fraisLivraison(nomQuartier) {
    const q = QUARTIERS.find((x) => x.nom === nomQuartier);
    if (!q) return null;
    return this.sousTotal() >= LIVRAISON_OFFERTE ? 0 : q.frais;
  },

  total(nomQuartier) {
    const frais = this.fraisLivraison(nomQuartier);
    return this.sousTotal() + (frais === null ? 0 : frais);
  },
};

/* ---------- Favoris ---------- */

const CLE_FAVORIS = 'cl-favoris';

const Favoris = {
  liste() {
    const l = Stockage.lire(CLE_FAVORIS, []);
    return Array.isArray(l) ? l.filter(platParId) : [];
  },
  contient(id) { return this.liste().includes(id); },
  basculer(id) {
    const l = this.liste();
    const i = l.indexOf(id);
    if (i === -1) l.push(id); else l.splice(i, 1);
    Stockage.ecrire(CLE_FAVORIS, l);
    document.dispatchEvent(new CustomEvent('favoris:change'));
    return this.contient(id);
  },
};

/* ---------- Notification ---------- */

let minuteurNotification = null;

/**
 * Affiche un message bref. La zone porte role="status" : un lecteur d'écran
 * l'annonce sans voler le focus, contrairement à une alerte.
 */
function notifier(texte) {
  let zone = document.getElementById('notification');
  if (!zone) {
    zone = document.createElement('div');
    zone.id = 'notification';
    zone.className = 'notification';
    zone.setAttribute('role', 'status');
    zone.setAttribute('aria-live', 'polite');
    document.body.appendChild(zone);
  }
  zone.textContent = texte;
  zone.hidden = false;
  clearTimeout(minuteurNotification);
  minuteurNotification = setTimeout(() => { zone.hidden = true; }, 2600);
}

/* ---------- Fragments de page ---------- */

/** Met à jour la pastille du panier dans l'en-tête. */
function rafraichirPastille() {
  const n = Panier.nombreArticles();
  document.querySelectorAll('[data-pastille-panier]').forEach((el) => {
    el.textContent = n;
    el.hidden = n === 0;
  });
  document.querySelectorAll('[data-libelle-panier]').forEach((el) => {
    el.textContent = n === 0 ? 'Panier vide' : `Panier : ${n} article${n > 1 ? 's' : ''}`;
  });
}

/** Construit la carte d'un plat. Utilisée par l'accueil, le menu et les suggestions. */
function cartePlat(plat) {
  const favori = Favoris.contient(plat.id);
  const li = document.createElement('li');
  li.className = 'plat';
  li.dataset.id = plat.id;
  li.innerHTML = `
    <div class="plat__media">
      <img src="assets/img/plats/${plat.image}" alt="${plat.alt}" loading="lazy" decoding="async" width="400" height="300">
      ${plat.populaire ? '<span class="etiquette etiquette--populaire">Populaire</span>' : ''}
      <button type="button" class="favori" data-favori="${plat.id}"
              aria-pressed="${favori}"
              aria-label="${favori ? 'Retirer' : 'Ajouter'} ${plat.nom} des favoris">${favori ? '★' : '☆'}</button>
    </div>
    <div class="plat__corps">
      <h3 class="plat__titre"><a href="plat.html?id=${plat.id}">${plat.nom}</a></h3>
      <p class="plat__resume">${plat.resume}</p>
      <div class="plat__bas">
        <span class="prix">${prixFCFA(plat.prix)}</span>
        <button type="button" class="btn btn--principal btn--petit" data-ajouter="${plat.id}">Ajouter</button>
      </div>
    </div>`;
  return li;
}

/* ---------- Démarrage ---------- */

document.addEventListener('DOMContentLoaded', () => {
  rafraichirPastille();

  // Menu mobile
  const bouton = document.querySelector('.bouton-menu');
  const nav = document.querySelector('.nav');
  if (bouton && nav) {
    bouton.addEventListener('click', () => {
      const ouvert = nav.classList.toggle('ouvert');
      bouton.setAttribute('aria-expanded', String(ouvert));
    });
  }

  // Un seul écouteur pour toute la page : les cartes ajoutées après coup
  // (filtrage du menu) fonctionnent sans qu'on ait à les rebrancher.
  document.addEventListener('click', (e) => {
    const ajout = e.target.closest('[data-ajouter]');
    if (ajout) {
      const plat = platParId(ajout.dataset.ajouter);
      if (Panier.ajouter(plat.id)) notifier(`${plat.nom} ajouté au panier`);
      return;
    }
    const fav = e.target.closest('[data-favori]');
    if (fav) {
      const plat = platParId(fav.dataset.favori);
      const actif = Favoris.basculer(plat.id);
      fav.setAttribute('aria-pressed', String(actif));
      fav.textContent = actif ? '★' : '☆';
      fav.setAttribute('aria-label', `${actif ? 'Retirer' : 'Ajouter'} ${plat.nom} des favoris`);
      notifier(actif ? `${plat.nom} ajouté aux favoris` : `${plat.nom} retiré des favoris`);
    }
  });

  document.addEventListener('panier:change', rafraichirPastille);

  // Année du pied de page, pour ne pas avoir à la corriger chaque janvier.
  document.querySelectorAll('[data-annee]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
