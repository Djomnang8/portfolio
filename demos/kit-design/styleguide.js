/* =============================================================================
   styleguide.js — Rend la page de présentation à partir des tokens.

   Rien n'est écrit en dur dans le HTML : la palette, les ratios, l'échelle
   typographique, les espacements et les icônes sont tous lus depuis
   tokens/tokens.js et icones/icones.js, eux-mêmes générés depuis les sources.

   Conséquence utile : ajouter une couleur au JSON la fait apparaître ici,
   avec son ratio calculé, sans toucher une ligne de cette page.
   ============================================================================= */

(function () {
  'use strict';

  var T = window.TOKENS;
  var I = window.ICONES;
  if (!T) { console.error('tokens.js non chargé — lancez node outils/build-css.js'); return; }

  var $ = function (s) { return document.querySelector(s); };

  /* ------------------------------------------------- Calcul WCAG 2.1 ------ */

  function hexRgb(h) {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    return [0, 2, 4].map(function (i) { return parseInt(h.slice(i, i + 2), 16); });
  }
  function lum(h) {
    return hexRgb(h).map(function (v) {
      var s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    }).reduce(function (acc, c, i) { return acc + [0.2126, 0.7152, 0.0722][i] * c; }, 0);
  }
  function ratio(a, b) {
    var la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  var fr = function (n) { return n.toFixed(2).replace('.', ','); };

  /* ---- Le thème affiché détermine la palette utilisée pour les calculs ---- */
  function themeActif() {
    var attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark') return 'dark';
    if (attr === 'light') return 'light';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /* --------------------------------------------------------- Palette ------ */

  function rendrePalette() {
    var pal = T.color[themeActif()];
    $('#palette').innerHTML = Object.keys(pal).map(function (nom) {
      var c = pal[nom];
      return '<article class="sg-couleur">' +
        '<div class="sg-couleur__pastille" style="background:' + c.value + '"></div>' +
        '<div class="sg-couleur__corps">' +
          '<p class="sg-couleur__nom">--pk-' + nom + '</p>' +
          '<p class="sg-couleur__hex">' + c.value + '</p>' +
          '<p class="sg-couleur__role">' + c.role + '</p>' +
        '</div></article>';
    }).join('');
  }

  /* ------------------------------------------------------ Contrastes ------ */

  function rendreContrastes() {
    var pal = T.color[themeActif()];
    var lignes = T.pairs.map(function (p) {
      var fg = pal[p.fg].value, bg = pal[p.bg].value;
      var r = ratio(fg, bg);
      var conforme = r >= p.min;
      var niveau = r >= 7 ? 'AAA' : (r >= 4.5 ? 'AA' : (r >= 3 ? 'AA large' : 'échec'));
      var classe = !conforme ? 'ko' : (r >= 7 ? 'aaa' : 'aa');
      return {
        html: '<tr>' +
          '<td><span class="sg-apercu" style="background:' + bg + ';color:' + fg + '">Texte</span></td>' +
          '<td><code>' + p.fg + '</code> / <code>' + p.bg + '</code></td>' +
          '<td>' + p.usage + '</td>' +
          '<td class="sg-num"><strong>' + fr(r) + ':1</strong></td>' +
          '<td class="sg-num">' + String(p.min).replace('.', ',') + ':1</td>' +
          '<td><span class="sg-verdict sg-verdict--' + classe + '">' +
            '<span aria-hidden="true">' + (conforme ? '✓' : '✕') + '</span> ' + niveau +
          '</span></td>' +
        '</tr>',
        r: r, conforme: conforme, texte: p.min >= 4.5
      };
    });

    $('#paires').innerHTML = lignes.map(function (l) { return l.html; }).join('');

    var echecs = lignes.filter(function (l) { return !l.conforme; }).length;
    var textuelles = lignes.filter(function (l) { return l.texte; });
    var moyen = textuelles.reduce(function (s, l) { return s + l.r; }, 0) / textuelles.length;
    var aaa = textuelles.filter(function (l) { return l.r >= 7; }).length;

    $('#synthese-contraste').innerHTML =
      stat(String(lignes.length), 'paires vérifiées') +
      stat(echecs === 0 ? '0' : String(echecs), echecs === 0 ? 'non-conformité' : 'non-conformités',
           echecs === 0 ? 'var(--pk-success)' : 'var(--pk-danger)') +
      stat(fr(moyen) + ':1', 'ratio moyen sur les paires de texte') +
      stat(aaa + '/' + textuelles.length, 'paires de texte atteignant AAA');

    $('#pied-stats').textContent = lignes.length + ' paires vérifiées, ' +
      (lignes.length - echecs) + ' conformes, ratio moyen ' + fr(moyen) + ':1 — thème ' +
      (themeActif() === 'dark' ? 'sombre' : 'clair') + '.';
  }

  function stat(val, lib, couleur) {
    return '<div class="sg-stat">' +
      '<p class="sg-stat__val"' + (couleur ? ' style="color:' + couleur + '"' : '') + '>' + val + '</p>' +
      '<p class="sg-stat__lib">' + lib + '</p></div>';
  }

  /* ----------------------------------------------------- Typographie ------ */

  function rendreTypo() {
    var exemple = 'Rendre l’apprentissage lisible par tous';
    $('#echelle').innerHTML = Object.keys(T.typography.scale).map(function (k) {
      var v = T.typography.scale[k];
      var px = Math.round(parseFloat(v) * 16);
      return '<div class="sg-echelle__ligne">' +
        '<span class="sg-echelle__meta">--pk-text-' + k + '<br>' + v + ' · ' + px + ' px</span>' +
        '<p class="sg-echelle__ex" style="font-size:' + v + (px >= 24 ? ';font-weight:700' : '') + '">' + exemple + '</p>' +
        '</div>';
    }).join('');
  }

  /* ------------------------------------------------------ Espacement ------ */

  function rendreEspaces() {
    $('#espaces').innerHTML = Object.keys(T.space).map(function (k) {
      var v = T.space[k];
      return '<div class="sg-espace">' +
        '<span class="sg-espace__nom">--pk-space-' + k + '<br>' + v + '</span>' +
        '<span class="sg-espace__barre" style="width:' + v + '"></span>' +
        '</div>';
    }).join('');

    $('#rayons').innerHTML = Object.keys(T.radius).map(function (k) {
      return '<div class="sg-rayon" style="border-radius:' + T.radius[k] + '">' + k + '<br>' + T.radius[k] + '</div>';
    }).join('');
  }

  /* ---------------------------------------------------------- Icônes ------ */

  function rendreIcones() {
    if (!I) { $('#grille-icones').innerHTML = '<p>Lancez <code>node outils/build-icones.js</code>.</p>'; return; }
    $('#grille-icones').innerHTML = Object.keys(I).map(function (nom) {
      return '<div class="sg-icone">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[nom].trace + '</svg>' +
        '<span class="sg-icone__nom">' + nom + '</span>' +
        '<span class="sg-icone__lib">' + I[nom].libelle + '</span>' +
        '</div>';
    }).join('');
  }

  /* -------------------------------------------------------- Réglages ------ */

  function initReglages() {
    var R = document.documentElement;

    Array.prototype.forEach.call(document.querySelectorAll('input[name="theme"]'), function (i) {
      i.addEventListener('change', function () {
        if (i.value === 'auto') R.removeAttribute('data-theme');
        else R.setAttribute('data-theme', i.value);
        rendreTout();
      });
    });

    $('#opt-contraste').addEventListener('change', function (e) {
      if (e.target.checked) R.setAttribute('data-contrast', 'high');
      else R.removeAttribute('data-contrast');
    });

    $('#opt-lisible').addEventListener('change', function (e) {
      if (e.target.checked) R.setAttribute('data-lisible', 'on');
      else R.removeAttribute('data-lisible');
    });

    // Si l'utilisateur reste en « Système » et change sa préférence OS,
    // la palette affichée doit suivre.
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        if (!R.hasAttribute('data-theme')) rendreTout();
      });
    }
  }

  function rendreTout() {
    rendrePalette();
    rendreContrastes();
  }

  rendreTout();
  rendreTypo();
  rendreEspaces();
  rendreIcones();
  initReglages();

  /* Le contenu de cette page est construit par script : au moment où le
     navigateur traite l'ancre de l'URL, les sections sont encore vides. Il
     défile donc vers une position qui n'existera plus une fois le rendu
     terminé, et l'utilisateur atterrit à côté — ou au-delà de la page.

     On rejoue le défilement une fois le rendu fait. Sans ça, partager
     « …/#contrastes » envoie sur du vide. */
  if (location.hash) {
    var cible = document.getElementById(location.hash.slice(1));
    if (cible) {
      // 'auto' et non 'smooth' : on rétablit une position, on ne joue pas une
      // animation que l'utilisateur n'a pas demandée.
      cible.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }

  /* ?section=contrastes n'affiche que cette section.

     La page complète fait plus de 30 000 pixels de haut. Envoyer un collègue
     sur « la partie contrastes » avec une simple ancre l'oblige à chercher au
     milieu de tout le reste. Ce paramètre produit un permalien vers une seule
     section : utile pour faire relire une partie, l'intégrer dans une
     documentation, ou en faire une capture.

     Le sommaire reste affiché pour pouvoir revenir à la page entière. */
  var isoler = new URLSearchParams(location.search).get('section');
  if (isoler) {
    var gardee = document.getElementById(isoler);
    if (gardee) {
      Array.prototype.forEach.call(document.querySelectorAll('main > section'), function (s) {
        if (s !== gardee) s.hidden = true;
      });
      document.title = gardee.querySelector('h2').textContent + ' — Kit Design Pédagogique';
    }
  }
})();
