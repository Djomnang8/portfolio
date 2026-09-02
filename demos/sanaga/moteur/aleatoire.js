/**
 * aleatoire.js — Generateur pseudo-aleatoire deterministe.
 *
 * Math.random() ne convient pas ici : il n'est pas reproductible. Or le banc
 * d'equilibrage doit pouvoir rejouer exactement la meme campagne de 100 000
 * parties apres une modification de valeur, sinon on ne sait pas si l'ecart
 * observe vient du changement ou du hasard.
 *
 * Mulberry32 : 32 bits d'etat, une seule multiplication par appel, periode
 * suffisante pour nos volumes. Le point qui compte n'est pas la qualite
 * statistique — c'est que la meme graine donne toujours la meme suite.
 */

(function (racine) {
  'use strict';

  /**
   * @param {number} graine  entier 32 bits
   * @returns {function(): number} flottant dans [0, 1)
   */
  function creerAleatoire(graine) {
    let etat = graine >>> 0;
    return function () {
      etat = (etat + 0x6D2B79F5) >>> 0;
      let t = etat;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Entier dans [0, n). */
  const entier = (rng, n) => Math.floor(rng() * n);

  /** Element pris au hasard dans une liste non vide. */
  const parmi = (rng, liste) => liste[entier(rng, liste.length)];

  /**
   * Melange de Fisher-Yates, en place.
   * Utilise pour placer les unites : sans melange, chaque duel se jouerait
   * toujours dans la meme disposition et le taux de victoire mesurerait un
   * placement particulier plutot qu'une unite.
   */
  function melanger(rng, liste) {
    for (let i = liste.length - 1; i > 0; i--) {
      const j = entier(rng, i + 1);
      [liste[i], liste[j]] = [liste[j], liste[i]];
    }
    return liste;
  }

  const api = { creerAleatoire, entier, parmi, melanger };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Aleatoire = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
