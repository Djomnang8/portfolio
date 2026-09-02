/**
 * panier-page.js — Affichage du panier, calcul du total et validation de commande.
 *
 * Le total n'est jamais recopié : il vient toujours de Panier.total(), la seule
 * fonction qui applique la règle de livraison offerte. Deux calculs séparés
 * finiraient un jour par diverger, et c'est le client qui verrait la différence.
 *
 * La commande n'est pas envoyée à un serveur — il n'y en a pas. Elle produit un
 * récapitulatif et un message WhatsApp pré-rempli, qui est le canal réellement
 * utilisé par les restaurants à Douala.
 */

'use strict';

const REGEX_TELEPHONE = /^(\+?237)?[\s.-]?6[\s.-]?\d{2}([\s.-]?\d{2}){3}$/;

/* ---------- Rendu ---------- */

function vueVide() {
  return `<div class="vide">
      <h1>Votre panier est vide</h1>
      <p>Ajoutez un plat depuis le menu, il vous attendra ici même si vous fermez l'onglet.</p>
      <a class="btn btn--principal" href="menu.html">Voir le menu</a>
    </div>`;
}

function vuePanier() {
  const lignes = Panier.lignes();
  return `
    <h1>Votre commande</h1>
    <p style="color:var(--gris)">${Panier.nombreArticles()} article(s). Le panier est conservé sur cet appareil.</p>

    <div class="grille-panier" style="margin-top:2rem">
      <section aria-labelledby="titre-lignes">
        <h2 id="titre-lignes" class="cache">Plats commandés</h2>
        ${lignes.map((l) => `
          <div class="panier-ligne" data-ligne="${l.plat.id}">
            <img src="assets/img/plats/${l.plat.image}" alt="${l.plat.alt}" width="90" height="70" loading="lazy">
            <div>
              <h3 style="font-size:1rem;margin:0 0 .25rem"><a href="plat.html?id=${l.plat.id}" style="color:var(--encre);text-decoration:none">${l.plat.nom}</a></h3>
              <p style="margin:0;color:var(--gris);font-size:.88rem">${prixFCFA(l.plat.prix)} l'unité</p>
              <button type="button" class="btn btn--petit" data-retirer="${l.plat.id}"
                      style="background:none;border:0;color:var(--erreur);padding:0;min-height:auto;font-size:.85rem;text-decoration:underline;cursor:pointer;margin-top:.25rem">
                Retirer
              </button>
            </div>
            <div class="quantite">
              <button type="button" data-moins="${l.plat.id}" aria-label="Retirer un ${l.plat.nom}">−</button>
              <span>${l.quantite}</span>
              <button type="button" data-plus="${l.plat.id}" aria-label="Ajouter un ${l.plat.nom}">+</button>
            </div>
            <strong class="prix">${prixFCFA(l.sousTotal)}</strong>
          </div>`).join('')}

        <p style="margin-top:1.5rem;display:flex;gap:1rem;flex-wrap:wrap">
          <a class="btn btn--secondaire" href="menu.html">Continuer mes achats</a>
          <button type="button" class="btn btn--secondaire" id="vider">Vider le panier</button>
        </p>
      </section>

      <aside class="recap" aria-labelledby="titre-recap">
        <h2 id="titre-recap" style="margin-top:0">Récapitulatif</h2>
        <dl>
          <dt>Sous-total</dt><dd id="sous-total">${prixFCFA(Panier.sousTotal())}</dd>
          <dt>Livraison</dt><dd id="frais">Choisir un quartier</dd>
        </dl>
        <hr>
        <dl>
          <dt style="font-weight:700;color:var(--encre)">Total</dt>
          <dd class="total" id="total">${prixFCFA(Panier.sousTotal())}</dd>
        </dl>
        <p id="note-livraison" style="font-size:.85rem;color:var(--gris);margin:0"></p>
      </aside>
    </div>

    <section class="carte" style="margin-top:3rem" aria-labelledby="titre-form">
      <h2 id="titre-form" style="margin-top:0">Vos coordonnées</h2>
      <form id="form-commande" novalidate>
        <div class="grille-2" style="gap:1.5rem">
          <div class="champ">
            <label for="nom">Nom complet</label>
            <input type="text" id="nom" name="nom" required autocomplete="name">
            <p class="erreur-champ" id="err-nom" hidden></p>
          </div>
          <div class="champ">
            <label for="telephone">Téléphone (format camerounais)</label>
            <input type="tel" id="telephone" name="telephone" placeholder="6 XX XX XX XX" required autocomplete="tel">
            <p class="erreur-champ" id="err-telephone" hidden></p>
          </div>
          <div class="champ">
            <label for="quartier">Quartier de livraison</label>
            <select id="quartier" name="quartier" required>
              <option value="">Choisir un quartier…</option>
              ${QUARTIERS.map((q) => `<option value="${q.nom}">${q.nom} — ${prixFCFA(q.frais)}, ${q.delai} min</option>`).join('')}
            </select>
            <p class="erreur-champ" id="err-quartier" hidden></p>
          </div>
          <div class="champ">
            <label for="paiement">Paiement</label>
            <select id="paiement" name="paiement">
              <option value="Espèces à la livraison">Espèces à la livraison</option>
              <option value="Orange Money">Orange Money</option>
              <option value="MTN Mobile Money">MTN Mobile Money</option>
            </select>
          </div>
        </div>
        <div class="champ" style="margin-top:1.5rem">
          <label for="adresse">Adresse précise (rue, repère)</label>
          <input type="text" id="adresse" name="adresse" placeholder="Ex. : derrière la pharmacie du Rond-point Deido" required>
          <p class="erreur-champ" id="err-adresse" hidden></p>
        </div>
        <div class="champ" style="margin-top:1.5rem">
          <label for="notes">Précisions (facultatif)</label>
          <textarea id="notes" name="notes" placeholder="Sans piment, sonner deux fois…"></textarea>
        </div>
        <p style="margin-top:1.5rem">
          <button type="submit" class="btn btn--principal">Valider la commande</button>
        </p>
        <p id="resultat-commande" role="status" aria-live="polite"></p>
      </form>
    </section>`;
}

