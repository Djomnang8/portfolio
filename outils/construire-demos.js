#!/usr/bin/env node
/* =============================================================================
   construire-demos.js — Assemble le dossier demos/ du portfolio.

   Pourquoi ce script existe
   -------------------------
   Un recruteur ne va pas cloner douze depots, installer Docker et lancer une
   base de donnees pour voir si le travail tient. Il ouvre le portfolio, il
   clique, et il juge en trente secondes. Les demos doivent donc etre servies
   par le portfolio lui-meme.

   Or Netlify ne deploie qu'un seul depot : il n'a aucun acces aux depots
   voisins. Le dossier demos/ est donc versionne ici — mais il reste un produit
   de construction, jamais edite a la main. Ce script le refabrique a partir des
   depots d'origine, qui restent la seule source de verite.

     node outils/construire-demos.js            tout reconstruire
     node outils/construire-demos.js stock kit-design   une ou plusieurs demos

   Ce que le script produit
   ------------------------
     demos/<slug>/…      l'application, servie sous /demos/<slug>/
     demos/index.json    l'inventaire, lu par la page pour afficher les cartes
     _redirects          les regles Netlify pour les applications a routage
                         interne (sans elles, un rechargement sur une route
                         profonde renvoie 404)

   Aucune dependance : uniquement la bibliotheque standard de Node.
   ============================================================================= */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const PORTFOLIO = path.resolve(__dirname, '..');
const VOISINS = path.resolve(PORTFOLIO, '..');
const DEMOS = path.join(PORTFOLIO, 'demos');
const MANIFESTE = JSON.parse(fs.readFileSync(path.join(__dirname, 'demos.json'), 'utf8'));

/* Fichiers qu'il ne faut jamais recopier dans une demo : ils gonflent le depot
   sans rien apporter au visiteur, et certains (node_modules) le rendraient
   impossible a pousser. */
const EXCLUS = new Set(['node_modules', '.git', 'target', '.idea', 'dist', '__pycache__', '.venv']);

/* ------------------------------------------------------------------ outils -- */

function effacer(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copier(src, dest) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const nom of fs.readdirSync(src)) {
      if (EXCLUS.has(nom)) continue;
      copier(path.join(src, nom), path.join(dest, nom));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function poids(p) {
  let total = 0, fichiers = 0;
  (function parcourir(d) {
    for (const nom of fs.readdirSync(d)) {
      const c = path.join(d, nom);
      const st = fs.statSync(c);
      if (st.isDirectory()) parcourir(c);
      else { total += st.size; fichiers++; }
    }
  })(p);
  return { ko: Math.round(total / 1024), fichiers };
}

function npm(args, cwd) {
  // Sous Windows, npm est un script .cmd : il faut passer par le shell.
  execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    cwd, stdio: 'pipe', shell: process.platform === 'win32',
  });
}

/* ------------------------------------------------------------- fabrication -- */

function fabriquerCopie(d, racineDepot, dest) {
  const base = d.racine ? path.join(racineDepot, d.racine) : racineDepot;
  for (const s of d.sources) {
    const src = path.join(racineDepot, s);
    if (!fs.existsSync(src)) throw new Error(`source absente : ${s}`);
    // « racine » sert a remonter le contenu d'un sous-dossier au niveau de la
    // demo : 03-module-web/index.html devient demos/module-a11y/index.html.
    const rel = d.racine ? path.relative(base, src) : s;
    copier(src, path.join(dest, rel));
  }
}

function fabriquerNode(d, racineDepot, dest) {
  // Generateur maison, sans npm : on lui passe le prefixe d'URL et un dossier
  // de sortie a part. Ecrire dans le depot d'origine melangerait la
  // construction du portfolio avec la version servie a la racine du blog.
  const args = d.commande.map((a) => a.replace('{slug}', d.slug));
  execFileSync(process.execPath, args, { cwd: racineDepot, stdio: 'pipe' });
  const sortie = path.join(racineDepot, d.sortie);
  copier(sortie, dest);
  effacer(sortie);
  // Fichiers de service propres au blog : sous /demos/, ils feraient double
  // emploi avec ceux du portfolio.
  for (const nom of ['robots.txt', 'sitemap.xml']) effacer(path.join(dest, nom));
}

function fabriquerVite(d, racineDepot, dest) {
  const cwd = path.join(racineDepot, d.dossier);
  // --base indique a Vite le prefixe d'URL sous lequel l'application sera
  // servie. Sans lui, le HTML pointe vers /assets/… : la demo affiche une page
  // blanche des qu'elle n'est pas a la racine du domaine.
  npm(['run', 'build', '--', `--base=/demos/${d.slug}/`, '--outDir=dist-demo', '--emptyOutDir'], cwd);
  copier(path.join(cwd, 'dist-demo'), dest);
  effacer(path.join(cwd, 'dist-demo'));
}

