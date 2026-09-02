/**
 * jeu.js — Boucle de jeu de Sanaga.
 *
 * Gère l'or, la boutique, le placement et l'enchaînement des manches. La
 * résolution du combat ne se trouve pas ici : elle est demandée à
 * moteur/combat.js, exactement comme le fait le banc d'équilibrage.
 *
 * Toutes les valeurs — coûts, points de vie, or par manche, nombre de manches —
 * viennent de 02-regles/equilibrage.json. Aucune n'est écrite dans ce fichier.
 */

(function () {
  'use strict';

  const R = window.REGLAGES;
  const COLS = R.plateau.colonnes;
  const PROF = R.plateau.colonnes_deploiement;
  const PLAFOND = R.plateau.unites_max_par_camp;
  const CATALOGUE = {};
  R.unites.forEach(function (u) { CATALOGUE[u.id] = u; });

  const $ = (s) => document.querySelector(s);

  const toile = $('#plateau');
  const rendu = Rendu.creerRendu(toile, R);

  /* ---------- État ---------- */

  const etat = {
    manche: 1,
    or: R.economie.or_depart,
    vie: R.economie.points_vie_joueur,
    armee: [],          // { ref, x, y }
    selection: null,    // identifiant d'unité choisie dans la boutique
    phase: 'placement', // placement | combat | fin
    dernier: null,      // dernier résultat de combat
    vitesse: 1,
  };

  /* ---------- Adversaire ---------- */

  /**
   * L'adversaire dispose du même or cumulé que le joueur à la même manche.
   * Sa composition est tirée au hasard mais reproductible : la manche 3 est
   * toujours la même armée, ce qui rend une défaite analysable plutôt
   * qu'arbitraire.
   */
  function composerAdversaire(manche) {
    const rng = Aleatoire.creerAleatoire(R.equilibrage.graine_par_defaut + manche * 7919);
    let budget = R.economie.or_depart + (manche - 1) * R.economie.or_par_manche;
    const compo = [];
    const choix = R.unites.slice();

    while (compo.length < PLAFOND) {
      const abordables = choix.filter(function (u) { return u.cout <= budget; });
      if (!abordables.length) break;
      const u = Aleatoire.parmi(rng, abordables);
      compo.push(u.id);
      budget -= u.cout;
    }
    return compo.length ? compo : ['eclaireur'];
  }

  /* ---------- Boutique ---------- */

  function dessinerBoutique() {
    const liste = $('#boutique');
    liste.textContent = '';

    R.unites.forEach(function (u) {
      const li = document.createElement('li');
      const trop = etat.armee.length >= PLAFOND;
      const cher = u.cout > etat.or;
      const bloque = etat.phase !== 'placement' || trop || cher;

      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'carte-unite';
      b.disabled = bloque;
      b.setAttribute('aria-pressed', String(etat.selection === u.id));
      b.dataset.unite = u.id;

      const raison = cher ? ' — or insuffisant' : (trop ? ' — plateau plein' : '');
      b.innerHTML =
        '<span class="pastille" aria-hidden="true">' + (rendu.INITIALES[u.id] || '??') + '</span>'
        + '<span><b>' + u.nom + '</b><small>' + u.role + '</small></span>'
        + '<span class="cout">' + u.cout + ' or</span>';
      b.setAttribute('aria-label',
        u.nom + ', ' + u.cout + ' or. ' + u.role + '. '
        + u.pv + ' points de vie, ' + u.degats + ' dégâts, portée ' + u.portee + raison);

      b.addEventListener('click', function () {
        etat.selection = etat.selection === u.id ? null : u.id;
        dessinerBoutique();
        annoncer(etat.selection
          ? u.nom + ' sélectionné. Cliquez une case de votre zone pour le placer.'
          : 'Sélection annulée.');
      });

      li.appendChild(b);
      liste.appendChild(li);
    });
  }

  /* ---------- Plateau ---------- */

  function unitesAffichables() {
    return etat.armee.map(function (a, i) {
      const m = CATALOGUE[a.ref];
      return { indice: i, ref: a.ref, nom: m.nom, camp: 'A', x: a.x, y: a.y, pv: m.pv, pvMax: m.pv };
    });
  }

  function apercuAdversaire() {
    // Aperçu seulement : les positions réelles sont tirées par le moteur au
    // moment du combat. On montre l'effectif, pas la disposition.
    const compo = composerAdversaire(etat.manche);
    const cases = [];
    for (let c = 0; c < PROF; c++) {
      for (let l = 0; l < R.plateau.lignes; l++) cases.push({ x: COLS - 1 - c, y: l });
    }
    return compo.slice(0, cases.length).map(function (ref, i) {
      const m = CATALOGUE[ref];
      return { indice: 100 + i, ref, nom: m.nom, camp: 'B', x: cases[i].x, y: cases[i].y, pv: m.pv, pvMax: m.pv };
    });
  }

  function redessiner() {
    rendu.dessiner(unitesAffichables().concat(apercuAdversaire()));
  }

  function placer(c) {
    if (etat.phase !== 'placement') return;

    const occupee = etat.armee.findIndex(function (a) { return a.x === c.x && a.y === c.y; });

    // Cliquer une de ses unités la revend au prix d'achat : une erreur de
    // placement ne doit pas coûter une manche.
    if (occupee !== -1) {
      const rendue = CATALOGUE[etat.armee[occupee].ref];
      etat.armee.splice(occupee, 1);
      etat.or += rendue.cout;
      annoncer(rendue.nom + ' retiré, ' + rendue.cout + ' or rendu.');
      majTout();
      return;
    }

    if (!etat.selection) { annoncer('Choisissez d\'abord une unité dans la boutique.'); return; }
    if (c.x >= PROF) { annoncer('Vous ne pouvez déployer que sur les trois colonnes de gauche.'); return; }
    if (etat.armee.length >= PLAFOND) { annoncer('Plateau plein : ' + PLAFOND + ' unités au maximum.'); return; }

    const m = CATALOGUE[etat.selection];
    if (m.cout > etat.or) { annoncer('Or insuffisant.'); return; }

    etat.armee.push({ ref: m.id, x: c.x, y: c.y });
    etat.or -= m.cout;
    annoncer(m.nom + ' placé. Il reste ' + etat.or + ' or.');
    majTout();
  }

  /* ---------- Combat ---------- */

  function combattre() {
    if (etat.phase !== 'placement' || !etat.armee.length) return;

    etat.phase = 'combat';
    majTout();

    const compoJoueur = etat.armee.map(function (a) { return a.ref; });
    const compoAdverse = composerAdversaire(etat.manche);
    const graine = (R.equilibrage.graine_par_defaut + etat.manche * 31 + etat.armee.length) | 0;

    // Le même appel que celui du banc d'équilibrage, avec le journal en plus.
    const resultat = Combat.resoudreCombat(R, compoJoueur, compoAdverse, graine, { journal: true });
    etat.dernier = resultat;

    const journal = $('#journal');
    journal.textContent = '';
    let lignes = 0;

    rendu.jouerJournal(resultat.journal, {
      vitesse: etat.vitesse,
      surEvenement: function (e, acteur, cible) {
        if (lignes++ > 120) return;
        const li = document.createElement('li');
        const classe = acteur.camp === 'A' ? 'a' : 'b';
        if (e.t === 'attaque') {
          li.innerHTML = '<span class="' + classe + '">' + acteur.nom + '</span> → ' + cible.nom + ' (-' + e.d + ')';
        } else if (e.t === 'soin') {
          li.innerHTML = '<span class="' + classe + '">' + acteur.nom + '</span> soigne ' + cible.nom + ' (+' + e.v + ')';
        } else if (e.t === 'mort') {
          li.innerHTML = '<span class="' + classe + '">' + acteur.nom + '</span> tombe';
        }
        journal.appendChild(li);
        journal.scrollTop = journal.scrollHeight;
      },
      surFin: terminerManche,
    });
  }

  function terminerManche() {
    const r = etat.dernier;
    const gagne = r.vainqueur === 'A';
    const nul = r.vainqueur === 'nul';

    let message;
    if (gagne) {
      etat.or += R.economie.or_victoire;
      message = 'Manche ' + etat.manche + ' remportée. +' + R.economie.or_victoire + ' or.';
    } else if (nul) {
      message = 'Manche ' + etat.manche + ' nulle. Aucun camp n\'a été éliminé en '
        + R.combat.tours_max + ' tours.';
    } else {
      // Le coût d'une défaite dépend de ce qui restait debout en face : perdre
      // de peu doit coûter moins que se faire balayer.
      const degats = Math.max(1, Math.min(4, r.restantB));
      etat.vie -= degats;
      message = 'Manche ' + etat.manche + ' perdue. ' + r.restantB + ' survivant(s) adverse(s), -'
        + degats + ' point(s) de vie.';
    }

    etat.manche++;
    etat.or += R.economie.or_par_manche;

    if (etat.vie <= 0) return finir(false, message);
    if (etat.manche > R.economie.manches) return finir(true, message);

    etat.phase = 'placement';
    etat.selection = null;
    majTout();
    annoncer(message + ' +' + R.economie.or_par_manche + ' or pour la manche suivante.',
      gagne ? 'victoire' : (nul ? '' : 'defaite'));
  }

  function finir(survecu, message) {
    etat.phase = 'fin';
    majTout();
    const zone = $('#fin');
    zone.hidden = false;
    zone.innerHTML =
      '<h2>' + (survecu ? 'Vallée tenue' : 'Vallée perdue') + '</h2>'
      + '<p>' + message + '<br>'
      + (survecu
        ? 'Vous avez traversé les ' + R.economie.manches + ' manches avec ' + etat.vie + ' point(s) de vie.'
        : 'Vous êtes tombé à la manche ' + (etat.manche - 1) + ' sur ' + R.economie.manches + '.')
      + '</p><button type="button" class="btn btn--principal" id="rejouer">Nouvelle partie</button>';
    $('#rejouer').addEventListener('click', recommencer);
    annoncer(survecu ? 'Partie gagnée.' : 'Partie perdue.');
  }

  function recommencer() {
    etat.manche = 1;
    etat.or = R.economie.or_depart;
    etat.vie = R.economie.points_vie_joueur;
    etat.armee = [];
    etat.selection = null;
    etat.phase = 'placement';
    etat.dernier = null;
    $('#fin').hidden = true;
    $('#journal').textContent = '';
    majTout();
    annoncer('Nouvelle partie.');
  }

  /* ---------- Interface ---------- */

  function annoncer(texte, ton) {
    const p = $('#etat');
    p.className = 'etat' + (ton ? ' etat--' + ton : '');
    p.innerHTML = '<b>Manche ' + Math.min(etat.manche, R.economie.manches) + '/' + R.economie.manches + '</b> — ' + texte;
  }

  function majTout() {
    $('#or').textContent = etat.or;
    $('#vie').textContent = etat.vie;
    $('#manche').textContent = Math.min(etat.manche, R.economie.manches) + '/' + R.economie.manches;
    $('#effectif').textContent = etat.armee.length + '/' + PLAFOND;
    $('#combattre').disabled = etat.phase !== 'placement' || !etat.armee.length;
    $('#rejouer-combat').disabled = !etat.dernier || etat.phase === 'combat';
    dessinerBoutique();
    if (etat.phase !== 'combat') redessiner();
  }

  /* ---------- Événements ---------- */

  toile.addEventListener('click', function (ev) {
    const c = rendu.caseDepuisEvenement(ev);
    if (c) placer(c);
  });

  toile.addEventListener('mousemove', function (ev) {
    if (etat.phase !== 'placement') return;
    const c = rendu.caseDepuisEvenement(ev);
    rendu.definirSurvol(c && c.x < PROF ? c : null);
    redessiner();
  });

  toile.addEventListener('mouseleave', function () {
    rendu.definirSurvol(null);
    if (etat.phase === 'placement') redessiner();
  });

  $('#combattre').addEventListener('click', combattre);

  $('#rejouer-combat').addEventListener('click', function () {
    if (!etat.dernier || etat.phase === 'combat') return;
    rendu.jouerJournal(etat.dernier.journal, { vitesse: etat.vitesse, surFin: redessiner });
  });

  $('#vitesse').addEventListener('change', function (ev) {
    etat.vitesse = Number(ev.target.value);
  });

  /* ---------- Démarrage ---------- */

  majTout();
  annoncer('Choisissez une unité, placez-la sur les trois colonnes de gauche, puis lancez le combat.');
})();