/* ---------- Total ---------- */

function majTotaux() {
  const select = document.getElementById('quartier');
  if (!select) return;
  const quartier = select.value;
  const frais = Panier.fraisLivraison(quartier);
  const sousTotal = Panier.sousTotal();

  document.getElementById('sous-total').textContent = prixFCFA(sousTotal);
  document.getElementById('frais').textContent =
    frais === null ? 'Choisir un quartier' : (frais === 0 ? 'Offerte' : prixFCFA(frais));
  document.getElementById('total').textContent = prixFCFA(Panier.total(quartier));

  const note = document.getElementById('note-livraison');
  const manque = LIVRAISON_OFFERTE - sousTotal;
  note.textContent = manque > 0
    ? `Encore ${prixFCFA(manque)} pour la livraison offerte.`
    : 'Livraison offerte : commande supérieure à 15 000 FCFA.';
}

/* ---------- Validation ---------- */

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

function validerCommande(donnees) {
  // Toutes les erreurs sont affichées d'un coup : corriger un champ, resoumettre,
  // découvrir l'erreur suivante est le moyen le plus sûr de faire abandonner.
  const controles = [
    erreur('nom', donnees.nom.trim().length < 3 ? 'Indiquez votre nom complet.' : ''),
    erreur('telephone', REGEX_TELEPHONE.test(donnees.telephone.trim()) ? '' : 'Numéro camerounais attendu, commençant par 6.'),
    erreur('quartier', donnees.quartier ? '' : 'Choisissez un quartier de livraison.'),
    erreur('adresse', donnees.adresse.trim().length < 8 ? 'Précisez la rue ou un repère.' : ''),
  ];
  return controles.every(Boolean);
}

/* ---------- Confirmation ---------- */