function fabriquerAngular(d, racineDepot, dest) {
  const cwd = path.join(racineDepot, d.dossier);
  npm(['run', 'build', '--', `--base-href=/demos/${d.slug}/`], cwd);
  copier(path.join(cwd, d.sortie), dest);
}

/* -------------------------------------------------------------- execution -- */

const demandes = process.argv.slice(2);
const aFaire = demandes.length
  ? MANIFESTE.demos.filter((d) => demandes.includes(d.slug))
  : MANIFESTE.demos;

if (!aFaire.length) {
  console.error('Aucune demo ne correspond. Slugs connus : ' +
    MANIFESTE.demos.map((d) => d.slug).join(', '));
  process.exit(1);
}

fs.mkdirSync(DEMOS, { recursive: true });

const inventaire = [];
let echecs = 0;

for (const d of MANIFESTE.demos) {
  const dest = path.join(DEMOS, d.slug);
  const racineDepot = path.join(VOISINS, d.depot);

  if (!aFaire.includes(d)) {
    // Demo non reconstruite dans cette execution : on la garde telle quelle
    // dans l'inventaire si elle existe deja sur le disque.
    if (fs.existsSync(dest)) {
      inventaire.push({ ...sansCommentaires(d), ...poids(dest) });
    }
    continue;
  }

  process.stdout.write(`  ${d.slug.padEnd(14)} ${d.mode.padEnd(8)}`);

  if (!fs.existsSync(racineDepot)) {
    console.log(`IGNOREE — depot ${d.depot} absent du disque`);
    echecs++;
    continue;
  }

  try {
    effacer(dest);
    fs.mkdirSync(dest, { recursive: true });
    if (d.mode === 'copie') fabriquerCopie(d, racineDepot, dest);
    else if (d.mode === 'node') fabriquerNode(d, racineDepot, dest);
    else if (d.mode === 'vite') fabriquerVite(d, racineDepot, dest);
    else if (d.mode === 'angular') fabriquerAngular(d, racineDepot, dest);
    else throw new Error(`mode inconnu : ${d.mode}`);

    const entree = path.join(dest, d.entree);
    if (!fs.existsSync(entree)) throw new Error(`point d'entree manquant : ${d.entree}`);

    const p = poids(dest);
    console.log(`${String(p.fichiers).padStart(4)} fichiers  ${String(p.ko).padStart(6)} Ko`);
    inventaire.push({ ...sansCommentaires(d), ...p });
  } catch (e) {
    console.log(`ECHEC — ${String(e.message).split('\n')[0]}`);
    effacer(dest);
    echecs++;
  }
}

function sansCommentaires(d) {
  return {
    slug: d.slug, titre: d.titre, sous_titre: d.sous_titre, depot: d.depot,
    url: `demos/${d.slug}/${d.entree === 'index.html' ? '' : d.entree}`,
    hors_ligne: d.hors_ligne, spa: !!d.spa,
  };
}

/* Inventaire lu par la page : les cartes affichent un bouton « Lancer la
   demo » uniquement pour les demos reellement presentes sur le disque. Une
   demo dont la construction echoue disparait de la page au lieu d'y laisser
   un lien mort. */
inventaire.sort((a, b) => a.slug.localeCompare(b.slug, 'fr'));
fs.writeFileSync(path.join(DEMOS, 'index.json'),
  JSON.stringify({ genere_le: new Date().toISOString().slice(0, 10), demos: inventaire }, null, 2) + '\n');

/* Regles Netlify. Les applications a routage interne doivent renvoyer leur
   propre index.html en 200 (et non une redirection) pour toute route profonde,
   sinon un rechargement sur /demos/devispro/factures renvoie 404. */
const regles = [
  '# Genere par outils/construire-demos.js — ne pas editer a la main.',
  '#',
  '# Les applications a routage interne servent leur index.html pour toute',
  '# route profonde. Le code 200 est important : une redirection 301 changerait',
  "# l'URL affichee et casserait la navigation arriere.",
  '',
  ...inventaire.filter((d) => d.spa)
    .map((d) => `/demos/${d.slug}/*   /demos/${d.slug}/index.html   200`),
  '',
];
fs.writeFileSync(path.join(PORTFOLIO, '_redirects'), regles.join('\n'));

const total = inventaire.reduce((s, d) => s + d.ko, 0);
console.log(`\n${inventaire.length} demo(s) dans demos/index.json — ${total} Ko au total.`);
console.log(`${inventaire.filter((d) => d.spa).length} regle(s) de routage ecrites dans _redirects.`);
if (echecs) {
  console.log(`${echecs} echec(s).`);
  process.exit(1);
}
