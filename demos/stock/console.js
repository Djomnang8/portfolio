/* =============================================================================
   console.js — Affichage et interactions.

   Le fichier ne contient aucune regle metier : tout ce qui decide (refus,
   mouvements, statuts) vit dans le depot, local ou distant. Ici on lit, on
   affiche, on rapporte les refus tels quels.
   ============================================================================= */

(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var depot = null;
  var cache = { produits: [], mouvements: [], commandes: [] };

  var BASE_DEFAUT = 'http://localhost:8080';
  var CLE_BASE = 'gestion-stocks.passerelle';

  /* ------------------------------------------------------------ formats -- */

  var nf = new Intl.NumberFormat('fr-FR');
  function fcfa(n) { return n == null ? '—' : nf.format(Math.round(n)) + ' F'; }
  function ent(n) { return nf.format(n); }
  function heure(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d)) return String(iso).slice(0, 16).replace('T', ' ');
    return d.toLocaleDateString('fr-FR') + ' ' +
      d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  function ech(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ----------------------------------------------------------- messages -- */

  function dire(texte, ton) {
    var zone = $('#messages');
    var el = document.createElement('p');
    el.className = 'message message--' + (ton || 'info');
    // Le symbole est purement decoratif : le texte porte deja l'information,
    // pour que le message reste comprehensible sans percevoir la couleur.
    el.innerHTML = '<span aria-hidden="true">' +
      (ton === 'ko' ? '✕' : ton === 'ok' ? '✓' : 'ℹ') + '</span> ' + ech(texte);
    zone.prepend(el);
    while (zone.children.length > 3) zone.lastElementChild.remove();
    setTimeout(function () { el.remove(); }, 9000);
  }

  function direRefus(e) {
    // Un refus n'est pas une panne. On distingue les deux, parce que la conduite
    // a tenir n'est pas la meme : corriger la saisie, ou attendre / reapprovisionner.
    if (e && e.code === 409) dire(e.message, 'ko');
    else if (e && e.code === 400) dire(e.message, 'ko');
    else dire((e && e.message) || 'Operation impossible.', 'ko');
  }

  /* -------------------------------------------------------------- source -- */

  function afficherSource() {
    var pastille = $('#source-pastille');
    var texte = $('#source-texte');
    if (depot && depot.mode === 'api') {
      pastille.className = 'source__pastille source__pastille--api';
      texte.textContent = 'Services connectés — ' + depot.base;
    } else {
      pastille.className = 'source__pastille source__pastille--local';
      texte.textContent = 'Mode local — aucun service joignable';
    }
  }

  function baseChoisie() {
    var p = new URLSearchParams(location.search).get('api');
    if (p) return p;
    try { return localStorage.getItem(CLE_BASE) || BASE_DEFAUT; } catch (e) { return BASE_DEFAUT; }
  }

  function choisirDepot() {
    // Le parametre ?local=1 force le mode local : indispensable pour produire
    // des captures d'ecran reproductibles, quel que soit ce qui tourne sur la
    // machine au moment de la capture.
    if (new URLSearchParams(location.search).get('local') === '1') {
      depot = new window.DepotLocal();
      return Promise.resolve();
    }
    var base = baseChoisie();

    // Une page servie en HTTPS ne peut pas appeler http://localhost : le
    // navigateur bloque la requete comme contenu mixte, avant meme qu'elle
    // parte. Sonder quand meme ne ferait que remplir la console d'erreurs sans
    // aucune chance de succes — la demo en ligne va directement au mode local.
    if (location.protocol === 'https:' && /^http:\/\//.test(base)) {
      depot = new window.DepotLocal();
      return Promise.resolve();
    }

    return window.DepotApi.joignable(base).then(function (ok) {
      depot = ok ? new window.DepotApi(base) : new window.DepotLocal();
    });
  }

  /* ------------------------------------------------------------ lecture -- */

  function recharger() {
    return Promise.all([depot.produits(), depot.mouvements(), depot.commandes()])
      .then(function (r) {
        cache.produits = r[0] || [];
        cache.mouvements = r[1] || [];
        cache.commandes = r[2] || [];
        rendreTout();
      })
      .catch(function (e) {
        dire('Lecture impossible : ' + e.message + ' — bascule en mode local.', 'ko');
        depot = new window.DepotLocal();
        afficherSource();
        return recharger();
      });
  }

  function produitDe(id) {
    return cache.produits.find(function (p) { return p.id === id; }) || {};
  }

  /* ------------------------------------------------------- tableau bord -- */

  function rendreStats() {
    var p = cache.produits;
    var valeur = p.reduce(function (s, x) { return s + (x.prix || 0) * x.quantiteStock; }, 0);
    var alertes = p.filter(function (x) { return x.quantiteStock <= x.seuilAlerte; });
    var ruptures = p.filter(function (x) { return x.quantiteStock === 0; });
    var enCours = cache.commandes.filter(function (c) { return c.statut === 'EN_COURS'; });

    $('#stats').innerHTML = [
      stat(ent(p.length), 'articles au catalogue'),
      stat(fcfa(valeur), 'valeur immobilisée'),
      stat(ent(alertes.length), alertes.length > 1 ? 'articles sous leur seuil' : 'article sous son seuil',
        alertes.length ? 'alerte' : 'ok'),
      stat(ent(ruptures.length), ruptures.length > 1 ? 'ruptures' : 'rupture',
        ruptures.length ? 'ko' : 'ok'),
      stat(ent(cache.mouvements.length), 'mouvements journalisés'),
      stat(ent(enCours.length), 'commandes en cours'),
    ].join('');
  }

  function stat(valeur, libelle, ton) {
    return '<div class="stat' + (ton ? ' stat--' + ton : '') + '">' +
      '<p class="stat__val">' + valeur + '</p>' +
      '<p class="stat__lib">' + ech(libelle) + '</p></div>';
  }

  function rendreAlertes() {
    var lignes = cache.produits
      .filter(function (p) { return p.quantiteStock <= p.seuilAlerte; })
      .sort(function (a, b) { return a.quantiteStock - b.quantiteStock; });

    var corps = $('#t-alertes tbody');
    if (!lignes.length) {
      corps.innerHTML = '<tr><td colspan="6" class="vide">Aucun article sous son seuil. ' +
        'Le stock couvre la demande prévue.</td></tr>';
      return;
    }
    corps.innerHTML = lignes.map(function (p) {
      var rupture = p.quantiteStock === 0;
      return '<tr>' +
        '<td><code>' + ech(p.reference) + '</code></td>' +
        '<td>' + ech(p.nom) + '</td>' +
        '<td>' + ech(p.categorie) + '</td>' +
        '<td class="num"><strong>' + ent(p.quantiteStock) + '</strong></td>' +
        '<td class="num">' + ent(p.seuilAlerte) + '</td>' +
        '<td><span class="etat etat--' + (rupture ? 'ko' : 'alerte') + '">' +
          (rupture ? 'Rupture' : 'Sous le seuil') + '</span></td>' +
        '</tr>';
    }).join('');
  }

  function rendreBarres() {
    var parCategorie = {};
    cache.produits.forEach(function (p) {
      var c = p.categorie || 'Sans catégorie';
      parCategorie[c] = (parCategorie[c] || 0) + (p.prix || 0) * p.quantiteStock;
    });
    var entrees = Object.keys(parCategorie).map(function (c) { return [c, parCategorie[c]]; })
      .sort(function (a, b) { return b[1] - a[1]; });
    var max = entrees.length ? entrees[0][1] : 1;

    $('#barres').innerHTML = entrees.map(function (e) {
      var pct = max ? Math.round((e[1] / max) * 100) : 0;
      // La valeur est ecrite en toutes lettres a cote de la barre : une longueur
      // seule n'est pas lisible, et ne l'est pas du tout pour un lecteur d'ecran.
      return '<div class="barre">' +
        '<span class="barre__lib">' + ech(e[0]) + '</span>' +
        '<span class="barre__piste"><span class="barre__jauge" style="width:' + pct + '%"></span></span>' +
        '<span class="barre__val">' + fcfa(e[1]) + '</span>' +
        '</div>';
    }).join('');
  }

  /* --------------------------------------------------------- catalogue -- */

  function rendreCatalogue() {
    $('#t-catalogue tbody').innerHTML = cache.produits.map(function (p) {
      var ton = p.quantiteStock === 0 ? 'ko' : (p.quantiteStock <= p.seuilAlerte ? 'alerte' : '');
      return '<tr>' +
        '<td><code>' + ech(p.reference) + '</code></td>' +
        '<td>' + ech(p.nom) + '</td>' +
        '<td>' + ech(p.categorie) + '</td>' +
        '<td class="num">' + fcfa(p.prix) + '</td>' +
        '<td class="num' + (ton ? ' cel--' + ton : '') + '"><strong>' + ent(p.quantiteStock) + '</strong></td>' +
        '<td class="num">' + ent(p.seuilAlerte) + '</td>' +
        '<td><button type="button" class="btn btn--fin" data-mouvement="' + p.id + '">' +
          'Entrée / sortie<span class="sr"> pour ' + ech(p.nom) + '</span></button></td>' +
        '</tr>';
    }).join('');
  }

  /* -------------------------------------------------------- mouvements -- */

  function rendreMouvements() {
    var corps = $('#t-mouvements tbody');
    if (!cache.mouvements.length) {
      corps.innerHTML = '<tr><td colspan="8" class="vide">Aucun mouvement.</td></tr>';
      return;
    }
    corps.innerHTML = cache.mouvements.slice(0, 200).map(function (m) {
      var p = produitDe(m.productId);
      return '<tr>' +
        '<td class="num">' + m.id + '</td>' +
        '<td>' + ech(heure(m.horodatage)) + '</td>' +
        '<td>' + ech(p.nom || ('produit ' + m.productId)) + '</td>' +
        '<td><span class="etat etat--' + (m.sens === 'ENTREE' ? 'ok' : 'neutre') + '">' +
          (m.sens === 'ENTREE' ? 'Entrée' : 'Sortie') + '</span></td>' +
        '<td class="num">' + ent(m.quantite) + '</td>' +
        '<td class="num sourdine">' + ent(m.stockAvant) + '</td>' +
        '<td class="num"><strong>' + ent(m.stockApres) + '</strong></td>' +
        '<td>' + ech(m.motif) + '</td>' +
        '</tr>';
    }).join('');
  }

  /* ---------------------------------------------------------- commandes -- */

  function rendreCommandes() {
    var sel = $('#c-produit');
    var choisi = sel.value;
    sel.innerHTML = cache.produits.map(function (p) {
      return '<option value="' + p.id + '">' + ech(p.reference + ' — ' + p.nom) +
        ' (stock ' + p.quantiteStock + ')</option>';
    }).join('');
    if (choisi) sel.value = choisi;

    var corps = $('#t-commandes tbody');
    if (!cache.commandes.length) {
      corps.innerHTML = '<tr><td colspan="7" class="vide">Aucune commande enregistrée.</td></tr>';
      return;
    }
    corps.innerHTML = cache.commandes.map(function (c) {
      var montant = c.prixUnitaire == null ? null : c.prixUnitaire * c.quantite;
      var ton = c.statut === 'SERVIE' ? 'ok' : (c.statut === 'ANNULEE' ? 'neutre' : 'alerte');
      var libelle = c.statut === 'SERVIE' ? 'Servie' : (c.statut === 'ANNULEE' ? 'Annulée' : 'En cours');
      var actions = c.statut === 'EN_COURS'
        ? '<button type="button" class="btn btn--fin" data-servir="' + c.id + '">Servir</button> ' +
          '<button type="button" class="btn btn--fin" data-annuler="' + c.id + '">Annuler</button>'
        : '<span class="sourdine">—</span>';
      return '<tr>' +
        '<td class="num">' + c.id + '</td>' +
        '<td>' + ech(c.date) + '</td>' +
        '<td>' + ech(c.produitNom || produitDe(c.productId).nom || ('produit ' + c.productId)) + '</td>' +
        '<td class="num">' + ent(c.quantite) + '</td>' +
        '<td class="num">' + fcfa(montant) + '</td>' +
        '<td><span class="etat etat--' + ton + '">' + libelle + '</span></td>' +
        '<td class="actions">' + actions + '</td>' +
        '</tr>';
    }).join('');
  }

  function rendreTout() {
    rendreStats();
    rendreAlertes();
    rendreBarres();
    rendreCatalogue();
    rendreMouvements();
    rendreCommandes();
    $('#pied-texte').innerHTML =
      ent(cache.produits.length) + ' articles · ' + ent(cache.mouvements.length) +
      ' mouvements · ' + ent(cache.commandes.length) + ' commandes · source : ' +
      (depot.mode === 'api' ? 'services réels' : 'dépôt local');
  }

  /* ------------------------------------------------------------ onglets -- */

  function ouvrir(vue) {
    $$('.vue').forEach(function (s) { s.hidden = s.id !== 'vue-' + vue; });
    $$('.onglet').forEach(function (b) {
      var actif = b.dataset.vue === vue;
      b.setAttribute('aria-current', actif ? 'page' : 'false');
    });
    history.replaceState(null, '', '#' + vue);
  }

  /* ---------------------------------------------------------- controles -- */

  function lancerControle() {
    depot.coherence().then(function (r) {
      var html;
      if (r.coherent) {
        html = '<div class="verdict verdict--ok">' +
          '<p class="verdict__titre"><span aria-hidden="true">✓</span> Stock cohérent</p>' +
          '<p>Sur ' + ent(r.articles) + ' articles et ' + ent(r.mouvements) +
          ' mouvements, chaque quantité affichée est exactement la somme de ses mouvements. ' +
          'Aucun écart.</p></div>';
      } else {
        html = '<div class="verdict verdict--ko">' +
          '<p class="verdict__titre"><span aria-hidden="true">✕</span> ' +
          ent(r.ecarts.length) + ' écart(s) détecté(s)</p>' +
          '<p>Un stock a changé sans mouvement correspondant. Détail :</p><ul>' +
          r.ecarts.map(function (e) {
            return '<li><code>' + ech(e.reference) + '</code> — affiché ' + ent(e.stockAffiche) +
              ', somme des mouvements ' + ent(e.sommeMouvements) +
              ', écart <strong>' + (e.ecart > 0 ? '+' : '') + ent(e.ecart) + '</strong></li>';
          }).join('') + '</ul></div>';
      }
      $('#resultat-controle').innerHTML = html;
    }).catch(function (e) { direRefus(e); });
  }

  function testerConcurrence() {
    // On choisit l'article dont le stock est le plus grand parmi ceux qui en
    // ont, puis on demande deux fois plus de la moitie : par construction, les
    // deux demandes ne peuvent pas etre satisfaites toutes les deux.
    var cible = cache.produits.filter(function (p) { return p.quantiteStock > 1; })
      .sort(function (a, b) { return b.quantiteStock - a.quantiteStock; })[0];
    if (!cible) {
      $('#resultat-concurrence').innerHTML =
        '<p class="verdict verdict--neutre">Aucun article n’a assez de stock pour le test.</p>';
      return;
    }
    var avant = cible.quantiteStock;
    var q = Math.floor(avant / 2) + 1;

    Promise.allSettled([
      depot.commander(cible.id, q),
      depot.commander(cible.id, q),
    ]).then(function (r) {
      var acceptees = r.filter(function (x) { return x.status === 'fulfilled'; }).length;
      return recharger().then(function () {
        var apres = produitDe(cible.id).quantiteStock;
        var ok = acceptees === 1 && apres >= 0;
        $('#resultat-concurrence').innerHTML =
          '<div class="verdict verdict--' + (ok ? 'ok' : 'ko') + '">' +
          '<p class="verdict__titre"><span aria-hidden="true">' + (ok ? '✓' : '✕') + '</span> ' +
          acceptees + ' commande(s) acceptée(s) sur 2</p>' +
          '<p>Article <code>' + ech(cible.reference) + '</code> : stock ' + ent(avant) +
          ' avant, ' + ent(apres) + ' après, pour deux demandes de ' + ent(q) + ' unités.</p>' +
          '<p>' + (ok
            ? 'La seconde demande a été refusée : le stock n’a pas été vendu deux fois.'
            : 'Les deux demandes sont passées — c’est exactement la sur-vente que le verrouillage doit empêcher.') +
          '</p></div>';
      });
    });
  }

  /* ---------------------------------------------------------- dialogues -- */

  var produitEnCours = null;

  function ouvrirMouvement(id) {
    var p = produitDe(id);
    produitEnCours = id;
    $('#dlg-titre').textContent = 'Mouvement — ' + p.nom;
    $('#dlg-contexte').textContent =
      'Stock actuel : ' + p.quantiteStock + ' · seuil d’alerte : ' + p.seuilAlerte +
      '. Une sortie supérieure au stock sera refusée.';
    $('#m-quantite').value = 1;
    $('#m-motif').value = '';
    $('#dlg-mouvement').showModal();
  }

  /* ------------------------------------------------------------ demarrage -- */

  function brancher() {
    $$('.onglet').forEach(function (b) {
      b.addEventListener('click', function () { ouvrir(b.dataset.vue); });
    });

    document.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.mouvement) ouvrirMouvement(Number(b.dataset.mouvement));
      if (b.dataset.servir) {
        depot.changerStatut(Number(b.dataset.servir), 'SERVIE')
          .then(function () { dire('Commande ' + b.dataset.servir + ' servie.', 'ok'); return recharger(); })
          .catch(direRefus);
      }
      if (b.dataset.annuler) {
        depot.changerStatut(Number(b.dataset.annuler), 'ANNULEE')
          .then(function () {
            dire('Commande ' + b.dataset.annuler + ' annulée, stock rendu.', 'ok');
            return recharger();
          })
          .catch(direRefus);
      }
    });

    $('#form-mouvement').addEventListener('submit', function () {
      var sens = $('#m-sens').value;
      var q = $('#m-quantite').value;
      var motif = $('#m-motif').value;
      depot.appliquerMouvement(produitEnCours, sens, q, motif)
        .then(function (m) {
          dire((sens === 'ENTREE' ? 'Entrée' : 'Sortie') + ' de ' + q +
            ' appliquée — stock ' + m.stockAvant + ' → ' + m.stockApres + '.', 'ok');
          return recharger();
        })
        .catch(direRefus);
    });
    $('#m-annuler').addEventListener('click', function () { $('#dlg-mouvement').close(); });

    $('#form-commande').addEventListener('submit', function (e) {
      e.preventDefault();
      var id = Number($('#c-produit').value);
      var q = $('#c-quantite').value;
      depot.commander(id, q)
        .then(function (c) { dire('Commande ' + c.id + ' enregistrée.', 'ok'); return recharger(); })
        .catch(direRefus);
    });

    $('#btn-controle').addEventListener('click', lancerControle);
    $('#btn-concurrence').addEventListener('click', testerConcurrence);

    $('#btn-source').addEventListener('click', function () {
      $('#s-url').value = depot.mode === 'api' ? depot.base : baseChoisie();
      $('#dlg-source').showModal();
    });
    $('#s-local').addEventListener('click', function () {
      depot = new window.DepotLocal();
      $('#dlg-source').close();
      afficherSource();
      dire('Mode local : les données restent dans ce navigateur.', 'info');
      recharger();
    });
    $('#dlg-source').addEventListener('submit', function () {
      var base = $('#s-url').value.trim();
      window.DepotApi.joignable(base).then(function (ok) {
        if (!ok) { dire('Aucune réponse de ' + base + ' — on reste en mode local.', 'ko'); return; }
        try { localStorage.setItem(CLE_BASE, base); } catch (e) {}
        depot = new window.DepotApi(base);
        afficherSource();
        dire('Connecté à ' + base + '.', 'ok');
        recharger();
      });
    });
  }

  /* Deux parametres declenchent une action au chargement.

     Ils existent pour que l'etat montre dans la documentation soit
     reproductible : une capture d'ecran d'un resultat obtenu par un clic ne se
     refait pas a l'identique six mois plus tard, et finit par ne plus
     correspondre au produit.

       ?controle=1  lance le controle de coherence (lecture seule) ;
       ?refus=1     demande une sortie superieure au stock, pour montrer le
                    refus tel qu'il s'affiche. L'operation etant refusee, rien
                    n'est modifie. */
  function actionsAutomatiques() {
    var p = new URLSearchParams(location.search);
    if (p.get('controle') === '1') { ouvrir('coherence'); lancerControle(); }
    if (p.get('refus') === '1') {
      var cible = cache.produits.filter(function (x) { return x.quantiteStock > 0; })
        .sort(function (a, b) { return a.quantiteStock - b.quantiteStock; })[0];
      if (cible) {
        ouvrir('catalogue');
        depot.appliquerMouvement(cible.id, 'SORTIE', cible.quantiteStock + 10, 'inventaire')
          .then(function () { dire('Sortie appliquee — ce cas ne devrait pas se produire.', 'ko'); })
          .catch(direRefus);
      }
    }
  }

  choisirDepot().then(function () {
    afficherSource();
    brancher();
    var vue = (location.hash || '').replace('#', '');
    if (['tableau', 'catalogue', 'mouvements', 'commandes', 'coherence'].indexOf(vue) >= 0) ouvrir(vue);
    return recharger().then(actionsAutomatiques);
  });
})();
