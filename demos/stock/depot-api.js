/* =============================================================================
   depot-api.js — Le meme contrat, contre les services reels.

   Expose exactement les memes methodes que depot-local.js. La console appelle
   l'un ou l'autre sans savoir lequel : c'est ce qui garantit que la demo hors
   ligne et le produit reel se comportent pareil, et non « a peu pres pareil ».

   Toutes les requetes passent par la passerelle (port 8080 par defaut), jamais
   par les ports internes des services. Une console qui appellerait 8081 et 8082
   directement contournerait la passerelle et masquerait ses defauts — c'est
   d'ailleurs comme cela que la route cassee du depart etait passee inapercue.
   ============================================================================= */

(function () {
  'use strict';

  function DepotApi(base) {
    this.mode = 'api';
    this.base = String(base).replace(/\/+$/, '');
  }

  /**
   * Sonde la passerelle.
   *
   * Le delai est un compromis mesure, pas un chiffre rond. A 1,5 s la sonde
   * echouait regulierement sur une passerelle qui venait de demarrer : Spring
   * Cloud Gateway initialise ses routes a la premiere requete, et celle-ci peut
   * demander deux a trois secondes. La console basculait alors en mode local
   * alors que les services tournaient — le pire des deux mondes, puisque
   * l'utilisateur voyait des donnees fictives sans savoir pourquoi.
   *
   * 3,5 s couvre ce demarrage sans immobiliser quelqu'un qui n'a aucun service
   * en route : dans ce cas la connexion est refusee immediatement, bien avant
   * l'expiration du delai.
   */
  DepotApi.joignable = function (base, delai) {
    var url = String(base).replace(/\/+$/, '') + '/api/products';
    return fetch(url, { signal: AbortSignal.timeout(delai || 3500) })
      .then(function (r) { return r.ok; })
      .catch(function () { return false; });
  };

  DepotApi.prototype._appel = function (chemin, options) {
    var url = this.base + chemin;
    return fetch(url, Object.assign({
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
    }, options || {})).then(function (r) {
      if (r.status === 204) return null;
      return r.text().then(function (t) {
        var corps = null;
        try { corps = t ? JSON.parse(t) : null; } catch (e) { corps = { erreur: t }; }
        if (!r.ok) {
          // On conserve le code HTTP : la console distingue « demande invalide »
          // (400) de « stock insuffisant » (409), et ne dit pas la meme chose.
          var e = new Error((corps && (corps.erreur || corps.message)) || ('HTTP ' + r.status));
          e.code = r.status;
          if (corps) Object.assign(e, corps);
          throw e;
        }
        return corps;
      });
    });
  };

  DepotApi.prototype.produits = function () { return this._appel('/api/products'); };
  DepotApi.prototype.mouvements = function () { return this._appel('/api/mouvements'); };
  DepotApi.prototype.commandes = function () { return this._appel('/api/commandes'); };
  DepotApi.prototype.coherence = function () { return this._appel('/api/products/coherence'); };

  DepotApi.prototype.appliquerMouvement = function (productId, sens, quantite, motif) {
    return this._appel('/api/products/' + productId + '/mouvements', {
      method: 'POST',
      body: JSON.stringify({ sens: sens, quantite: Number(quantite), motif: motif }),
    });
  };

  DepotApi.prototype.commander = function (productId, quantite) {
    return this._appel('/api/commandes', {
      method: 'POST',
      body: JSON.stringify({ productId: productId, quantite: Number(quantite) }),
    });
  };

  DepotApi.prototype.changerStatut = function (id, statut) {
    return this._appel('/api/commandes/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ statut: statut }),
    });
  };

  DepotApi.prototype.reinitialiser = function () {
    // Volontairement absent cote serveur : une console ne doit pas pouvoir vider
    // une base de production d'un clic.
    return Promise.reject(new Error(
      'La reinitialisation n’existe qu’en mode local. Sur les services reels, relancez la pile.'));
  };

  window.DepotApi = DepotApi;
})();