function messageWhatsApp(donnees) {
  const lignes = Panier.lignes()
    .map((l) => `• ${l.quantite} × ${l.plat.nom} — ${prixFCFA(l.sousTotal)}`).join('\n');
  const frais = Panier.fraisLivraison(donnees.quartier);
  return [
    'Bonjour Cuisine Locale, je souhaite commander :',
    '',
    lignes,
    '',
    `Sous-total : ${prixFCFA(Panier.sousTotal())}`,
    `Livraison (${donnees.quartier}) : ${frais === 0 ? 'offerte' : prixFCFA(frais)}`,
    `TOTAL : ${prixFCFA(Panier.total(donnees.quartier))}`,
    '',
    `Nom : ${donnees.nom}`,
    `Téléphone : ${donnees.telephone}`,
    `Adresse : ${donnees.adresse}`,
    `Paiement : ${donnees.paiement}`,
    donnees.notes.trim() ? `Précisions : ${donnees.notes.trim()}` : '',
  ].filter(Boolean).join('\n');
}

function confirmer(donnees) {
  const quartier = QUARTIERS.find((q) => q.nom === donnees.quartier);
  const total = Panier.total(donnees.quartier);
  const texte = messageWhatsApp(donnees);
  const reference = `CL-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  document.getElementById('zone-panier').innerHTML = `
    <div class="message message--succes" style="margin-top:2rem">
      <h1 style="margin-top:0">Commande enregistrée</h1>
      <p>Référence <strong>${reference}</strong> — un appel de confirmation suit dans les
         cinq minutes. Livraison estimée à <strong>${quartier.delai} minutes</strong> après
         confirmation.</p>
      <p style="margin-bottom:0">Montant à régler : <strong>${prixFCFA(total)}</strong> — ${donnees.paiement.toLowerCase()}.</p>
    </div>

    <div class="carte">
      <h2 style="margin-top:0">Récapitulatif</h2>
      <pre style="white-space:pre-wrap;font-family:inherit;margin:0;color:var(--gris)">${texte}</pre>
      <p style="margin:1.5rem 0 0;display:flex;gap:1rem;flex-wrap:wrap">
        <a class="btn btn--principal" target="_blank" rel="noopener"
           href="https://wa.me/${RESTAURANT.whatsapp}?text=${encodeURIComponent(texte)}">
          Envoyer aussi par WhatsApp
        </a>
        <a class="btn btn--secondaire" href="menu.html">Commander autre chose</a>
      </p>
      <p style="font-size:.85rem;color:var(--gris);margin:1.5rem 0 0">
        Site de démonstration : aucune commande n'est réellement transmise, et aucune
        donnée ne quitte votre navigateur.</p>
    </div>`;

  Panier.vider();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Démarrage ---------- */

function dessiner() {
  const zone = document.getElementById('zone-panier');
  zone.innerHTML = Panier.nombreArticles() === 0 ? vueVide() : vuePanier();
  if (Panier.nombreArticles() === 0) return;

  majTotaux();
  document.getElementById('quartier').addEventListener('change', majTotaux);
  document.getElementById('vider').addEventListener('click', () => {
    Panier.vider();
    notifier('Panier vidé');
    dessiner();
  });

  document.getElementById('form-commande').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const donnees = {
      nom: f.nom.value, telephone: f.telephone.value, quartier: f.quartier.value,
      adresse: f.adresse.value, paiement: f.paiement.value, notes: f.notes.value,
    };
    if (!validerCommande(donnees)) {
      document.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    confirmer(donnees);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  dessiner();

  // Les boutons de quantité sont recréés à chaque dessin : un écouteur unique
  // sur le document survit à ces reconstructions.
  document.addEventListener('click', (e) => {
    const plus = e.target.closest('[data-plus]');
    const moins = e.target.closest('[data-moins]');
    const retirer = e.target.closest('[data-retirer]');
    if (!plus && !moins && !retirer) return;

    const contenu = Panier.contenu();
    if (plus) Panier.definir(plus.dataset.plus, (contenu[plus.dataset.plus] || 0) + 1);
    if (moins) Panier.definir(moins.dataset.moins, (contenu[moins.dataset.moins] || 0) - 1);
    if (retirer) { Panier.retirer(retirer.dataset.retirer); notifier('Plat retiré'); }
    dessiner();
  });
});
