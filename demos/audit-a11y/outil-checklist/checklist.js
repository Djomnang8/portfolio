/* =============================================================================
   checklist.js — Moteur de la checklist d'accessibilité.

   Un outil d'accessibilité qui ne serait pas lui-même accessible n'aurait
   aucune crédibilité. Donc :
     - trois vrais <button> par point, avec aria-pressed
     - chaque changement annoncé dans une région live
     - la modale capture le focus, se ferme par Échap, et le rend au déclencheur
     - localStorage enveloppé dans try/catch
   ============================================================================= */

(function () {
  'use strict';

  var C = window.CHECKLIST;
  if (!C) { console.error('data.js non chargé'); return; }

  var CLE = 'checklist-a11y-v1';

  var ETATS = {
    ok: { libelle: 'Conforme', picto: '✓' },
    ko: { libelle: 'Non conforme', picto: '✕' },
    na: { libelle: 'Non applicable', picto: '—' }
  };

  var POIDS_NOM = { 3: 'Bloquant', 2: 'Majeur', 1: 'Mineur' };

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var stockage = {
    lire: function () { try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; } },
    ecrire: function (o) { try { localStorage.setItem(CLE, JSON.stringify(o)); } catch (e) {} }
  };

  var sauve = stockage.lire();
  var etat = sauve.reponses || {};   // { idPoint: 'ok' | 'ko' | 'na' }
  var TOUS = C.familles.reduce(function (a, f) { return a.concat(f.points); }, []);

  function persister() {
    stockage.ecrire({ reponses: etat, projet: $('#nom-projet').value });
  }

  function annoncer(t) {
    var z = $('#annonces');
    z.textContent = '';
    setTimeout(function () { z.textContent = t; }, 60);
  }

  /* ------------------------------------------------------------- Rendu ---- */

  function rendre() {
    $('#familles').innerHTML = C.familles.map(function (f) {
      return '<section class="cl-famille" aria-labelledby="f-' + f.id + '">' +
        '<div class="cl-famille__entete">' +
          '<h3 id="f-' + f.id + '">' + esc(f.nom) + '</h3>' +
          '<p class="cl-famille__intro">' + esc(f.intro) + '</p>' +
          '<p class="cl-famille__compteur" id="cpt-' + f.id + '"></p>' +
        '</div>' +
        '<ul class="cl-points">' + f.points.map(function (p) { return ligne(p); }).join('') + '</ul>' +
      '</section>';
    }).join('');

    $$('.cl-choix').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.point, val = b.dataset.val;
        // Recliquer sur l'état actif l'annule : on peut revenir à « non évalué ».
        if (etat[id] === val) delete etat[id];
        else etat[id] = val;
        persister();
        majPoint(id);
        majTotaux();
        var p = TOUS.filter(function (x) { return x.id === id; })[0];
        annoncer(p.label + ' : ' + (etat[id] ? ETATS[etat[id]].libelle : 'non évalué') + '.');
      });
    });

    TOUS.forEach(function (p) { majPoint(p.id); });
    majTotaux();
  }

  function ligne(p) {
    return '<li class="cl-point" id="pt-' + p.id + '">' +
      '<div class="cl-point__texte">' +
        '<p class="cl-point__label">' + esc(p.label) + '</p>' +
        '<p class="cl-point__meta">' +
          '<span class="cl-poids cl-poids--' + p.poids + '">' + POIDS_NOM[p.poids] + '</span>' +
          (p.wcag !== '—' ? '<span class="cl-wcag">WCAG ' + p.wcag + '</span>' : '<span class="cl-wcag">Hors WCAG</span>') +
        '</p>' +
        '<details class="cl-detail">' +
          '<summary>Comment vérifier</summary>' +
          '<p><strong>Le geste :</strong> ' + esc(p.verifier) + '</p>' +
          '<p><strong>Pourquoi :</strong> ' + esc(p.pourquoi) + '</p>' +
        '</details>' +
      '</div>' +
      '<div class="cl-point__choix" role="group" aria-label="Statut : ' + esc(p.label) + '">' +
        Object.keys(ETATS).map(function (k) {
          return '<button type="button" class="cl-choix cl-choix--' + k + '" ' +
            'data-point="' + p.id + '" data-val="' + k + '" aria-pressed="false">' +
            '<span aria-hidden="true">' + ETATS[k].picto + '</span> ' + ETATS[k].libelle +
          '</button>';
        }).join('') +
      '</div>' +
    '</li>';
  }

  function majPoint(id) {
    var li = $('#pt-' + id);
    if (!li) return;
    li.dataset.etat = etat[id] || '';
    $$('.cl-choix', li).forEach(function (b) {
      b.setAttribute('aria-pressed', String(etat[id] === b.dataset.val));
    });
  }

  /* ------------------------------------------------------------- Score ---- */

  function calculer() {
    var ok = 0, ko = 0, na = 0, todo = 0;
    var poidsOk = 0, poidsEvalue = 0;
    var bloquantsRates = [];

    TOUS.forEach(function (p) {
      var e = etat[p.id];
      if (e === 'na') { na++; return; }           // exclu du calcul
      if (e === 'ok') { ok++; poidsOk += p.poids; poidsEvalue += p.poids; return; }
      if (e === 'ko') {
        ko++; poidsEvalue += p.poids;
        if (p.poids === 3) bloquantsRates.push(p);
        return;
      }
      todo++;
    });

    return {
      ok: ok, ko: ko, na: na, todo: todo,
      evalues: ok + ko,
      pourcent: poidsEvalue ? Math.round((poidsOk / poidsEvalue) * 100) : null,
      bloquantsRates: bloquantsRates
    };
  }

  function majTotaux() {
    var s = calculer();

    $('#nb-ok').textContent = s.ok;
    $('#nb-ko').textContent = s.ko;
    $('#nb-na').textContent = s.na;
    $('#nb-todo').textContent = s.todo;

    var val = $('#score-val'), detail = $('#score-detail');
    var jauge = $('#jauge'), fill = $('#jauge-fill');

    if (s.pourcent === null) {
      val.textContent = '—';
      val.style.color = 'var(--pk-ink-soft)';
      detail.textContent = 'Aucun point évalué';
      fill.style.width = '0%';
      jauge.setAttribute('aria-valuenow', '0');
      jauge.setAttribute('aria-valuetext', 'Aucun point évalué');
    } else if (s.bloquantsRates.length) {
      /* Un point bloquant rend une fonction inaccessible. Afficher « 95 % » dans
         ce cas serait un mensonge par arrondi : le support est inutilisable par
         quelqu'un, et aucune moyenne pondérée ne rattrape ça. On remplace donc
         le pourcentage par un verdict, et on relègue le calcul en second plan. */
      val.textContent = 'Non livrable';
      val.classList.add('cl-score__val--verdict');
      val.style.color = 'var(--pk-danger)';
      detail.textContent = s.bloquantsRates.length + ' point(s) bloquant(s) — ' +
        s.pourcent + ' % de conformité pondérée par ailleurs';
      fill.style.width = '100%';
      fill.style.background = 'var(--pk-danger)';
      jauge.setAttribute('aria-valuenow', String(s.pourcent));
      jauge.setAttribute('aria-valuetext', 'Support non livrable : ' + s.bloquantsRates.length +
        ' point(s) bloquant(s) non conforme(s). Conformité pondérée par ailleurs : ' +
        s.pourcent + ' pour cent.');
    } else {
      val.textContent = s.pourcent + ' %';
      val.classList.remove('cl-score__val--verdict');
      val.style.color = s.pourcent >= 90 ? 'var(--pk-success)' : 'var(--pk-accent)';
      detail.textContent = s.evalues + ' point(s) évalué(s) sur ' + (TOUS.length - s.na);
      fill.style.width = s.pourcent + '%';
      fill.style.background = val.style.color;
      jauge.setAttribute('aria-valuenow', String(s.pourcent));
      jauge.setAttribute('aria-valuetext', s.pourcent + ' pour cent de conformité pondérée, ' +
        s.evalues + ' points évalués');
    }

    // Compteurs par famille
    C.familles.forEach(function (f) {
      var evalues = f.points.filter(function (p) { return etat[p.id]; }).length;
      var kos = f.points.filter(function (p) { return etat[p.id] === 'ko'; }).length;
      $('#cpt-' + f.id).innerHTML = evalues + ' / ' + f.points.length + ' évalué(s)' +
        (kos ? ' · <strong class="cl-rouge">' + kos + ' non conforme(s)</strong>' : '');
    });

    // Alerte bloquants : un score élevé avec un bloquant raté doit être contredit.
    var alerte = $('#alerte-bloquants');
    if (s.bloquantsRates.length) {
      alerte.hidden = false;
      $('#alerte-titre').textContent = s.bloquantsRates.length +
        (s.bloquantsRates.length > 1 ? ' points bloquants non conformes' : ' point bloquant non conforme');
      $('#alerte-texte').innerHTML =
        'Quel que soit le score global, ce support n\'est <strong>pas livrable</strong> en l\'état : ' +
        s.bloquantsRates.map(function (p) { return '« ' + esc(p.label) + ' »'; }).join(', ') +
        '. Un point bloquant rend une fonction inaccessible, pas seulement inconfortable.';
    } else {
      alerte.hidden = true;
    }
  }

  /* ------------------------------------------------------------ Rapport --- */

  function construireRapport() {
    var s = calculer();
    var projet = $('#nom-projet').value.trim() || 'Support non nommé';
    var date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    var L = [];

    L.push('# Audit d\'accessibilité — ' + projet);
    L.push('');
    L.push('**Référentiel :** ' + C.meta.referentiel + '  ');
    L.push('**Date :** ' + date + '  ');
    L.push('**Outil :** ' + C.meta.titre + ' v' + C.meta.version);
    L.push('');
    L.push('## Résultat');
    L.push('');
    L.push('| Indicateur | Valeur |');
    L.push('| --- | ---: |');
    L.push('| Verdict | **' + (s.bloquantsRates.length ? 'NON LIVRABLE' :
      (s.pourcent === null ? 'Non évalué' : (s.pourcent >= 90 ? 'Conforme' : 'À corriger'))) + '** |');
    L.push('| Conformité pondérée | **' + (s.pourcent === null ? '—' : s.pourcent + ' %') + '** |');
    L.push('| Points conformes | ' + s.ok + ' |');
    L.push('| Points non conformes | ' + s.ko + ' |');
    L.push('| Points non applicables | ' + s.na + ' |');
    L.push('| Points non évalués | ' + s.todo + ' |');
    L.push('');

    if (s.bloquantsRates.length) {
      L.push('> **' + s.bloquantsRates.length + ' point(s) bloquant(s) non conforme(s).** ' +
             'Ce support n\'est pas livrable en l\'état, quel que soit le score global.');
      L.push('');
    }

    if (s.ko) {
      L.push('## Non-conformités à corriger');
      L.push('');
      [3, 2, 1].forEach(function (poids) {
        var lot = TOUS.filter(function (p) { return etat[p.id] === 'ko' && p.poids === poids; });
        if (!lot.length) return;
        L.push('### ' + POIDS_NOM[poids] + ' (' + lot.length + ')');
        L.push('');
        lot.forEach(function (p) {
          L.push('- **' + p.label + '** — WCAG ' + p.wcag);
          L.push('  - *Vérification :* ' + p.verifier);
          L.push('  - *Impact :* ' + p.pourquoi);
        });
        L.push('');
      });
    }

    if (s.todo) {
      L.push('## Points non évalués (' + s.todo + ')');
      L.push('');
      TOUS.filter(function (p) { return !etat[p.id]; }).forEach(function (p) {
        L.push('- ' + p.label + ' — WCAG ' + p.wcag + ' (' + POIDS_NOM[p.poids].toLowerCase() + ')');
      });
      L.push('');
    }

    L.push('## Détail par famille');
    L.push('');
    C.familles.forEach(function (f) {
      L.push('### ' + f.nom);
      L.push('');
      L.push('| Point | Gravité | WCAG | Statut |');
      L.push('| --- | --- | --- | --- |');
      f.points.forEach(function (p) {
        var e = etat[p.id];
        var st = e ? ETATS[e].picto + ' ' + ETATS[e].libelle : '· Non évalué';
        L.push('| ' + p.label + ' | ' + POIDS_NOM[p.poids] + ' | ' + p.wcag + ' | ' + st + ' |');
      });
      L.push('');
    });

    L.push('---');
    L.push('');
    L.push('*Cette checklist couvre les défauts les plus fréquents en production ' +
           'pédagogique. Elle ne remplace ni un audit complet sur les 50 critères AA, ' +
           'ni un test au lecteur d\'écran, ni un test avec des personnes concernées.*');

    return L.join('\n');
  }

  /* ------------------------------------------------------------- Modale --- */

  var modale = $('#modale-rapport');
  var declencheur = null;

  function ouvrirModale() {
    declencheur = document.activeElement;
    $('#rapport-texte').value = construireRapport();
    modale.hidden = false;
    $('#btn-copier').focus();
    document.body.style.overflow = 'hidden';
    annoncer('Rapport généré.');
  }

  function fermerModale() {
    modale.hidden = true;
    document.body.style.overflow = '';
    $('#copie-retour').textContent = '';
    /* Le focus revient d'où il venait. Si le déclencheur n'était pas focusable
       (ouverture par script, ou élément retiré du DOM entre-temps), on retombe
       sur le bouton d'ouverture : jamais sur le <body>, qui laisserait
       l'utilisateur au clavier reprendre en haut de page. */
    var cible = (declencheur && typeof declencheur.focus === 'function' && declencheur !== document.body)
      ? declencheur : $('#btn-rapport');
    cible.focus();
  }

  // Piège à focus volontaire, et correctement fait : la tabulation boucle
  // à l'intérieur, Échap ferme, le focus revient au bouton d'origine.
  modale.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { fermerModale(); return; }
    if (e.key !== 'Tab') return;
    var focusables = $$('button, textarea, [href]', modale).filter(function (el) {
      return el.offsetParent !== null;
    });
    if (!focusables.length) return;
    var premier = focusables[0], dernier = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
    else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
  });

  modale.addEventListener('click', function (e) {
    if (e.target === modale) fermerModale();
  });

  /* ---------------------------------------------------------- Démarrage --- */

  $('#btn-rapport').addEventListener('click', ouvrirModale);
  $('#btn-fermer').addEventListener('click', fermerModale);
  $('#btn-imprimer').addEventListener('click', function () { window.print(); });

  $('#btn-copier').addEventListener('click', function () {
    var ta = $('#rapport-texte');
    var retour = $('#copie-retour');
    function reussi() {
      retour.textContent = '✓ Copié dans le presse-papiers';
      setTimeout(function () { retour.textContent = ''; }, 4000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(reussi, secours);
    } else { secours(); }

    function secours() {
      // Repli pour les contextes non sécurisés, où l'API presse-papiers est refusée.
      ta.select();
      try {
        document.execCommand('copy');
        reussi();
      } catch (err) {
        retour.textContent = 'Copie impossible — sélectionnez le texte et faites Ctrl+C';
      }
    }
  });

  $('#btn-reset').addEventListener('click', function () {
    if (!Object.keys(etat).length) { annoncer('Rien à réinitialiser.'); return; }
    etat = {};
    persister();
    TOUS.forEach(function (p) { majPoint(p.id); });
    majTotaux();
    annoncer('Checklist réinitialisée. ' + TOUS.length + ' points à évaluer.');
    $('#points').focus();
  });

  /* ---------------------------------------------------------- Exemple ----- */

  /* Un outil vide ne se comprend pas : on ne voit ni ce que produit le score,
     ni a quoi ressemble un rapport. L'exemple charge une evaluation reelle —
     celle du support « avant » de ce depot — pour que la mecanique soit
     visible immediatement, sans cocher 38 points a la main. */
  var EXEMPLE = {
    projet: "Fiche de cours — version d'origine",
    reponses: {
      st1: 'ko', st2: 'ko', st3: 'ok', st4: 'ko', st5: 'ko', st6: 'ko',
      tx1: 'ko', tx2: 'ko', tx3: 'ko', tx4: 'ok', tx5: 'ok',
      co1: 'ko', co2: 'ko', co3: 'ko', co4: 'ko', co5: 'na',
      im1: 'ko', im2: 'ko', im3: 'ok', im4: 'na', im5: 'na', im6: 'na',
      im7: 'na', im8: 'na',
      in1: 'ko', in2: 'ko', in3: 'ok', in4: 'ok', in5: 'ko', in6: 'ko', in7: 'ko',
      fo1: 'ko', fo2: 'ko', fo3: 'ko', fo4: 'ko',
      mo1: 'ok', mo2: 'ko', mo3: 'ko'
    }
  };

  function chargerExemple() {
    etat = {};
    Object.keys(EXEMPLE.reponses).forEach(function (id) {
      if (TOUS.some(function (p) { return p.id === id; })) etat[id] = EXEMPLE.reponses[id];
    });
    $('#nom-projet').value = EXEMPLE.projet;
    persister();
    TOUS.forEach(function (p) { majPoint(p.id); });
    majTotaux();
    annoncer('Exemple charge : ' + EXEMPLE.projet + '.');
  }

  $('#btn-exemple').addEventListener('click', chargerExemple);

  /* ?exemple=1 charge l'exemple directement. Sert a partager un lien vers
     l'outil rempli, et a produire les captures du README de facon
     reproductible plutot qu'a la main. */
  if (new URLSearchParams(location.search).get('exemple') === '1') {
    $('#nom-projet').value = EXEMPLE.projet;
    Object.keys(EXEMPLE.reponses).forEach(function (id) {
      if (TOUS.some(function (p) { return p.id === id; })) etat[id] = EXEMPLE.reponses[id];
    });
  }

  $('#nom-projet').value = $('#nom-projet').value || sauve.projet || '';
  $('#nom-projet').addEventListener('input', persister);

  rendre();
})();
