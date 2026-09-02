/**
 * menu.js — Filtrage, recherche et tri de la carte.
 *
 * Tout se fait dans le navigateur : les 14 plats tiennent en mémoire, aucune
 * requête n'est nécessaire. L'état des filtres est écrit dans l'URL, ce qui
 * rend une sélection partageable et rend le bouton « précédent » cohérent.
 */

'use strict';

const etat = { categorie: 'tous', recherche: '', tri: 'populaire', vegetarien: false };

/** Retire accents et casse : « Ndolé » et « ndole » doivent se trouver l'un l'autre. */
const normaliser = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function filtrer() {
  const q = normaliser(etat.recherche.trim());

  let resultat = PLATS.filter((p) => {
    if (etat.categorie === 'favoris') { if (!Favoris.contient(p.id)) return false; }
    else if (etat.categorie !== 'tous' && p.categorie !== etat.categorie) return false;
    if (etat.vegetarien && !p.vegetarien) return false;
    if (!q) return true;
    // La recherche couvre aussi les ingrédients : « arachide » doit ramener le ndolé.
    const champs = [p.nom, p.resume, p.description, ...p.ingredients].map(normaliser);
    return champs.some((c) => c.includes(q));
  });

  const tris = {
    populaire: (a, b) => (b.populaire - a.populaire) || a.prix - b.prix,
    'prix-croissant': (a, b) => a.prix - b.prix,
    'prix-decroissant': (a, b) => b.prix - a.prix,
    nom: (a, b) => a.nom.localeCompare(b.nom, 'fr'),
  };
  return resultat.sort(tris[etat.tri] || tris.populaire);
}

function afficher() {
  const liste = document.getElementById('liste-plats');
  const compteur = document.getElementById('compteur');
  const resultats = filtrer();

  liste.textContent = '';
  if (!resultats.length) {
    compteur.textContent = 'Aucun plat ne correspond.';
    liste.innerHTML = `<li class="vide" style="grid-column:1/-1">
        <h2>Rien ne correspond à cette recherche</h2>
        <p>Essayez un autre mot, ou retirez les filtres.</p>
        <button type="button" class="btn btn--secondaire" id="reinitialiser">Tout afficher</button>
      </li>`;
    document.getElementById('reinitialiser').addEventListener('click', () => {
      etat.categorie = 'tous'; etat.recherche = ''; etat.vegetarien = false;
      document.getElementById('recherche').value = '';
      document.getElementById('vegetarien').checked = false;
      synchroniserOnglets(); ecrireUrl(); afficher();
    });
    return;
  }

  compteur.textContent = `${resultats.length} plat${resultats.length > 1 ? 's' : ''} affiché${resultats.length > 1 ? 's' : ''} sur ${PLATS.length}.`;
  const fragment = document.createDocumentFragment();
  resultats.forEach((p) => fragment.appendChild(cartePlat(p)));
  liste.appendChild(fragment);
}

function synchroniserOnglets() {
  document.querySelectorAll('[data-categorie]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.categorie === etat.categorie));
  });
}

/** L'URL porte l'état : une sélection se partage et se retrouve dans l'historique. */
function ecrireUrl() {
  const p = new URLSearchParams();
  if (etat.categorie !== 'tous') p.set('categorie', etat.categorie);
  if (etat.recherche) p.set('q', etat.recherche);
  if (etat.tri !== 'populaire') p.set('tri', etat.tri);
  if (etat.vegetarien) p.set('vegetarien', '1');
  const suffixe = p.toString();
  history.replaceState(null, '', suffixe ? `?${suffixe}` : location.pathname);
}

function lireUrl() {
  const p = new URLSearchParams(location.search);
  const cat = p.get('categorie');
  if (cat && (cat === 'favoris' || CATEGORIES.some((c) => c.id === cat))) etat.categorie = cat;
  etat.recherche = p.get('q') || '';
  if (['prix-croissant', 'prix-decroissant', 'nom'].includes(p.get('tri'))) etat.tri = p.get('tri');
  etat.vegetarien = p.get('vegetarien') === '1';
}

document.addEventListener('DOMContentLoaded', () => {
  lireUrl();

  const recherche = document.getElementById('recherche');
  const tri = document.getElementById('tri');
  const vegetarien = document.getElementById('vegetarien');

  recherche.value = etat.recherche;
  tri.value = etat.tri;
  vegetarien.checked = etat.vegetarien;

  document.querySelectorAll('[data-categorie]').forEach((b) => {
    b.addEventListener('click', () => {
      etat.categorie = b.dataset.categorie;
      synchroniserOnglets(); ecrireUrl(); afficher();
    });
  });

  recherche.addEventListener('input', () => { etat.recherche = recherche.value; ecrireUrl(); afficher(); });
  tri.addEventListener('change', () => { etat.tri = tri.value; ecrireUrl(); afficher(); });
  vegetarien.addEventListener('change', () => { etat.vegetarien = vegetarien.checked; ecrireUrl(); afficher(); });

  // Retirer un favori depuis l'onglet « Favoris » doit faire disparaître la carte.
  document.addEventListener('favoris:change', () => { if (etat.categorie === 'favoris') afficher(); });

  synchroniserOnglets();
  afficher();
});
