/* =============================================================================
   depot-local.js — Le meme contrat que l'API, execute dans le navigateur.

   Ce depot n'est pas une maquette : il applique les memes regles que le service
   Java, y compris celles qui refusent une operation.

     - une quantite nulle ou negative est refusee (400) ;
     - une sortie superieure au stock est refusee (409) ;
     - chaque changement de quantite produit un mouvement avec stock avant et
       apres ;
     - une commande engage le stock AVANT d'etre enregistree ;
     - une annulation rend la quantite par un mouvement inverse.

   Il expose exactement les memes methodes que depot-api.js. La console ne sait
   pas lequel des deux elle utilise, et n'a aucune raison de le savoir.

   Persistance : localStorage, propre au navigateur du visiteur. Rien ne part
   ailleurs, et un bouton permet de tout remettre a zero.
   ============================================================================= */

(function () {
  'use strict';

  var CLE = 'gestion-stocks.etat.v2';

  function maintenant() { return new Date().toISOString(); }

  /** Erreur portant un code HTTP, pour que la console traite les deux depots
      de la meme facon. */
  function Refus(code, message, extra) {
    var e = new Error(message);
    e.code = code;
    if (extra) Object.assign(e, extra);
    return e;
  }

  function DepotLocal() {
    this.mode = 'local';
    this.etat = this._charger();
  }

  DepotLocal.prototype._charger = function () {
    try {
      var brut = localStorage.getItem(CLE);
      if (brut) return JSON.parse(brut);
    } catch (e) {
      // Navigation privee, stockage desactive, quota plein : on repart d'un jeu
      // neuf en memoire plutot que de laisser la page blanche.
    }
    return this._installer();
  };

  DepotLocal.prototype._sauver = function () {
    try {
      localStorage.setItem(CLE, JSON.stringify(this.etat));
    } catch (e) { /* le stockage n'est pas indispensable au fonctionnement */ }
  };

  DepotLocal.prototype._installer = function () {
    var etat = { produits: [], mouvements: [], commandes: [], seqP: 0, seqM: 0, seqC: 0 };
    this.etat = etat;
    var self = this;
    window.DONNEES_DEMO.articles.forEach(function (a) {
      var p = {
        id: ++etat.seqP, reference: a[0], nom: a[1], categorie: a[2],
        prix: a[3], quantiteStock: 0, seuilAlerte: a[5],
      };
      etat.produits.push(p);
      self._mouvementer(p.id, 'ENTREE', a[4], 'réception fournisseur');
      var sorti = a[4] - a[6];
      if (sorti > 0) self._mouvementer(p.id, 'SORTIE', sorti, 'ventes du mois');
    });
    this._sauver();
    return etat;
  };

  DepotLocal.prototype.reinitialiser = function () {
    this._installer();
    return Promise.resolve();
  };

  /* --------------------------------------------------------- lectures ---- */

  DepotLocal.prototype.produits = function () {
    return Promise.resolve(this.etat.produits.map(function (p) { return Object.assign({}, p); }));
  };

  DepotLocal.prototype.mouvements = function () {
    return Promise.resolve(this.etat.mouvements.slice().reverse());
  };

  DepotLocal.prototype.commandes = function () {
    return Promise.resolve(this.etat.commandes.slice().reverse());
  };

  /* -------------------------------------------------------- ecritures ---- */

  DepotLocal.prototype._mouvementer = function (productId, sens, quantite, motif) {
    quantite = Number(quantite);
    if (!Number.isInteger(quantite) || quantite <= 0) {
      throw Refus(400, 'Quantité invalide : ' + quantite +
        '. Une quantité doit être strictement positive.');
    }
    var p = this.etat.produits.find(function (x) { return x.id === productId; });
    if (!p) throw Refus(404, 'Produit ' + productId + ' introuvable.');

    var avant = p.quantiteStock;
    var apres = sens === 'ENTREE' ? avant + quantite : avant - quantite;
    if (apres < 0) {
      throw Refus(409, 'Stock insuffisant : ' + quantite + ' demandée(s), ' + avant + ' disponible(s).',
        { disponible: avant, demande: quantite });
    }

    p.quantiteStock = apres;
    var m = {
      id: ++this.etat.seqM, productId: productId, sens: sens, quantite: quantite,
      stockAvant: avant, stockApres: apres,
      motif: motif && String(motif).trim() ? String(motif) : 'non précisé',
      horodatage: maintenant(),
    };
    this.etat.mouvements.push(m);
    return m;
  };

  DepotLocal.prototype.appliquerMouvement = function (productId, sens, quantite, motif) {
    var self = this;
    return new Promise(function (resoudre, rejeter) {
      try {
        var m = self._mouvementer(productId, sens, quantite, motif);
        self._sauver();
        resoudre(m);
      } catch (e) { rejeter(e); }
    });
  };

  DepotLocal.prototype.commander = function (productId, quantite) {
    var self = this;
    return new Promise(function (resoudre, rejeter) {
      quantite = Number(quantite);
      if (!Number.isInteger(quantite) || quantite <= 0) {
        rejeter(Refus(400, 'La quantité doit être strictement positive.'));
        return;
      }
      var p = self.etat.produits.find(function (x) { return x.id === productId; });
      if (!p) { rejeter(Refus(400, 'Produit ' + productId + ' introuvable.')); return; }

      // Le stock est engage d'abord, comme cote serveur : une commande
      // enregistree sans sortie de stock vend deux fois le meme article.
      try {
        self._mouvementer(productId, 'SORTIE', quantite, 'commande en cours d’enregistrement');
      } catch (e) { rejeter(e); return; }

      var c = {
        id: ++self.etat.seqC, productId: productId, produitNom: p.nom,
        quantite: quantite, prixUnitaire: p.prix,
        date: maintenant().slice(0, 10), statut: 'EN_COURS',
      };
      self.etat.commandes.push(c);
      // Le motif du mouvement ne pouvait pas contenir le numero de commande
      // avant que celle-ci existe : on le complete maintenant.
      self.etat.mouvements[self.etat.mouvements.length - 1].motif = 'commande ' + c.id;
      self._sauver();
      resoudre(c);
    });
  };

  DepotLocal.prototype.changerStatut = function (id, statut) {
    var self = this;
    return new Promise(function (resoudre, rejeter) {
      var c = self.etat.commandes.find(function (x) { return x.id === id; });
      if (!c) { rejeter(Refus(404, 'Commande introuvable.')); return; }
      if (c.statut !== 'EN_COURS') {
        rejeter(Refus(409, 'Une commande ' + c.statut + ' ne change plus d’état.'));
        return;
      }
      if (statut === 'ANNULEE') {
        self._mouvementer(c.productId, 'ENTREE', c.quantite, 'annulation de la commande ' + c.id);
      }
      c.statut = statut;
      self._sauver();
      resoudre(c);
    });
  };

  /* --------------------------------------------------------- controle ---- */

  DepotLocal.prototype.coherence = function () {
    var mvts = this.etat.mouvements;
    var ecarts = this.etat.produits.map(function (p) {
      var somme = mvts.filter(function (m) { return m.productId === p.id; })
        .reduce(function (s, m) { return s + (m.sens === 'ENTREE' ? m.quantite : -m.quantite); }, 0);
      return {
        productId: p.id, reference: p.reference, stockAffiche: p.quantiteStock,
        sommeMouvements: somme, ecart: p.quantiteStock - somme,
      };
    }).filter(function (l) { return l.ecart !== 0; });

    return Promise.resolve({
      articles: this.etat.produits.length,
      mouvements: mvts.length,
      ecarts: ecarts,
      coherent: ecarts.length === 0,
    });
  };

  window.DepotLocal = DepotLocal;
})();
