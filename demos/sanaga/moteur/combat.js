/**
 * combat.js — La simulation de combat de Sanaga.
 *
 * CE FICHIER EST LE JEU.
 *
 * Le navigateur et le banc d'équilibrage chargent tous deux ce module. Le rendu
 * ne simule rien : il rejoue le journal produit ici. C'est la seule façon
 * d'affirmer qu'un rapport d'équilibrage décrit le jeu auquel on joue, et non
 * une approximation écrite à côté.
 *
 * Une deuxième implémentation du combat, même fidèle au départ, divergerait :
 * une correction appliquée d'un côté et pas de l'autre suffit, et plus rien
 * n'avertit que le rapport est devenu faux.
 *
 * Tout le hasard passe par le générateur déterministe : une même graine et une
 * même composition donnent toujours exactement le même combat.
 */

(function (racine) {
  'use strict';

  const Alea = (typeof module !== 'undefined' && module.exports)
    ? require('./aleatoire.js')
    : racine.Aleatoire;

  /** Distance de Tchebychev : la diagonale coûte autant qu'un pas droit. */
  const distance = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

  const cle = (x, y) => x + ',' + y;

  /** Minimum selon une clé, égalités tranchées par l'ordre de déploiement. */
  function minPar(liste, mesure) {
    let meilleur = liste[0];
    let valeur = mesure(meilleur);
    for (let i = 1; i < liste.length; i++) {
      const v = mesure(liste[i]);
      if (v < valeur || (v === valeur && liste[i].indice < meilleur.indice)) {
        meilleur = liste[i];
        valeur = v;
      }
    }
    return meilleur;
  }

  /* ---------- Déploiement ---------- */

  function creerUnite(modele, camp, x, y, indice, rang) {
    return {
      ref: modele.id, nom: modele.nom, camp, x, y, indice, rang,
      pv: modele.pv, pvMax: modele.pv,
      degats: modele.degats, portee: modele.portee,
      initiative: modele.initiative, deplacement: modele.deplacement,
      special: modele.special || null,
      soin: modele.soin || 0,
      rayonZone: modele.rayon_zone || 0,
    };
  }

  /**
   * Place une composition sur ses colonnes de déploiement.
   * Les cases sont mélangées : sans cela, chaque duel se rejouerait dans la même
   * disposition, et le taux de victoire mesurerait un placement plutôt qu'une
   * unité.
   */
  function deployer(reglages, catalogue, composition, camp, rng, indiceDepart) {
    const colonnes = reglages.plateau.colonnes;
    const lignes = reglages.plateau.lignes;
    const profondeur = reglages.plateau.colonnes_deploiement;

    const cases = [];
    for (let c = 0; c < profondeur; c++) {
      for (let l = 0; l < lignes; l++) {
        cases.push(camp === 'A' ? { x: c, y: l } : { x: colonnes - 1 - c, y: l });
      }
    }
    Alea.melanger(rng, cases);

    return composition.map(function (ref, i) {
      const modele = catalogue[ref];
      if (!modele) throw new Error('Unité inconnue : ' + ref);
      const place = cases[i];
      if (!place) throw new Error('Trop d\'unités pour la zone de déploiement : ' + composition.length);
      return creerUnite(modele, camp, place.x, place.y, indiceDepart + i, rng());
    });
  }

  /* ---------- Décisions ---------- */

  /**
   * Choix de cible.
   * Une unité en provocation située à deux cases ou moins capte l'attaque :
   * c'est ce qui donne un rôle au porte-bouclier, qui ne fait presque aucun dégât.
   */
  function choisirCible(unite, ennemis) {
    const provocateurs = ennemis.filter(function (e) {
      return e.special === 'provocation' && distance(unite, e) <= 2;
    });
    const bassin = provocateurs.length ? provocateurs : ennemis;
    if (unite.special === 'cible_faible') return minPar(bassin, function (e) { return e.pv; });
    return minPar(bassin, function (e) { return distance(unite, e); });
  }

  /** Dégâts effectifs, variance appliquée. */
  function calculerDegats(reglages, base, rng) {
    const v = reglages.combat.variance_degats;
    const facteur = 1 + (rng() * 2 - 1) * v;
    return Math.max(reglages.combat.degats_minimum, Math.round(base * facteur));
  }

  /** Avance vers la cible tant qu'il reste du déplacement et qu'elle est hors portée. */
  function avancer(unite, cible, occupees, journal) {
    let restant = unite.deplacement;
    while (restant > 0 && distance(unite, cible) > unite.portee) {
      const dx = Math.sign(cible.x - unite.x);
      const dy = Math.sign(cible.y - unite.y);
      const essais = [[dx, dy], [dx, 0], [0, dy]].filter(function (p) { return p[0] || p[1]; });
      let bouge = false;
      for (let i = 0; i < essais.length; i++) {
        const nx = unite.x + essais[i][0];
        const ny = unite.y + essais[i][1];
        if (!occupees.has(cle(nx, ny))) {
          occupees.delete(cle(unite.x, unite.y));
          unite.x = nx;
          unite.y = ny;
          occupees.add(cle(nx, ny));
          bouge = true;
          break;
        }
      }
      if (!bouge) break;
      restant--;
    }
    if (journal) journal.push({ t: 'deplacement', u: unite.indice, x: unite.x, y: unite.y });
  }

  /* ---------- Résolution ---------- */

  /**
   * Joue un combat complet.
   *
   * @param {Object} reglages   le contenu de 02-regles/equilibrage.json
   * @param {string[]} compoA   identifiants d'unités du camp A
   * @param {string[]} compoB   identifiants d'unités du camp B
   * @param {number} graine
   * @param {Object} [options]  { journal: true } pour enregistrer les événements
   * @returns {Object} résultat du combat
   */
  function resoudreCombat(reglages, compoA, compoB, graine, options) {
    const opts = options || {};
    const rng = Alea.creerAleatoire(graine);

    const catalogue = {};
    for (let i = 0; i < reglages.unites.length; i++) {
      catalogue[reglages.unites[i].id] = reglages.unites[i];
    }

    const equipeA = deployer(reglages, catalogue, compoA, 'A', rng, 0);
    const equipeB = deployer(reglages, catalogue, compoB, 'B', rng, compoA.length);
    const toutes = equipeA.concat(equipeB);

    const occupees = new Set(toutes.map(function (u) { return cle(u.x, u.y); }));
    const journal = opts.journal ? [] : null;

    if (journal) {
      journal.push({
        t: 'depart',
        unites: toutes.map(function (u) {
          return { i: u.indice, ref: u.ref, nom: u.nom, camp: u.camp, x: u.x, y: u.y, pv: u.pv, pvMax: u.pvMax };
        }),
      });
    }

    const vivants = function (camp) {
      return toutes.filter(function (u) { return u.camp === camp && u.pv > 0; });
    };

    let tour = 0;
    for (; tour < reglages.combat.tours_max; tour++) {
      if (!vivants('A').length || !vivants('B').length) break;

      // Initiative décroissante ; égalités tranchées par le rang tiré au
      // déploiement, donc reproductible à graine égale.
      const ordre = toutes.filter(function (u) { return u.pv > 0; })
        .sort(function (a, b) { return (b.initiative - a.initiative) || (a.rang - b.rang); });

      for (let k = 0; k < ordre.length; k++) {
        const unite = ordre[k];
        if (unite.pv <= 0) continue;
        const ennemis = vivants(unite.camp === 'A' ? 'B' : 'A');
        if (!ennemis.length) break;

        // La guérisseuse soigne si un allié blessé est à portée, sinon elle frappe.
        if (unite.special === 'soin') {
          const blesses = toutes.filter(function (u) {
            return u.camp === unite.camp && u.pv > 0 && u.pv < u.pvMax
              && u.indice !== unite.indice && distance(unite, u) <= unite.portee;
          });
          if (blesses.length) {
            const patient = minPar(blesses, function (u) { return u.pv / u.pvMax; });
            const rendu = Math.min(unite.soin, patient.pvMax - patient.pv);
            patient.pv += rendu;
            if (journal) journal.push({ t: 'soin', u: unite.indice, c: patient.indice, v: rendu, pv: patient.pv });
            continue;
          }
        }

        const cible = choisirCible(unite, ennemis);
        if (distance(unite, cible) > unite.portee) {
          avancer(unite, cible, occupees, journal);
        }

        if (distance(unite, cible) <= unite.portee) {
          const touches = unite.special === 'zone'
            ? ennemis.filter(function (e) { return distance(e, cible) <= unite.rayonZone; })
            : [cible];

          for (let m = 0; m < touches.length; m++) {
            const victime = touches[m];
            // Une attaque de zone frappe pleinement sa cible principale et plus
            // faiblement les autres : sans cette attenuation, sa puissance croit
            // avec la taille des armees et aucun reglage de degats ne suffit.
            const secondaire = unite.special === 'zone' && victime.indice !== cible.indice;
            const base = secondaire
              ? unite.degats * (reglages.combat.zone_cibles_secondaires || 1)
              : unite.degats;
            const degats = calculerDegats(reglages, base, rng);
            victime.pv -= degats;
            if (journal) {
              journal.push({ t: 'attaque', u: unite.indice, c: victime.indice, d: degats, pv: Math.max(0, victime.pv) });
            }
            if (victime.pv <= 0) {
              occupees.delete(cle(victime.x, victime.y));
              if (journal) journal.push({ t: 'mort', u: victime.indice });
            }
          }
        }
      }
    }

    const resteA = vivants('A');
    const resteB = vivants('B');
    let vainqueur = 'nul';
    if (resteA.length && !resteB.length) vainqueur = 'A';
    else if (resteB.length && !resteA.length) vainqueur = 'B';

    if (journal) journal.push({ t: 'fin', vainqueur: vainqueur, tours: tour });

    return {
      vainqueur: vainqueur,
      tours: tour,
      restantA: resteA.length,
      restantB: resteB.length,
      pvA: resteA.reduce(function (s, u) { return s + u.pv; }, 0),
      pvB: resteB.reduce(function (s, u) { return s + u.pv; }, 0),
      journal: journal,
      unites: toutes,
    };
  }

  const api = {
    resoudreCombat: resoudreCombat,
    distance: distance,
    calculerDegats: calculerDegats,
    choisirCible: choisirCible,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Combat = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
