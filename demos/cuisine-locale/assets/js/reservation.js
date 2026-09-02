/**
 * reservation.js — Validation d'une demande de table.
 *
 * La validation ne se contente pas de vérifier que les champs sont remplis :
 * elle refuse une date passée, une heure hors des horaires du jour choisi, et
 * un nombre de couverts que la salle ne peut pas accueillir. Un formulaire qui
 * accepte une réservation à 3 h du matin ne rend service à personne — surtout
 * pas au restaurant qui devra rappeler pour l'annuler.
 */

'use strict';

const REGEX_TEL = /^(\+?237)?[\s.-]?6[\s.-]?\d{2}([\s.-]?\d{2}){3}$/;
const JOURS_MAX = 60;

/** Renvoie les horaires applicables à une date. 0 = dimanche, 6 = samedi. */
function horairesDu(date) {
  const jour = date.getDay();
  if (jour === 0) return HORAIRES.dimanche;
  if (jour === 6) return HORAIRES.samedi;
  return HORAIRES.semaine;
}

const enMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Date locale au format AAAA-MM-JJ, sans passer par UTC (qui décalerait d'un jour). */
function isoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function erreur(champ, message) {
  const input = document.getElementById(champ);
  const zone = document.getElementById(`err-${champ}`);
  if (message) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', `err-${champ}`);
    zone.textContent = message;
    zone.hidden = false;
  } else {
    input.removeAttribute('aria-invalid');
    zone.hidden = true;
  }
  return !message;
}

function valider(d) {
  const maintenant = new Date();
  const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());

  let messageDate = '';
  let messageHeure = '';

  if (!d.date) {
    messageDate = 'Choisissez une date.';
  } else {
    // Construction explicite en heure locale : « new Date("2026-09-10") » est
    // interprété en UTC et peut reculer d'un jour selon le fuseau.
    const [a, m, j] = d.date.split('-').map(Number);
    const choisie = new Date(a, m - 1, j);

    if (choisie < aujourdhui) {
      messageDate = 'Cette date est déjà passée.';
    } else if ((choisie - aujourdhui) / 86400000 > JOURS_MAX) {
      messageDate = `Nous ne prenons pas de réservation au-delà de ${JOURS_MAX} jours.`;
    } else if (!d.heure) {
      messageHeure = 'Choisissez une heure.';
    } else {
      const h = horairesDu(choisie);
      const minutes = enMinutes(d.heure);
      const ouverture = enMinutes(h.ouverture);
      // Dernière table une heure avant la fermeture : le service doit pouvoir
      // se terminer.
      const derniere = enMinutes(h.fermeture) - 60;

      if (minutes < ouverture || minutes > derniere) {
        messageHeure = `Ce jour-là, nous servons de ${h.ouverture} à ${h.fermeture}. Dernière table à ${String(Math.floor(derniere / 60)).padStart(2, '0')}:${String(derniere % 60).padStart(2, '0')}.`;
      } else if (choisie.getTime() === aujourdhui.getTime()
                 && minutes < maintenant.getHours() * 60 + maintenant.getMinutes() + 60) {
        messageHeure = 'Pour aujourd\'hui, réservez au moins une heure à l\'avance — ou appelez-nous.';
      }
    }
  }

  const couverts = Number(d.couverts);
  return [
    erreur('nom', d.nom.trim().length < 3 ? 'Indiquez votre nom complet.' : ''),
    erreur('telephone', REGEX_TEL.test(d.telephone.trim()) ? '' : 'Numéro camerounais attendu, commençant par 6.'),
    erreur('date', messageDate),
    erreur('heure', messageHeure),
    erreur('couverts', (!Number.isInteger(couverts) || couverts < 1 || couverts > RESTAURANT.couvertsMax)
      ? `Entre 1 et ${RESTAURANT.couvertsMax} couverts en ligne. Au-delà, appelez-nous.` : ''),
  ].every(Boolean);
}

