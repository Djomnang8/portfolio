/* =============================================================================
   audit-page.js — Vérificateur d'accessibilité à coller dans la console
   du navigateur, sur n'importe quelle page.

   Aucune dépendance, aucune installation. Ouvrez les outils de développement
   (F12), onglet Console, collez tout ce fichier, appuyez sur Entrée.

   Neuf familles de contrôles :
     1. Contraste du texte réellement rendu (WCAG 1.4.3 / 1.4.6)
     2. Images sans attribut alt (1.1.1)
     3. Éléments interactifs sans nom accessible (4.1.2)
     4. Champs de formulaire sans étiquette (3.3.2)
     5. Hiérarchie de titres (1.3.1 / 2.4.6)
     6. Taille des cibles de pointage (2.5.8)
     7. Identifiants dupliqués (4.1.1)
     8. tabindex positifs (2.4.3)
     9. Attributs ARIA pointant vers un id inexistant (1.3.1)

   CE QUE CET OUTIL NE FAIT PAS — et qu'aucun outil automatique ne fait :
   juger la PERTINENCE d'une alternative textuelle, l'ordre logique de
   tabulation, la clarté d'un libellé, ou le comportement réel d'un lecteur
   d'écran. L'automatique détecte environ 30 % des non-conformités.
   Les 70 % restants demandent un test humain.
   ============================================================================= */

