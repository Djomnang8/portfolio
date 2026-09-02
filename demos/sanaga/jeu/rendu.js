/**
 * rendu.js — Affichage du plateau et rejeu du journal de combat.
 *
 * Ce fichier ne décide rien. Il ne calcule aucun dégât, ne choisit aucune
 * cible, n'applique aucune règle : il rejoue les événements produits par
 * moteur/combat.js. C'est ce qui garantit que ce que le joueur voit est
 * exactement ce que le banc d'équilibrage a mesuré.
 *
 * Si un jour l'écran et le rapport divergent, le défaut sera dans le moteur —
 * il n'y a pas d'autre endroit où il puisse se cacher.
 */

(function (racine) {
  'use strict';

  const COULEURS = {
    fond: '#1D2426',
    case1: '#222B2C',
    case2: '#1F2728',
    zoneA: 'rgba(79, 163, 163, .10)',
    zoneB: 'rgba(200, 102, 58, .10)',
    grille: '#2E3A37',
    survol: 'rgba(224, 169, 60, .22)',
    campA: '#4FA3A3',
    campB: '#C8663A',
    texte: '#ECE7DC',
    sombre: '#12191A',
    vie: '#6BBF6B',
    vieBasse: '#D9534F',
    degats: '#F2B8A8',
    soin: '#9BE39B',
  };

  /** Initiales lisibles à 40 px : deux lettres, jamais l'identifiant complet. */
  const INITIALES = {
    eclaireur: 'EC', lancier: 'LA', archere: 'AR', bouclier: 'BO',
    guerisseuse: 'GU', sorcier: 'SO', assassin: 'AS', colosse: 'CO',
  };

  function creerRendu(canvas, reglages) {
    const ctx = canvas.getContext('2d');
    const COLS = reglages.plateau.colonnes;
    const LIGNES = reglages.plateau.lignes;
    const PROF = reglages.plateau.colonnes_deploiement;
    const CASE = 96;

    canvas.width = COLS * CASE;
    canvas.height = LIGNES * CASE;

    let survol = null;
    let flottants = [];
    let minuteur = null;

    /* ---------- Primitives ---------- */

    function fondPlateau() {
      ctx.fillStyle = COULEURS.fond;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < LIGNES; y++) {
          ctx.fillStyle = (x + y) % 2 ? COULEURS.case1 : COULEURS.case2;
          ctx.fillRect(x * CASE, y * CASE, CASE, CASE);
          if (x < PROF) { ctx.fillStyle = COULEURS.zoneA; ctx.fillRect(x * CASE, y * CASE, CASE, CASE); }
          if (x >= COLS - PROF) { ctx.fillStyle = COULEURS.zoneB; ctx.fillRect(x * CASE, y * CASE, CASE, CASE); }
        }
      }

      ctx.strokeStyle = COULEURS.grille;
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath(); ctx.moveTo(x * CASE + .5, 0); ctx.lineTo(x * CASE + .5, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= LIGNES; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * CASE + .5); ctx.lineTo(canvas.width, y * CASE + .5); ctx.stroke();
      }

      if (survol) {
        ctx.fillStyle = COULEURS.survol;
        ctx.fillRect(survol.x * CASE, survol.y * CASE, CASE, CASE);
      }
    }

    function dessinerUnite(u) {
      if (u.pv <= 0) return;
      const cx = u.x * CASE + CASE / 2;
      const cy = u.y * CASE + CASE / 2;
      const r = CASE * 0.32;
      const couleur = u.camp === 'A' ? COULEURS.campA : COULEURS.campB;

      ctx.beginPath();
      ctx.arc(cx, cy + 3, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = couleur;
      ctx.fill();

      ctx.fillStyle = COULEURS.sombre;
      ctx.font = 'bold 20px ui-monospace, SFMono-Regular, Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(INITIALES[u.ref] || '??', cx, cy + 1);

      // Barre de vie : la seule information dont le joueur a besoin en continu.
      const part = Math.max(0, u.pv) / u.pvMax;
      const bw = CASE * 0.62;
      const bx = cx - bw / 2;
      const by = cy + r + 7;
      ctx.fillStyle = 'rgba(0,0,0,.5)';
      ctx.fillRect(bx, by, bw, 6);
      ctx.fillStyle = part > 0.35 ? COULEURS.vie : COULEURS.vieBasse;
      ctx.fillRect(bx, by, bw * part, 6);
    }

    function dessinerFlottants() {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 17px ui-monospace, SFMono-Regular, Consolas, monospace';
      for (const f of flottants) {
        ctx.globalAlpha = Math.max(0, f.vie / 18);
        ctx.fillStyle = f.couleur;
        ctx.fillText(f.texte, f.x, f.y - (18 - f.vie) * 1.6);
        ctx.globalAlpha = 1;
      }
    }

    function dessiner(unites) {
      fondPlateau();
      const ordre = unites.slice().sort((a, b) => a.y - b.y);
      for (const u of ordre) dessinerUnite(u);
      dessinerFlottants();
    }

    /* ---------- Rejeu du journal ---------- */

    /**
     * Rejoue les événements un par un.
     * Le rendu ne recalcule aucun point de vie : il lit la valeur que le moteur
     * a inscrite dans l'événement.
     */
    function jouerJournal(journal, options) {
      const opts = options || {};
      const vitesse = opts.vitesse || 1;
      const delai = Math.max(8, Math.round(70 / vitesse));

      const depart = journal[0];
      const unites = depart.unites.map((u) => ({
        indice: u.i, ref: u.ref, nom: u.nom, camp: u.camp,
        x: u.x, y: u.y, pv: u.pv, pvMax: u.pvMax,
      }));
      const parIndice = {};
      for (const u of unites) parIndice[u.indice] = u;

      let i = 1;
      arreter();
      dessiner(unites);

      minuteur = setInterval(function () {
        // Le temps du rejeu ne doit pas dépendre de la machine : on avance d'un
        // événement par pas, et on laisse les flottants s'estomper.
        flottants = flottants.map((f) => ({ ...f, vie: f.vie - 1 })).filter((f) => f.vie > 0);

        if (i >= journal.length) {
          if (!flottants.length) {
            arreter();
            if (opts.surFin) opts.surFin();
            return;
          }
          dessiner(unites);
          return;
        }

        const e = journal[i++];
        const acteur = parIndice[e.u];

        if (e.t === 'deplacement') {
          acteur.x = e.x; acteur.y = e.y;
        } else if (e.t === 'attaque') {
          const victime = parIndice[e.c];
          victime.pv = e.pv;
          flottants.push({
            texte: '-' + e.d, couleur: COULEURS.degats, vie: 18,
            x: victime.x * CASE + CASE / 2, y: victime.y * CASE + CASE / 2 - 26,
          });
          if (opts.surEvenement) opts.surEvenement(e, acteur, victime);
        } else if (e.t === 'soin') {
          const patient = parIndice[e.c];
          patient.pv = e.pv;
          flottants.push({
            texte: '+' + e.v, couleur: COULEURS.soin, vie: 18,
            x: patient.x * CASE + CASE / 2, y: patient.y * CASE + CASE / 2 - 26,
          });
          if (opts.surEvenement) opts.surEvenement(e, acteur, patient);
        } else if (e.t === 'mort') {
          acteur.pv = 0;
          if (opts.surEvenement) opts.surEvenement(e, acteur, null);
        }

        dessiner(unites);
      }, delai);
    }

    function arreter() {
      if (minuteur) { clearInterval(minuteur); minuteur = null; }
    }

    /** Case du plateau sous un événement de souris, ou null hors plateau. */
    function caseDepuisEvenement(ev) {
      const r = canvas.getBoundingClientRect();
      const x = Math.floor((ev.clientX - r.left) / r.width * COLS);
      const y = Math.floor((ev.clientY - r.top) / r.height * LIGNES);
      if (x < 0 || y < 0 || x >= COLS || y >= LIGNES) return null;
      return { x, y };
    }

    return {
      dessiner,
      jouerJournal,
      arreter,
      caseDepuisEvenement,
      definirSurvol(c) { survol = c; },
      enCours() { return minuteur !== null; },
      INITIALES,
    };
  }

  const api = { creerRendu, COULEURS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.Rendu = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