function confirmer(d) {
  const [a, m, j] = d.date.split('-').map(Number);
  const choisie = new Date(a, m - 1, j);
  const libelle = choisie.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const reference = `CL-R${Date.now().toString(36).toUpperCase().slice(-5)}`;

  document.getElementById('zone-reservation').innerHTML = `
    <div class="message message--succes" style="margin-top:2rem">
      <h1 style="margin-top:0">Demande enregistrée</h1>
      <p style="margin-bottom:0">Référence <strong>${reference}</strong>. Nous vous appelons
         au <strong>${d.telephone}</strong> dans l'heure pour confirmer.</p>
    </div>
    <div class="carte">
      <h2 style="margin-top:0">Ce que nous avons noté</h2>
      <dl style="display:grid;grid-template-columns:auto 1fr;gap:.5rem 1.5rem;margin:0">
        <dt style="font-weight:600;color:var(--gris)">Au nom de</dt><dd style="margin:0">${d.nom}</dd>
        <dt style="font-weight:600;color:var(--gris)">Date</dt><dd style="margin:0">${libelle}</dd>
        <dt style="font-weight:600;color:var(--gris)">Heure</dt><dd style="margin:0">${d.heure}</dd>
        <dt style="font-weight:600;color:var(--gris)">Couverts</dt><dd style="margin:0">${d.couverts}</dd>
        ${d.occasion ? `<dt style="font-weight:600;color:var(--gris)">Occasion</dt><dd style="margin:0">${d.occasion}</dd>` : ''}
        ${d.remarques.trim() ? `<dt style="font-weight:600;color:var(--gris)">Remarques</dt><dd style="margin:0">${d.remarques.trim()}</dd>` : ''}
      </dl>
      <p style="margin:1.5rem 0 0;display:flex;gap:1rem;flex-wrap:wrap">
        <a class="btn btn--principal" href="menu.html">Voir le menu en attendant</a>
        <a class="btn btn--secondaire" href="index.html">Retour à l'accueil</a>
      </p>
      <p style="font-size:.85rem;color:var(--gris);margin:1.5rem 0 0">
        Site de démonstration : aucune réservation n'est réellement transmise, et aucune
        donnée ne quitte votre navigateur.</p>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  const champDate = document.getElementById('date');
  const aujourdhui = new Date();
  const limite = new Date(aujourdhui.getTime() + JOURS_MAX * 86400000);

  // Le sélecteur natif interdit déjà les dates hors bornes ; la validation
  // JavaScript reste nécessaire, car ces attributs se contournent trivialement.
  champDate.min = isoLocal(aujourdhui);
  champDate.max = isoLocal(limite);
  champDate.value = isoLocal(new Date(aujourdhui.getTime() + 86400000));

  const rappel = document.getElementById('rappel-horaires');
  const majRappel = () => {
    if (!champDate.value) { rappel.textContent = ''; return; }
    const [a, m, j] = champDate.value.split('-').map(Number);
    const h = horairesDu(new Date(a, m - 1, j));
    rappel.textContent = `${h.libelle} : ${h.ouverture} – ${h.fermeture}. Dernière table une heure avant la fermeture.`;
  };
  champDate.addEventListener('change', majRappel);
  majRappel();

  document.getElementById('table-horaires').innerHTML = Object.values(HORAIRES)
    .map((h) => `<tr><th scope="row" style="font-weight:600">${h.libelle}</th><td>${h.ouverture} – ${h.fermeture}</td></tr>`).join('');

  document.getElementById('form-reservation').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = {
      nom: document.getElementById('nom').value,
      telephone: document.getElementById('telephone').value,
      date: champDate.value,
      heure: document.getElementById('heure').value,
      couverts: document.getElementById('couverts').value,
      occasion: document.getElementById('occasion').value,
      remarques: document.getElementById('remarques').value,
    };
    if (!valider(d)) {
      document.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    confirmer(d);
  });
});