(function () {
  'use strict';

  /* ---- Calcul WCAG (identique à outils/check-contrast.js du Kit) ---- */

  function lum(rgb) {
    var c = rgb.map(function (v) {
      var s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function parseCouleur(s) {
    var m = String(s).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(',').map(parseFloat);
    return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
  }

  function ratio(a, b) {
    var la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /** Remonte les ancêtres jusqu'au premier fond opaque. */
  function fondEffectif(el) {
    var n = el;
    while (n && n !== document.documentElement) {
      var c = parseCouleur(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.95) return c.rgb;
      n = n.parentElement;
    }
    var body = parseCouleur(getComputedStyle(document.body).backgroundColor);
    return body && body.a > 0.95 ? body.rgb : [255, 255, 255];
  }

  function nomAccessible(el) {
    var parLabelledby = '';
    if (el.getAttribute('aria-labelledby')) {
      var cible = document.getElementById(el.getAttribute('aria-labelledby'));
      parLabelledby = cible ? cible.textContent : '';
    }
    var img = el.querySelector && el.querySelector('img');
    return (el.getAttribute('aria-label') || parLabelledby || el.textContent ||
            el.value || (img && img.alt) || '').trim();
  }

  /* ---- Gel des transitions -------------------------------------------------
     Sans cela, une mesure prise pendant un fondu de couleur produit des
     faux positifs spectaculaires. Constaté sur ce module : un bouton mesuré
     à 1,09:1 en pleine transition, conforme à 13,57:1 une fois stabilisé. */

  var gel = document.createElement('style');
  gel.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
  document.head.appendChild(gel);

  var pb = { contraste: [], alt: [], nom: [], label: [], titres: [], cible: [], ids: [], tabindex: [], aria: [] };
  var nbTextes = 0, nbInteractifs = 0, somme = 0, mini = 21;

  /* 1. Contraste ---------------------------------------------------------- */
  document.querySelectorAll('body *').forEach(function (el) {
    var texte = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3; })
      .map(function (n) { return n.textContent.trim(); }).join('');
    if (texte.length < 2) return;

    var st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.display === 'none' || st.opacity === '0') return;
    if (el.closest('.sr-only, [aria-hidden="true"]')) return;

    var fg = parseCouleur(st.color);
    if (!fg) return;

    var r = ratio(fg.rgb, fondEffectif(el));
    var px = parseFloat(st.fontSize);
    var gras = parseInt(st.fontWeight, 10) >= 700;
    var seuil = (px >= 24 || (px >= 18.66 && gras)) ? 3 : 4.5;

    nbTextes++; somme += r; if (r < mini) mini = r;
    if (r < seuil) {
      pb.contraste.push({
        selecteur: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
        mesure: r.toFixed(2) + ':1', seuil: seuil + ':1',
        taille: px + 'px' + (gras ? ' gras' : ''),
        extrait: texte.slice(0, 45)
      });
    }
  });

  /* 2. Images ------------------------------------------------------------- */
  document.querySelectorAll('img').forEach(function (i) {
    if (!i.hasAttribute('alt')) pb.alt.push({ src: i.getAttribute('src') });
  });

  /* 3-6. Éléments interactifs --------------------------------------------- */
  document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, summary, [tabindex]').forEach(function (el) {
    if (el.closest('.sr-only')) return;
    nbInteractifs++;

    var typeSansTexte = ['radio', 'checkbox', 'color', 'text', 'email', 'password', 'number'].indexOf(el.type) >= 0;
    if (!nomAccessible(el) && !typeSansTexte) {
      pb.nom.push({ element: el.tagName.toLowerCase(), id: el.id || '(sans id)', classe: String(el.className) });
    }

    var r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24) && el.tagName !== 'A') {
      pb.cible.push({ element: el.tagName.toLowerCase(), id: el.id || '(sans id)', taille: Math.round(r.width) + '×' + Math.round(r.height) + 'px' });
    }
  });

  document.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(function (el) {
    var etiquete = (el.labels && el.labels.length) || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
    if (!etiquete) pb.label.push({ element: el.tagName.toLowerCase(), type: el.type, id: el.id || '(sans id)' });
  });

  /* 5. Hiérarchie de titres ----------------------------------------------- */
  var niveaux = Array.prototype.map.call(document.querySelectorAll('h1,h2,h3,h4,h5,h6'), function (h) {
    return { n: +h.tagName[1], texte: h.textContent.trim().slice(0, 40) };
  });
  var prec = 0;
  niveaux.forEach(function (h) {
    if (prec && h.n > prec + 1) pb.titres.push({ probleme: 'saut de H' + prec + ' vers H' + h.n, titre: h.texte });
    prec = h.n;
  });
  var nbH1 = document.querySelectorAll('h1').length;
  if (nbH1 !== 1) pb.titres.push({ probleme: nbH1 + ' élément(s) H1 (il en faut exactement 1)', titre: '' });

  /* 7-9. Divers ----------------------------------------------------------- */
  var vus = {};
  document.querySelectorAll('[id]').forEach(function (el) {
    if (vus[el.id]) pb.ids.push({ id: el.id });
    vus[el.id] = 1;
  });
  document.querySelectorAll('[tabindex]').forEach(function (el) {
    if (+el.getAttribute('tabindex') > 0) {
      pb.tabindex.push({ element: el.tagName.toLowerCase(), valeur: el.getAttribute('tabindex') });
    }
  });
  ['aria-labelledby', 'aria-describedby', 'aria-controls'].forEach(function (a) {
    document.querySelectorAll('[' + a + ']').forEach(function (el) {
      el.getAttribute(a).split(/\s+/).forEach(function (id) {
        if (id && !document.getElementById(id)) pb.aria.push({ attribut: a, cible: '#' + id });
      });
    });
  });

  gel.remove();

  /* ---- Restitution ------------------------------------------------------ */

  var total = Object.keys(pb).reduce(function (s, k) { return s + pb[k].length; }, 0);

  console.log('%c AUDIT D\'ACCESSIBILITÉ ', 'background:#1D4ED8;color:#fff;font-weight:bold;padding:4px 8px');
  console.log('Page : ' + document.title);
  console.log('URL  : ' + location.href);
  console.table({
    'Textes mesurés': nbTextes,
    'Éléments interactifs': nbInteractifs,
    'Ratio de contraste moyen': (somme / nbTextes).toFixed(2) + ':1',
    'Ratio de contraste minimum': mini.toFixed(2) + ':1',
    'Problèmes détectés': total
  });

  var libelles = {
    contraste: '1.4.3 — Contraste insuffisant',
    alt: '1.1.1 — Image sans attribut alt',
    nom: '4.1.2 — Élément interactif sans nom accessible',
    label: '3.3.2 — Champ sans étiquette',
    titres: '1.3.1 — Hiérarchie de titres',
    cible: '2.5.8 — Cible de pointage sous 24×24 px',
    ids: '4.1.1 — Identifiant dupliqué',
    tabindex: '2.4.3 — tabindex positif',
    aria: '1.3.1 — Référence ARIA orpheline'
  };

  Object.keys(pb).forEach(function (k) {
    if (!pb[k].length) return;
    console.groupCollapsed('%c' + pb[k].length + ' × ' + libelles[k], 'color:#A81E1E;font-weight:bold');
    console.table(pb[k]);
    console.groupEnd();
  });

  if (total === 0) {
    console.log('%c Aucune non-conformité automatiquement détectable. ',
      'background:#146C39;color:#fff;padding:4px 8px');
    console.log('Rappel : il reste à tester à la main le parcours clavier, la pertinence ' +
      'des alternatives textuelles et le rendu au lecteur d\'écran.');
  }

  return { resume: { nbTextes: nbTextes, nbInteractifs: nbInteractifs, moyen: +(somme / nbTextes).toFixed(2), mini: +mini.toFixed(2), total: total }, detail: pb };
})();
