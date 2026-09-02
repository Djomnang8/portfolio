#!/usr/bin/env node
/* =============================================================================
   ordonner-projets.js — Reordonne les cartes de projet dans index.html.

   Pourquoi ce script existe
   -------------------------
   Un recruteur juge sur les trois premieres cartes. L'ordre de la grille est
   donc une decision editoriale, pas un hasard de l'ordre d'ecriture — et il
   change chaque fois qu'un projet s'ajoute.

   Deplacer a la main seize blocs <article> de quarante lignes dans un fichier
   de deux mille lignes est une operation ou l'on perd une balise sans s'en
   apercevoir. Le script le fait par decoupage exact, et refuse de reecrire le
   fichier si un seul projet de la liste est introuvable.

     node outils/ordonner-projets.js            applique l'ordre
     node outils/ordonner-projets.js --verifier controle sans rien ecrire

   Le critere de classement
   ------------------------
   Du plus au moins pertinent pour une candidature : d'abord les applications
   completes (backend + frontend + base de donnees), Python en tete ; puis les
   projets Python et donnees ; puis l'IA appliquee ; enfin le front et le
   contenu.

   Aucune dependance : uniquement la bibliotheque standard de Node.
   ============================================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

const PORTFOLIO = path.resolve(__dirname, '..');
const PAGE = path.join(PORTFOLIO, 'index.html');

/* Chaque entree est un fragment du titre <h3>, suffisant pour l'identifier.
   L'ordre de ce tableau est l'ordre de la grille. */
const ORDRE = [
  // 1. Applications completes : backend + frontend + base de donnees
  'MecaTrack',                      // Django (Python) + Angular + PostgreSQL + Docker + CI
  'DevisPro',                       // Laravel + Vue 3 + MySQL + Docker
  'BuildTrack',                     // Node/Express + Prisma + React + PostgreSQL
  'Gestion des stocks',             // Spring Boot, quatre microservices + console
  'Plateforme de formation',        // Spring Boot + Flutter + MySQL

  // 2. IA appliquee, avec backend et interface
  'DocuRAG',                        // TypeScript + React + pgvector
  'Assistant Ops',                  // TypeScript + Express + React

  // 3. Python et donnees
  'EnergyTrack API',                // FastAPI + SQLAlchemy + PostgreSQL
  'Entrepôt de données',            // ETL Python + entrepot en etoile
  'Factures Insights',              // pandas + Plotly + Streamlit
  'rag-bench',                      // banc d'essai Python

  // 4. Front, contenu et design
  'Fait Main',                      // generateur statique Node + editorial
  'accessibilité numérique',        // module e-learning
  'Kit Design Pédagogique',         // systeme de design verifiable
  'Audit d\'accessibilité',         // etude de cas avant / apres
  'Cuisine Locale',                 // site de restaurant statique
  'Atelier de marque',              // identite de marque : SVG generes, charte statique

  // 5. Jeu video : hors du metier vise par le reste de la grille, donc en
  // dernier — c'est pourtant le projet qui montre le plus de methode de mesure.
  'Sanaga',                         // moteur de combat + banc d'equilibrage
];

const C = { reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', dim: '\x1b[2m', bold: '\x1b[1m' };

/**
 * Decoupe la grille en blocs. Un bloc va du commentaire qui precede l'article
 * jusqu'a </article> : le commentaire doit suivre sa carte, sinon les reperes
 * du fichier designeraient le mauvais projet apres deplacement.
 */
function extraireBlocs(grille) {
  const blocs = [];
  const re = /(?:[ \t]*<!--[^]*?-->\s*)?<article class="project">[^]*?<\/article>/g;
  let m;
  while ((m = re.exec(grille)) !== null) {
    const titre = (m[0].match(/<h3 class="project__title">([^]*?)<\/h3>/) || [])[1] || '';
    blocs.push({ html: m[0], titre: titre.replace(/\s+/g, ' ').trim() });
  }
  return blocs;
}

function main() {
  const verifierSeulement = process.argv.includes('--verifier');
  const source = fs.readFileSync(PAGE, 'utf8');

  const debut = source.indexOf('<div class="projects__grid">');
  if (debut === -1) { console.error('Grille des projets introuvable.'); process.exit(2); }
  const finGrille = source.indexOf('\n          </div>', debut);
  if (finGrille === -1) { console.error('Fin de la grille introuvable.'); process.exit(2); }

  const avant = source.slice(0, debut + '<div class="projects__grid">'.length);
  const grille = source.slice(debut + '<div class="projects__grid">'.length, finGrille);
  const apres = source.slice(finGrille);

  const blocs = extraireBlocs(grille);
  if (!blocs.length) { console.error('Aucune carte de projet trouvee.'); process.exit(2); }

  // Le modele en fin de grille n'est pas une carte : on le conserve tel quel.
  const modele = grille.slice(grille.lastIndexOf(blocs[blocs.length - 1].html) + blocs[blocs.length - 1].html.length);

  const restants = [...blocs];
  const ordonnes = [];
  const absents = [];

  for (const cle of ORDRE) {
    const i = restants.findIndex((b) => b.titre.includes(cle));
    if (i === -1) { absents.push(cle); continue; }
    ordonnes.push(restants.splice(i, 1)[0]);
  }

  // Refuser plutot que produire une page amputee : une carte perdue en
  // silence est exactement le defaut que ce script doit empecher.
  if (absents.length) {
    console.error(`${C.red}✖ Introuvables dans index.html :${C.reset}`);
    for (const a of absents) console.error(`   « ${a} »`);
    console.error(`\n${C.dim}Titres presents :${C.reset}`);
    for (const b of blocs) console.error(`   ${b.titre}`);
    process.exit(1);
  }
  if (restants.length) {
    console.error(`${C.red}✖ ${restants.length} carte(s) absente(s) de la liste ORDRE :${C.reset}`);
    for (const r of restants) console.error(`   ${r.titre}`);
    console.error('\nAjoutez-les a ORDRE : une carte hors liste serait supprimee.');
    process.exit(1);
  }

  console.log(`${C.bold}Ordre applique${C.reset}`);
  ordonnes.forEach((b, i) => console.log(`  ${String(i + 1).padStart(2)}. ${b.titre.replace(/&amp;/g, '&')}`));

  if (verifierSeulement) {
    console.log(`\n${C.green}✔ ${ordonnes.length} cartes reconnues, aucune perdue. Rien n'a ete ecrit.${C.reset}`);
    return;
  }

  const nouvelle = '\n' + ordonnes.map((b) => b.html.replace(/^\s*\n/, '')).join('\n\n') + '\n' + modele.replace(/^\s*\n+/, '\n');
  fs.writeFileSync(PAGE, avant + nouvelle + apres, 'utf8');

  console.log(`\n${C.green}${C.bold}✔ index.html reecrit — ${ordonnes.length} cartes.${C.reset}`);
}

if (require.main === module) main();
