/* =============================================================================
   module.js — Moteur du module e-learning.

   Principes tenus dans tout ce fichier :
   1. Aucun élément interactif qui ne soit un vrai <button>, <a> ou <input>.
   2. Après chaque changement d'écran, le focus est déplacé explicitement.
   3. Chaque changement d'état est annoncé dans une région aria-live.
   4. L'état ne repose jamais sur la seule couleur : texte et pictogramme aussi.
   5. localStorage est toujours enveloppé dans un try/catch (navigation privée,
      cookies bloqués, iframe restreinte).
   ============================================================================= */

(function () {
  'use strict';

  var C = window.CONTENU;
  if (!C) { console.error('contenu.js non chargé'); return; }

  var CLE = 'a11y-module-v1';

  /* ------------------------------------------------------------- Outils --- */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /** Échappement — utilisé pour toute valeur saisie par l'utilisateur. */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var stockage = {
    lire: function () {
      try { return JSON.parse(localStorage.getItem(CLE)) || {}; }
      catch (e) { return {}; }
    },
    ecrire: function (obj) {
      try { localStorage.setItem(CLE, JSON.stringify(obj)); }
      catch (e) { /* stockage indisponible : le module fonctionne quand même */ }
    }
  };

  /* -------------------------------------------------- Calcul de contraste --
     Même formule que outils/check-contrast.js du Kit Design Pédagogique.
     WCAG 2.1, définition de la luminance relative.                          */

  function hexVersRgb(hex) {
    var h = String(hex).trim().replace(/^#/, '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return [0, 2, 4].map(function (i) { return parseInt(h.slice(i, i + 2), 16); });
  }

  function luminance(rgb) {
    var c = rgb.map(function (v) {
      var s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function ratioContraste(hexA, hexB) {
    var a = hexVersRgb(hexA), b = hexVersRgb(hexB);
    if (!a || !b) return null;
    var la = luminance(a), lb = luminance(b);
    var hi = Math.max(la, lb), lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }

  /* --------------------------------------------------------------- État --- */

  var etat = {
    index: 0,
    quizIndex: 0,
    quizReponses: [],      // indice choisi par question, null si non répondue
    premierRendu: true
  };

  var sauvegarde = stockage.lire();
  if (typeof sauvegarde.index === 'number' && sauvegarde.index < C.ecrans.length) {
    etat.index = sauvegarde.index;
  }
  if (Array.isArray(sauvegarde.quizReponses)) {
    etat.quizReponses = sauvegarde.quizReponses;
  }

  /* Lien profond : #contraste ou ?ecran=contraste ouvre directement un écran.
     Utile pour reprendre un chapitre, en partager un par message, ou le citer
     dans une documentation. L'identifiant est celui de data/contenu.js, donc
     lisible — #clavier plutôt que #3.

     L'URL prime sur la progression enregistrée : quelqu'un qui suit un lien
     veut voir ce qu'on lui a envoyé, pas reprendre où il s'était arrêté. */
  var demande = (location.hash || '').replace('#', '') ||
                (new URLSearchParams(location.search).get('ecran') || '');
  if (demande) {
    var vise = C.ecrans.findIndex
      ? C.ecrans.findIndex(function (e) { return e.id === demande; })
      : -1;
    if (vise >= 0) etat.index = vise;
  }

  function persister() {
    var s = stockage.lire();
    s.index = etat.index;
    s.quizReponses = etat.quizReponses;
    stockage.ecrire(s);
  }

  /* ---------------------------------------------------------- Annonces ---- */

  var zoneAnnonces = $('#annonces');
  var minuteurAnnonce = null;

  /** Écrit dans la région aria-live. Le vidage préalable force la relecture
      quand le même texte est annoncé deux fois de suite. */
  function annoncer(texte) {
    if (!zoneAnnonces) return;
    clearTimeout(minuteurAnnonce);
    zoneAnnonces.textContent = '';
    minuteurAnnonce = setTimeout(function () {
      zoneAnnonces.textContent = texte;
    }, 60);
  }

  /* ---------------------------------------------------------- Réglages ---- */

  var racine = document.documentElement;

  function appliquerReglages() {
    var r = stockage.lire().reglages || {};
    var theme = r.theme || 'auto';

    if (theme === 'auto') racine.removeAttribute('data-theme');
    else racine.setAttribute('data-theme', theme);

    if (r.textsize && r.textsize !== 'normal') racine.setAttribute('data-textsize', r.textsize);
    else racine.removeAttribute('data-textsize');

    if (r.contraste) racine.setAttribute('data-contrast', 'high');
    else racine.removeAttribute('data-contrast');

    if (r.lisible) racine.setAttribute('data-lisible', 'on');
    else racine.removeAttribute('data-lisible');

    // Reflet dans les contrôles
    var radioTheme = $('input[name="theme"][value="' + theme + '"]');
    if (radioTheme) radioTheme.checked = true;
    var radioTaille = $('input[name="textsize"][value="' + (r.textsize || 'normal') + '"]');
    if (radioTaille) radioTaille.checked = true;
    $('#opt-contraste').checked = !!r.contraste;
    $('#opt-lisible').checked = !!r.lisible;
  }

  function majReglage(cle, valeur) {
    var s = stockage.lire();
    s.reglages = s.reglages || {};
    s.reglages[cle] = valeur;
    stockage.ecrire(s);
    appliquerReglages();
  }

  function initReglages() {
    var btn = $('#btn-reglages');
    var panneau = $('#panneau-reglages');

    btn.addEventListener('click', function () {
      var ouvert = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!ouvert));
      panneau.hidden = ouvert;
      if (!ouvert) {
        // On donne le focus au premier contrôle du panneau ouvert.
        var premier = $('input', panneau);
        if (premier) premier.focus();
        annoncer('Panneau de réglages ouvert.');
      } else {
        annoncer('Panneau de réglages fermé.');
      }
    });

    // Échap ferme le panneau et rend le focus au bouton déclencheur.
    panneau.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        btn.setAttribute('aria-expanded', 'false');
        panneau.hidden = true;
        btn.focus();
        annoncer('Panneau de réglages fermé.');
      }
    });

    $$('input[name="theme"]').forEach(function (i) {
      i.addEventListener('change', function () {
        majReglage('theme', i.value);
        annoncer('Thème : ' + i.nextElementSibling.textContent.trim() + '.');
      });
    });
    $$('input[name="textsize"]').forEach(function (i) {
      i.addEventListener('change', function () {
        majReglage('textsize', i.value);
        annoncer('Taille du texte : ' + i.nextElementSibling.textContent.trim() + '.');
      });
    });
    $('#opt-contraste').addEventListener('change', function (e) {
      majReglage('contraste', e.target.checked);
      annoncer('Contraste renforcé ' + (e.target.checked ? 'activé' : 'désactivé') + '.');
    });
    $('#opt-lisible').addEventListener('change', function (e) {
      majReglage('lisible', e.target.checked);
      annoncer('Confort de lecture ' + (e.target.checked ? 'activé' : 'désactivé') + '.');
    });

    // On informe l'utilisateur que sa préférence système est prise en compte.
    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('#etat-animations').textContent = reduit
      ? 'Animations désactivées : votre système demande un mouvement réduit, le module le respecte.'
      : 'Animations actives. Elles se désactivent automatiquement si vous activez « Réduire les animations » dans votre système.';

    appliquerReglages();
  }

  /* ------------------------------------------------------- Rendu écrans --- */

  function blocIllustration(ill) {
    if (!ill) return '';
    return '<figure class="ecran__illustration">' +
      '<img src="' + ill.src + '" alt="' + esc(ill.alt) + '">' +
      '<figcaption class="ecran__legende">Illustration produite pour ce module. ' +
      'Son alternative textuelle figure dans le code source, elle est reprise mot pour mot ' +
      'dans la version texte intégrale en bas de page.</figcaption>' +
      '</figure>';
  }

  function blocEncadre(e) {
    if (!e) return '';
    var picto = { attention: '⚠', info: 'ℹ', astuce: '💡', retenir: '✔' }[e.type] || 'ℹ';
    return '<aside class="encadre encadre--' + e.type + '">' +
      '<h3><span aria-hidden="true">' + picto + '</span> ' + esc(e.titre) + '</h3>' +
      '<p>' + e.texte + '</p></aside>';
  }

  function rendreIntro(e) {
    return '<div class="ecran__entete">' +
        '<h2 id="titre-ecran" tabindex="-1">' + esc(e.titre) + '</h2>' +
      '</div>' +
      '<div class="ecran__grille">' +
        '<div>' +
          '<p class="intro__accroche">' + esc(e.accroche) + '</p>' +
          e.corps.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
          '<h3>Au programme</h3>' +
          '<ol class="sommaire">' + e.chapitres.map(function (c) {
            return '<li>' + esc(c) + '</li>';
          }).join('') + '</ol>' +
          '<h3>Fiche du module</h3>' +
          '<dl class="fiche">' +
            '<dt>Durée</dt><dd>' + esc(e.duree) + '</dd>' +
            '<dt>Public</dt><dd>' + esc(C.meta.public) + '</dd>' +
            '<dt>Prérequis</dt><dd>' + esc(C.meta.prerequis) + '</dd>' +
            '<dt>Objectifs</dt><dd><ul style="margin:0;padding-left:1.1em">' +
              C.objectifs.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') +
            '</ul></dd>' +
          '</dl>' +
        '</div>' +
        blocIllustration(e.illustration) +
      '</div>';
  }

  function rendreLecon(e) {
    var liste = '';
    if (e.liste) {
      liste = '<h3>' + esc(e.liste.titre) + '</h3><ul class="liste-regles">' +
        e.liste.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
    }
    return '<div class="ecran__entete">' +
        '<span class="ecran__numero">Chapitre ' + e.numero + ' sur 4</span>' +
        '<h2 id="titre-ecran" tabindex="-1">' + esc(e.titre) + '</h2>' +
        '<p class="ecran__objectif"><strong>Objectif :</strong> ' + esc(e.objectif) + '</p>' +
      '</div>' +
      '<div class="ecran__grille">' +
        '<div>' +
          e.corps.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
          liste +
          blocEncadre(e.encadre) +
          '<div id="zone-exercice"></div>' +
          blocEncadre({ type: 'retenir', titre: 'À retenir', texte: e.aRetenir }) +
        '</div>' +
        blocIllustration(e.illustration) +
      '</div>';
  }

  function rendreQuiz(e) {
    return '<div class="ecran__entete">' +
        '<h2 id="titre-ecran" tabindex="-1">' + esc(e.titre) + '</h2>' +
        '<p>' + esc(e.intro) + '</p>' +
      '</div>' +
      '<div id="zone-quiz"></div>';
  }

  function rendreBilan(e) {
    var q = C.ecrans[5];
    var repondu = etat.quizReponses.filter(function (r) { return r !== null && r !== undefined; }).length;
    var score = etat.quizReponses.reduce(function (n, r, i) {
      return n + (r === q.questions[i].bonne ? 1 : 0);
    }, 0);

    var blocScore = '';
    if (repondu === q.questions.length) {
      var reussi = score >= q.seuilReussite;
      blocScore = '<div class="score">' +
        '<p class="score__chiffre" style="margin:0;color:' +
          (reussi ? 'var(--pk-success)' : 'var(--pk-accent)') + '">' + score + '/' + q.questions.length + '</p>' +
        '<p class="score__mention" style="margin:0">' +
          (reussi
            ? '<strong>Module validé.</strong> Vous avez atteint le seuil de ' + q.seuilReussite +
              ' bonnes réponses sur ' + q.questions.length + '.'
            : '<strong>Presque.</strong> Le seuil est de ' + q.seuilReussite + ' bonnes réponses sur ' +
              q.questions.length + '. Reprenez le quiz : les retours détaillés vous donnent la logique de chaque réponse.') +
        '</p></div>';
    } else {
      blocScore = '<div class="score"><p class="score__mention" style="margin:0">' +
        'Vous n’avez pas encore terminé le quiz. ' + repondu + ' question(s) sur ' + q.questions.length + ' répondue(s).' +
        '</p></div>';
    }

    return '<div class="ecran__entete">' +
        '<h2 id="titre-ecran" tabindex="-1">' + esc(e.titre) + '</h2>' +
      '</div>' +
      '<div class="ecran__grille">' +
        '<div>' + blocScore + '</div>' +
        blocIllustration(e.illustration) +
      '</div>' +
      '<h3>Les quatre points du module</h3>' +
      '<div class="recap">' + e.recap.map(function (r) {
        return '<div class="recap__carte"><h3>' + esc(r.titre) + '</h3><p>' + esc(r.texte) + '</p></div>';
      }).join('') + '</div>' +
      '<h3>Pour aller plus loin</h3>' +
      '<ul class="liens-plus">' + e.pourAllerPlusLoin.map(function (l) {
        return '<li><a href="' + l.url + '" target="_blank" rel="noopener">' +
          esc(l.label) + ' <span aria-hidden="true">↗</span>' +
          '<span class="sr-only"> (nouvel onglet)</span></a></li>';
      }).join('') + '</ul>' +
      '<button type="button" class="btn btn--secondaire" id="btn-recommencer">Recommencer le module</button>';
  }

  /* ------------------------------------------------- Exercice : contraste - */

  function initExoContraste(hote) {
    hote.innerHTML =
      '<section class="exo">' +
        '<h3 class="exo__titre"><span class="exo__badge">Exercice</span> Mesurez vous-même</h3>' +
        '<p class="exo__consigne">Modifiez les deux couleurs et observez le ratio. ' +
          'Le calcul appliqué ici est exactement celui de la norme WCAG 2.1.</p>' +
        '<div class="contraste__reglages">' +
          '<div class="contraste__champ">' +
            '<label for="c-texte">Couleur du texte</label>' +
            '<span class="contraste__saisie">' +
              '<input type="color" id="c-texte-picker" value="#8C9BB5" aria-label="Sélecteur visuel de la couleur du texte">' +
              '<input type="text" id="c-texte" value="#8C9BB5" maxlength="7" spellcheck="false" ' +
                     'inputmode="text" autocomplete="off" aria-describedby="c-aide">' +
            '</span>' +
          '</div>' +
          '<div class="contraste__champ">' +
            '<label for="c-fond">Couleur du fond</label>' +
            '<span class="contraste__saisie">' +
              '<input type="color" id="c-fond-picker" value="#FFFFFF" aria-label="Sélecteur visuel de la couleur du fond">' +
              '<input type="text" id="c-fond" value="#FFFFFF" maxlength="7" spellcheck="false" ' +
                     'inputmode="text" autocomplete="off">' +
            '</span>' +
          '</div>' +
        '</div>' +
        '<p id="c-aide" class="exo__consigne" style="margin-bottom:var(--pk-space-sm)">' +
          'Format hexadécimal, par exemple #1D4ED8.</p>' +

        '<div class="contraste__apercu" id="c-apercu">' +
          '<p class="petit">Texte courant en 14 pixels — seuil AA : 4,5:1</p>' +
          '<p class="grand">Grand titre en 24 pixels — seuil AA : 3:1</p>' +
        '</div>' +

        '<div class="contraste__resultat">' +
          '<p class="contraste__ratio" id="c-ratio" style="margin:0">—</p>' +
          '<div class="verdicts" id="c-verdicts"></div>' +
        '</div>' +

        '<div class="contraste__presets">' +
          '<button type="button" class="puce" data-fg="#8C9BB5" data-bg="#FFFFFF">Le gris « élégant »</button>' +
          '<button type="button" class="puce" data-fg="#767676" data-bg="#FFFFFF">Le minimum syndical</button>' +
          '<button type="button" class="puce" data-fg="#16213E" data-bg="#FFFFFF">La palette de ce module</button>' +
          '<button type="button" class="puce" data-fg="#FFFFFF" data-bg="#1D4ED8">Bouton principal</button>' +
        '</div>' +

        '<p class="sr-only" role="status" id="c-annonce"></p>' +
      '</section>';

    var champTexte = $('#c-texte', hote), champFond = $('#c-fond', hote);
    var pickTexte = $('#c-texte-picker', hote), pickFond = $('#c-fond-picker', hote);
    var apercu = $('#c-apercu', hote), sortieRatio = $('#c-ratio', hote);
    var verdicts = $('#c-verdicts', hote), annonceExo = $('#c-annonce', hote);

    function normaliser(v) {
      var t = String(v).trim();
      if (t && t[0] !== '#') t = '#' + t;
      return t;
    }

    function recalculer() {
      var fg = normaliser(champTexte.value);
      var bg = normaliser(champFond.value);
      var r = ratioContraste(fg, bg);

      if (r === null) {
        sortieRatio.textContent = '—';
        verdicts.innerHTML = '<span class="verdict verdict--echec">' +
          '<span aria-hidden="true">✕</span> Couleur non valide</span>';
        return;
      }

      apercu.style.background = bg;
      apercu.style.color = fg;
      pickTexte.value = fg; pickFond.value = bg;

      var arrondi = Math.round(r * 100) / 100;
      // La virgule décimale est la convention française, y compris à l'oral.
      sortieRatio.textContent = arrondi.toFixed(2).replace('.', ',') + ':1';
      sortieRatio.style.color = r >= 4.5 ? 'var(--pk-success)' : (r >= 3 ? 'var(--pk-accent)' : 'var(--pk-danger)');

      var tests = [
        { label: 'Texte courant (4,5:1)', ok: r >= 4.5 },
        { label: 'Grand texte (3:1)',     ok: r >= 3 },
        { label: 'Niveau AAA (7:1)',      ok: r >= 7 }
      ];
      verdicts.innerHTML = tests.map(function (t) {
        return '<span class="verdict verdict--' + (t.ok ? 'ok' : 'echec') + '">' +
          '<span aria-hidden="true">' + (t.ok ? '✓' : '✕') + '</span> ' +
          t.label + ' : ' + (t.ok ? 'conforme' : 'non conforme') + '</span>';
      }).join('');

      annonceExo.textContent = 'Ratio ' + arrondi.toFixed(2).replace('.', ',') + ' pour 1. ' +
        'Texte courant : ' + (r >= 4.5 ? 'conforme' : 'non conforme') + '.';
    }

    [champTexte, champFond].forEach(function (c) { c.addEventListener('input', recalculer); });
    pickTexte.addEventListener('input', function () { champTexte.value = pickTexte.value.toUpperCase(); recalculer(); });
    pickFond.addEventListener('input', function () { champFond.value = pickFond.value.toUpperCase(); recalculer(); });

    $$('.puce', hote).forEach(function (b) {
      b.addEventListener('click', function () {
        champTexte.value = b.dataset.fg;
        champFond.value = b.dataset.bg;
        recalculer();
      });
    });

    recalculer();
  }

  /* ---------------------------------------------- Exercice : alternatives - */

  var CAS_ALT = [
    {
      visuel: 'img/exo-alt-graphique.svg',
      contexte: 'Dans un module sur les résultats annuels, ce graphique illustre la phrase : « la participation a progressé sur les trois derniers trimestres ».',
      options: [
        'Graphique en barres bleues',
        'Image d’illustration',
        'Graphique en barres : participation de 42 % au T2, 58 % au T3 et 71 % au T4.'
      ],
      bonne: 2,
      feedback: {
        juste: 'Exact. Le lecteur d’écran restitue l’information, pas la forme. Quelqu’un qui n’a jamais vu le graphique en tire la même conclusion que vous.',
        faux: 'Il faut restituer les données. « Graphique en barres bleues » décrit l’apparence et laisse l’information inaccessible : l’auditeur sait qu’il y a un graphique, mais pas ce qu’il montre.'
      }
    },
    {
      visuel: 'img/exo-alt-motif.svg',
      contexte: 'Cette frise ondulée sépare deux sections du module. Elle ne porte aucune information.',
      options: [
        'Une alternative vide',
        'Frise décorative ondulée bleue',
        'Séparateur de section'
      ],
      bonne: 0,
      feedback: {
        juste: 'Exact. Une alternative vide retire l’image de la restitution vocale. C’est la bonne façon de dire « il n’y a rien à écouter ici ».',
        faux: 'Décrire une image purement décorative alourdit l’écoute sans rien apporter. Sur un module qui en contient vingt, c’est vingt interruptions inutiles.'
      }
    },
    {
      visuel: 'img/exo-alt-icone.svg',
      contexte: 'Cette icône en forme de disquette est le bouton qui enregistre la progression de l’apprenant.',
      options: [
        'Disquette',
        'Enregistrer ma progression',
        'Icône de sauvegarde bleue'
      ],
      bonne: 1,
      feedback: {
        juste: 'Exact. Pour une image cliquable, l’alternative décrit l’action, jamais le dessin. L’utilisateur veut savoir ce que fait le bouton.',
        faux: 'Pour une image cliquable, l’alternative doit décrire l’action déclenchée. « Disquette » oblige l’auditeur à deviner la fonction à partir d’un objet que beaucoup n’ont jamais utilisé.'
      }
    }
  ];

  function initExoAlt(hote) {
    var i = 0;
    var reponses = [];

    function dessiner() {
      var cas = CAS_ALT[i];
      hote.innerHTML =
        '<section class="exo">' +
          '<h3 class="exo__titre"><span class="exo__badge">Exercice</span> Choisissez la bonne alternative</h3>' +
          '<p class="exo__consigne">Cas ' + (i + 1) + ' sur ' + CAS_ALT.length + '</p>' +
          '<figure style="margin:var(--pk-space-sm) 0">' +
            '<img src="' + cas.visuel + '" alt="" style="max-width:min(100%,22rem);border:1px solid var(--pk-border-soft);border-radius:var(--pk-radius-md);background:var(--pk-surface)">' +
            '<figcaption class="exo__consigne" style="margin-top:var(--pk-space-3xs)">' + esc(cas.contexte) + '</figcaption>' +
          '</figure>' +
          '<div class="choix" role="group" aria-label="Propositions d’alternative textuelle">' +
            cas.options.map(function (o, n) {
              return '<button type="button" class="choix__option" data-n="' + n + '">' +
                '<span class="choix__lettre" aria-hidden="true">' + 'ABC'[n] + '</span>' +
                '<span>' + esc(o) + '</span></button>';
            }).join('') +
          '</div>' +
          '<div id="alt-retour" aria-live="polite"></div>' +
        '</section>';

      $$('.choix__option', hote).forEach(function (b) {
        b.addEventListener('click', function () { repondre(parseInt(b.dataset.n, 10)); });
      });
    }

    function repondre(n) {
      var cas = CAS_ALT[i];
      var juste = n === cas.bonne;
      reponses[i] = juste;

      $$('.choix__option', hote).forEach(function (b) {
        var bn = parseInt(b.dataset.n, 10);
        b.disabled = true;
        if (bn === cas.bonne) {
          b.dataset.etat = 'juste';
          b.insertAdjacentHTML('beforeend',
            '<span class="choix__marque"><span aria-hidden="true">✓</span><span class="sr-only">Bonne réponse</span></span>');
        } else if (bn === n) {
          b.dataset.etat = 'faux';
          b.insertAdjacentHTML('beforeend',
            '<span class="choix__marque"><span aria-hidden="true">✕</span><span class="sr-only">Réponse incorrecte</span></span>');
        }
      });

      var suivant = i < CAS_ALT.length - 1
        ? '<button type="button" class="btn btn--principal" id="alt-suivant" style="margin-top:var(--pk-space-sm)">Cas suivant</button>'
        : '<p style="margin:var(--pk-space-sm) 0 0"><strong>Exercice terminé — ' +
          reponses.filter(Boolean).length + ' bonne(s) réponse(s) sur ' + CAS_ALT.length + '.</strong></p>';

      $('#alt-retour', hote).innerHTML =
        '<div class="retour" data-etat="' + (juste ? 'juste' : 'faux') + '">' +
          '<span class="retour__titre">' + (juste ? '✓ Bonne réponse' : '✕ Ce n’est pas la bonne') + '</span>' +
          '<p>' + (juste ? cas.feedback.juste : cas.feedback.faux) + '</p>' +
          suivant +
        '</div>';

      var btnSuiv = $('#alt-suivant', hote);
      if (btnSuiv) {
        btnSuiv.addEventListener('click', function () { i++; dessiner(); $('.choix__option', hote).focus(); });
        btnSuiv.focus();
      }
    }

    dessiner();
  }

  /* -------------------------------------------------- Exercice : clavier -- */

  function initExoClavier(hote) {
    hote.innerHTML =
      '<section class="exo">' +
        '<h3 class="exo__titre"><span class="exo__badge">Exercice</span> Le bac à sable clavier</h3>' +
        '<p class="exo__consigne">Cliquez dans la zone ci-dessous, puis appuyez plusieurs fois sur ' +
          '<kbd>Tab</kbd>. Chaque élément atteint se marque avec son rang de passage.</p>' +

        '<div class="clavier__bac">' +
          '<div class="clavier__rangee">' +
            '<button type="button" class="clavier__cible" data-cible>Champ 1</button>' +
            '<button type="button" class="clavier__cible" data-cible>Champ 2</button>' +
            '<span class="clavier__faux-bouton" id="faux-bouton" role="presentation">' +
              '<span aria-hidden="true">✕</span>&nbsp;Faux bouton (boîte cliquable)</span>' +
            '<button type="button" class="clavier__cible" data-cible>Valider</button>' +
          '</div>' +
        '</div>' +

        '<p class="clavier__compteur" id="clavier-compteur" role="status">0 / 3 élément(s) atteint(s) au clavier.</p>' +

        '<label class="interrupteur" style="margin:var(--pk-space-sm) 0">' +
          '<input type="checkbox" id="opt-focus-cache">' +
          '<span class="interrupteur__piste" aria-hidden="true"></span>' +
          '<span class="interrupteur__libelle">Masquer le contour de focus' +
            '<span class="interrupteur__note">Simule le défaut le plus courant : refaites un Tab pour voir la différence</span>' +
          '</span>' +
        '</label>' +

        '<div id="clavier-verdict"></div>' +
      '</section>';

    var atteints = 0;
    var compteur = $('#clavier-compteur', hote);
    var verdict = $('#clavier-verdict', hote);

    $$('[data-cible]', hote).forEach(function (cible) {
      cible.addEventListener('focus', function () {
        if (cible.dataset.atteint === 'oui') return;
        atteints++;
        cible.dataset.atteint = 'oui';
        cible.insertAdjacentHTML('afterbegin',
          '<span class="clavier__ordre" aria-hidden="true">' + atteints + '</span>');
        compteur.textContent = atteints + ' / 3 élément(s) atteint(s) au clavier.';

        if (atteints === 3) {
          verdict.innerHTML = '<div class="retour" data-etat="faux">' +
            '<span class="retour__titre">Le constat</span>' +
            '<p>Vous avez atteint les trois vrais boutons. Le quatrième élément, ' +
            '« Faux bouton », n’a jamais reçu le focus : c’est une simple boîte à laquelle ' +
            'on a greffé un gestionnaire de clic. Elle fonctionne à la souris, elle n’existe pas au clavier. ' +
            'C’est exactement ce qui se produit quand on fabrique un bouton avec autre chose qu’un bouton.</p>' +
            '</div>';
        }
      });
    });

    // Le faux bouton réagit au clic — et seulement au clic. C'est le propos.
    $('#faux-bouton', hote).addEventListener('click', function () {
      annoncer('Le faux bouton a réagi au clic de souris, mais il reste inatteignable au clavier.');
    });

    $('#opt-focus-cache', hote).addEventListener('change', function (e) {
      var bac = $('.clavier__bac', hote);
      if (e.target.checked) {
        bac.style.setProperty('--demo-focus', 'none');
        $$('[data-cible]', hote).forEach(function (c) { c.style.outline = 'none'; });
        annoncer('Contour de focus masqué. Appuyez sur Tab : vous ne voyez plus où vous êtes.');
      } else {
        $$('[data-cible]', hote).forEach(function (c) { c.style.outline = ''; });
        annoncer('Contour de focus rétabli.');
      }
    });
  }

  /* ------------------------------------------------ Exercice : structure -- */

  var PLAN = [
    { niveau: 1, texte: 'Guide de démarrage', erreur: false },
    { niveau: 2, texte: 'Objectifs pédagogiques', erreur: false },
    { niveau: 4, texte: 'Prérequis', erreur: true, pourquoi: 'Saut de niveau : on passe du niveau 2 au niveau 4 sans passer par le 3.' },
    { niveau: 2, texte: 'Déroulé du module', erreur: false },
    { niveau: 3, texte: 'Séance 1 : les fondamentaux', erreur: false },
    { niveau: 3, texte: 'Séance 2 : mise en pratique', erreur: false },
    { niveau: 1, texte: 'Ressources complémentaires', erreur: true, pourquoi: 'Deuxième titre de niveau 1 : il ne doit y en avoir qu’un seul, celui du document.' },
    { niveau: 2, texte: 'Bibliographie', erreur: false },
    { niveau: 5, texte: 'Contacts', erreur: true, pourquoi: 'Saut de niveau : du niveau 2 au niveau 5 d’un coup.' }
  ];

  function initExoStructure(hote) {
    var choisis = {};
    var corrige = false;

    function dessiner() {
      hote.innerHTML =
        '<section class="exo">' +
          '<h3 class="exo__titre"><span class="exo__badge">Exercice</span> Repérez les titres fautifs</h3>' +
          '<p class="exo__consigne">Voici le plan d’un support de cours. ' +
            'Trois titres cassent la hiérarchie. Sélectionnez-les, puis vérifiez.</p>' +
          '<ul class="plan">' + PLAN.map(function (t, n) {
            var etat = '';
            if (corrige) {
              if (t.erreur && choisis[n]) etat = 'trouve';
              else if (!t.erreur && choisis[n]) etat = 'rate';
              else if (t.erreur && !choisis[n]) etat = 'manque';
            } else if (choisis[n]) {
              etat = 'selection';
            }
            return '<li><button type="button" class="plan__ligne" data-n="' + n + '"' +
              (etat ? ' data-etat="' + etat + '"' : '') +
              (corrige ? ' disabled' : '') +
              ' aria-pressed="' + (choisis[n] ? 'true' : 'false') + '"' +
              ' style="margin-left:' + ((t.niveau - 1) * 1.4) + 'rem">' +
              '<span class="plan__niveau">H' + t.niveau + '</span>' +
              '<span>' + esc(t.texte) + '</span>' +
              (corrige && t.erreur ? '<span class="choix__marque" aria-hidden="true">' + (choisis[n] ? '✓' : '!') + '</span>' : '') +
              (corrige && t.erreur ? '<span class="sr-only">Titre fautif</span>' : '') +
              '</button></li>';
          }).join('') + '</ul>' +
          (corrige ? '' : '<button type="button" class="btn btn--principal" id="plan-verifier">Vérifier ma sélection</button>') +
          '<div id="plan-retour" aria-live="polite"></div>' +
        '</section>';

      if (!corrige) {
        $$('.plan__ligne', hote).forEach(function (b) {
          b.addEventListener('click', function () {
            var n = b.dataset.n;
            choisis[n] = !choisis[n];
            b.setAttribute('aria-pressed', choisis[n] ? 'true' : 'false');
            b.dataset.etat = choisis[n] ? 'selection' : '';
            if (!choisis[n]) b.removeAttribute('data-etat');
          });
        });
        $('#plan-verifier', hote).addEventListener('click', verifier);
      }
    }

    function verifier() {
      corrige = true;
      var attendus = PLAN.map(function (t, n) { return t.erreur ? n : -1; }).filter(function (n) { return n >= 0; });
      var trouves = attendus.filter(function (n) { return choisis[n]; });
      var faussesAlertes = Object.keys(choisis).filter(function (n) { return choisis[n] && !PLAN[n].erreur; });

      dessiner();

      var detail = attendus.map(function (n) {
        return '<li><strong>H' + PLAN[n].niveau + ' — ' + esc(PLAN[n].texte) + '</strong> : ' + esc(PLAN[n].pourquoi) + '</li>';
      }).join('');

      $('#plan-retour', hote).innerHTML =
        '<div class="retour" data-etat="' + (trouves.length === 3 && faussesAlertes.length === 0 ? 'juste' : 'faux') + '" tabindex="-1" id="plan-focus">' +
          '<span class="retour__titre">' + trouves.length + ' erreur(s) trouvée(s) sur 3' +
            (faussesAlertes.length ? ' — ' + faussesAlertes.length + ' fausse(s) alerte(s)' : '') + '</span>' +
          '<p>Les trois titres fautifs :</p>' +
          '<ul style="margin:0;padding-left:1.2em">' + detail + '</ul>' +
        '</div>';

      $('#plan-focus', hote).focus();
      annoncer(trouves.length + ' erreurs trouvées sur 3.');
    }

    dessiner();
  }

  /* ------------------------------------------------------------- Quiz ----- */

  function initQuiz(hote) {
    var e = C.ecrans[5];

    // On reprend à la première question sans réponse.
    var i = 0;
    while (i < e.questions.length && etat.quizReponses[i] !== null && etat.quizReponses[i] !== undefined) i++;
    if (i >= e.questions.length) i = e.questions.length - 1;
    etat.quizIndex = i;

    function dessiner() {
      var q = e.questions[etat.quizIndex];
      var dejaRepondu = etat.quizReponses[etat.quizIndex] !== null && etat.quizReponses[etat.quizIndex] !== undefined;

      hote.innerHTML =
        '<section class="exo">' +
          '<p class="quiz__compteur">Question ' + (etat.quizIndex + 1) + ' sur ' + e.questions.length + '</p>' +
          '<p class="quiz__enonce" id="quiz-enonce" tabindex="-1">' + esc(q.enonce) + '</p>' +
          '<div class="choix" role="group" aria-labelledby="quiz-enonce">' +
            q.options.map(function (o, n) {
              return '<button type="button" class="choix__option" data-n="' + n + '">' +
                '<span class="choix__lettre" aria-hidden="true">' + 'ABCD'[n] + '</span>' +
                '<span>' + esc(o) + '</span></button>';
            }).join('') +
          '</div>' +
          '<div id="quiz-retour" aria-live="polite"></div>' +
        '</section>';

      $$('.choix__option', hote).forEach(function (b) {
        b.addEventListener('click', function () { repondre(parseInt(b.dataset.n, 10)); });
      });

      if (dejaRepondu) repondre(etat.quizReponses[etat.quizIndex], true);
      majBoutonSuivant();
    }

    function repondre(n, silencieux) {
      var q = e.questions[etat.quizIndex];
      var juste = n === q.bonne;
      etat.quizReponses[etat.quizIndex] = n;
      persister();

      $$('.choix__option', hote).forEach(function (b) {
        var bn = parseInt(b.dataset.n, 10);
        b.disabled = true;
        if (bn === q.bonne) {
          b.dataset.etat = 'juste';
          b.insertAdjacentHTML('beforeend',
            '<span class="choix__marque"><span aria-hidden="true">✓</span><span class="sr-only">Bonne réponse</span></span>');
        } else if (bn === n) {
          b.dataset.etat = 'faux';
          b.insertAdjacentHTML('beforeend',
            '<span class="choix__marque"><span aria-hidden="true">✕</span><span class="sr-only">Votre réponse, incorrecte</span></span>');
        }
      });

      var dernier = etat.quizIndex === e.questions.length - 1;
      var boutonSuite = dernier
        ? '<button type="button" class="btn btn--principal" id="quiz-fin" style="margin-top:var(--pk-space-sm)">Voir mon bilan</button>'
        : '<button type="button" class="btn btn--principal" id="quiz-suivant" style="margin-top:var(--pk-space-sm)">Question suivante</button>';

      $('#quiz-retour', hote).innerHTML =
        '<div class="retour" data-etat="' + (juste ? 'juste' : 'faux') + '">' +
          '<span class="retour__titre">' + (juste ? '✓ Bonne réponse' : '✕ Réponse incorrecte') + '</span>' +
          '<p>' + esc(juste ? q.feedback.juste : q.feedback.faux) + '</p>' +
          boutonSuite +
        '</div>';

      var suiv = $('#quiz-suivant', hote);
      if (suiv) suiv.addEventListener('click', function () {
        etat.quizIndex++;
        dessiner();
        $('#quiz-enonce', hote).focus();
      });

      var fin = $('#quiz-fin', hote);
      if (fin) fin.addEventListener('click', function () { aller(6); });

      if (!silencieux) annoncer(juste ? 'Bonne réponse.' : 'Réponse incorrecte.');
      majBoutonSuivant();
    }

    function majBoutonSuivant() {
      var complet = e.questions.every(function (_, n) {
        return etat.quizReponses[n] !== null && etat.quizReponses[n] !== undefined;
      });
      var btn = $('#btn-suiv');
      btn.disabled = !complet;
      btn.title = complet ? '' : 'Répondez aux cinq questions pour accéder au bilan.';
    }

    dessiner();
  }

  /* -------------------------------------------------------- Navigation ---- */

  var zoneEcran = $('#ecran');
  var btnPrec = $('#btn-prec');
  var btnSuiv = $('#btn-suiv');

  function majProgression() {
    var total = C.ecrans.length;
    var pct = Math.round((etat.index / (total - 1)) * 100);
    var texte = 'Écran ' + (etat.index + 1) + ' sur ' + total;

    $('#progression-remplissage').style.width = pct + '%';
    $('#progression-texte').textContent = texte;
    $('#progression-pct').textContent = pct + ' %';

    var barre = $('#barre-progression');
    barre.setAttribute('aria-valuenow', String(pct));
    barre.setAttribute('aria-valuetext', texte + ', ' + pct + ' pour cent');

    $('#fil').innerHTML = C.ecrans.map(function (e, n) {
      var etatPoint = n < etat.index ? 'fait' : (n === etat.index ? 'actuel' : 'avenir');
      return '<li class="fil__point" data-etat="' + etatPoint + '" title="' + esc(e.titre) + '"></li>';
    }).join('');
  }

  function aller(n) {
    if (n < 0 || n >= C.ecrans.length) return;
    etat.index = n;
    persister();
    rendre();
  }

  function rendre() {
    var e = C.ecrans[etat.index];
    var html = '';

    if (e.type === 'intro')  html = rendreIntro(e);
    if (e.type === 'lecon')  html = rendreLecon(e);
    if (e.type === 'quiz')   html = rendreQuiz(e);
    if (e.type === 'bilan')  html = rendreBilan(e);

    zoneEcran.innerHTML = html;

    // Exercice propre à l'écran
    var hote = $('#zone-exercice', zoneEcran);
    if (hote && e.interaction) {
      if (e.interaction.type === 'contraste') initExoContraste(hote);
      if (e.interaction.type === 'alt')       initExoAlt(hote);
      if (e.interaction.type === 'clavier')   initExoClavier(hote);
      if (e.interaction.type === 'structure') initExoStructure(hote);
    }
    if (e.type === 'quiz') initQuiz($('#zone-quiz', zoneEcran));

    if (e.type === 'bilan') {
      $('#btn-recommencer').addEventListener('click', function () {
        etat.quizReponses = [];
        etat.quizIndex = 0;
        aller(0);
        annoncer('Module réinitialisé. Retour à l’écran d’accueil.');
      });
    }

    // Boutons de navigation
    btnPrec.disabled = etat.index === 0;
    if (e.type !== 'quiz') {
      btnSuiv.disabled = etat.index === C.ecrans.length - 1;
      btnSuiv.title = '';
    }
    btnSuiv.innerHTML = etat.index === C.ecrans.length - 1
      ? 'Fin du module'
      : 'Suivant <span aria-hidden="true">→</span>';

    majProgression();
    document.title = e.titre + ' — ' + C.meta.titre;

    // L'adresse suit la navigation : copier l'URL partage l'ecran affiche.
    // replaceState plutot que pushState : le bouton Retour du navigateur doit
    // ramener a la page precedente, pas rejouer les sept ecrans a l'envers.
    try {
      history.replaceState(null, '', '#' + e.id);
    } catch (err) { /* file:// n'autorise pas l'historique */ }

    // WCAG 2.4.3 : après un changement de vue, on replace le focus en tête
    // du nouveau contenu. Sans cela, l'utilisateur au clavier reste sur le
    // bouton « Suivant » et ne sait pas que la page a changé.
    if (!etat.premierRendu) {
      var titre = $('#titre-ecran', zoneEcran);
      if (titre) titre.focus();
      annoncer(e.titre + '. Écran ' + (etat.index + 1) + ' sur ' + C.ecrans.length + '.');
    }
    etat.premierRendu = false;
  }

  btnPrec.addEventListener('click', function () { aller(etat.index - 1); });
  btnSuiv.addEventListener('click', function () { aller(etat.index + 1); });

  /* Pas de raccourci flèche gauche / flèche droite sur le document.
     C'était la première version, et le test l'a invalidée : les flèches
     servent nativement à faire défiler la page. Les capter globalement
     fait sauter des écrans à toute personne qui défile au clavier —
     c'est-à-dire précisément le public que ce module cherche à servir.
     Voir 04-accessibilite/audit-wcag.md, décision D-02.

     La navigation passe donc uniquement par les deux boutons, qui sont
     dans l'ordre de tabulation et annoncés correctement. */

  /* -------------------------------------------- Version texte intégrale --- */

  function construireVersionTexte() {
    var out = ['<p><em>Version linéaire de l’ensemble du module, destinée à la lecture ' +
               'suivie, à l’impression ou à la consultation hors interface.</em></p>'];

    C.ecrans.forEach(function (e) {
      out.push('<h3>' + esc(e.titre) + '</h3>');
      if (e.illustration) {
        out.push('<p><strong>Illustration —</strong> ' + esc(e.illustration.alt) + '</p>');
      }
      if (e.accroche) out.push('<p>' + esc(e.accroche) + '</p>');
      if (e.objectif) out.push('<p><strong>Objectif :</strong> ' + esc(e.objectif) + '</p>');
      if (e.corps) e.corps.forEach(function (p) { out.push('<p>' + p + '</p>'); });
      if (e.liste) {
        out.push('<p><strong>' + esc(e.liste.titre) + '</strong></p><ul>' +
          e.liste.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>');
      }
      if (e.encadre) out.push('<p><strong>' + esc(e.encadre.titre) + ' —</strong> ' + e.encadre.texte + '</p>');
      if (e.aRetenir) out.push('<p><strong>À retenir :</strong> ' + esc(e.aRetenir) + '</p>');
      if (e.questions) {
        e.questions.forEach(function (q, n) {
          out.push('<p><strong>Question ' + (n + 1) + ' :</strong> ' + esc(q.enonce) + '</p><ul>' +
            q.options.map(function (o, m) {
              return '<li>' + esc(o) + (m === q.bonne ? ' <strong>(bonne réponse)</strong>' : '') + '</li>';
            }).join('') + '</ul><p>' + esc(q.feedback.juste) + '</p>');
        });
      }
      if (e.recap) {
        out.push('<ul>' + e.recap.map(function (r) {
          return '<li><strong>' + esc(r.titre) + ' :</strong> ' + esc(r.texte) + '</li>';
        }).join('') + '</ul>');
      }
    });

    $('#version-texte').innerHTML = out.join('');
  }

  /* --------------------------------------------------------- Démarrage ---- */

  initReglages();
  construireVersionTexte();
  rendre();

})();
