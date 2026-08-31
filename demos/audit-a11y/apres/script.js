/* =============================================================================
   script.js — Version corrigée de la fiche de cours.

   Deux comportements seulement, et chacun corrige un défaut de la version
   d'origine :
     - la galerie de styles, pilotée par un vrai bouton avec aria-expanded
       (C-06 : la version initiale utilisait une <div onclick>) ;
     - la validation du formulaire, avec messages d'erreur explicites annoncés
       dans une région live (C-10 : la version initiale n'en avait aucune).

   Ce qui a été SUPPRIMÉ compte autant :
     - le setInterval du compte à rebours (C-17, critère 2.2.1) ;
     - les gestionnaires onclick sur des éléments non focusables.
   ============================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------- Galerie de styles - */

  var btn = document.getElementById('btn-styles');
  var galerie = document.getElementById('galerie-styles');

  if (btn && galerie) {
    btn.addEventListener('click', function () {
      var ouvert = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!ouvert));
      galerie.hidden = ouvert;
      btn.textContent = ouvert ? 'Voir la galerie de styles' : 'Masquer la galerie de styles';
    });
  }

  /* ------------------------------------------------------------ Formulaire */

  var form = document.querySelector('.formulaire');
  var retour = document.getElementById('retour-formulaire');
  if (!form || !retour) return;

  var CHAMPS = [
    {
      id: 'f-nom',
      libelle: 'Nom et prénom',
      valide: function (v) { return v.trim().length >= 2; },
      message: 'Saisissez votre nom et votre prénom (2 caractères minimum).'
    },
    {
      id: 'f-email',
      libelle: 'Adresse électronique',
      valide: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      message: 'Saisissez une adresse au format nom@domaine.fr.'
    },
    {
      id: 'f-nb',
      libelle: 'Nombre de participants',
      valide: function (v) { var n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 20; },
      message: 'Indiquez un nombre entier entre 1 et 20.'
    }
  ];

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var erreurs = [];

    CHAMPS.forEach(function (c) {
      var el = document.getElementById(c.id);
      var ok = c.valide(el.value);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok) erreurs.push({ id: c.id, libelle: c.libelle, message: c.message });
    });

    retour.hidden = false;

    if (erreurs.length === 0) {
      retour.dataset.etat = 'succes';
      retour.innerHTML = '<strong><span aria-hidden="true">✓</span> Inscription enregistrée.</strong> ' +
        'Un message de confirmation vous a été envoyé.';
      // Le focus va sur le message : l'utilisateur au clavier sait où regarder.
      retour.setAttribute('tabindex', '-1');
      retour.focus();
      return;
    }

    /* Message d'erreur utile : il dit COMBIEN d'erreurs, LESQUELLES, et il
       permet d'aller directement au champ fautif. Un simple « Formulaire
       invalide » oblige l'utilisateur à chercher. */
    retour.dataset.etat = 'erreur';
    retour.innerHTML =
      '<strong><span aria-hidden="true">✕</span> ' + erreurs.length +
      (erreurs.length > 1 ? ' champs sont à corriger' : ' champ est à corriger') + ' :</strong>' +
      '<ul>' + erreurs.map(function (er) {
        return '<li><a href="#' + er.id + '">' + er.libelle + '</a> — ' + er.message + '</li>';
      }).join('') + '</ul>';

    retour.setAttribute('tabindex', '-1');
    retour.focus();
  });
})();
