#!/usr/bin/env node
/**
 * serveur-local.js — Petit serveur statique, sans aucune dépendance.
 *
 * Le module fonctionne aussi en double-clic sur index.html (file://),
 * mais certains navigateurs bloquent alors une partie des vérifications.
 * Pour tester dans les conditions réelles de GitHub Pages :
 *
 *   node serveur-local.js
 *   puis ouvrir http://localhost:4175
 *
 * Options : PORT=8080 node serveur-local.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4176;
const RACINE = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8',
};

/* Slugs des demos qui gerent leurs propres routes, lus dans l'inventaire
   produit par outils/construire-demos.js. Le repli ne s'applique qu'a elles :
   pour une demo statique, un fichier absent doit rester un 404 ici comme en
   ligne, sinon le serveur local masque des liens casses. */
const SLUGS_SPA = new Set((() => {
  try {
    const inv = JSON.parse(fs.readFileSync(path.join(RACINE, 'demos', 'index.json'), 'utf8'));
    return inv.demos.filter((d) => d.spa).map((d) => d.slug);
  } catch (e) {
    return [];
  }
})());

const serveur = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';

  // Empêche toute remontée hors de la racine servie.
  const cible = path.join(RACINE, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!cible.startsWith(RACINE)) {
    res.writeHead(403).end('403');
    return;
  }

  // Un chemin de repertoire sert son index.html, comme le fait GitHub Pages.
  // Sans cette regle, /03-module-web/ renvoie 404 alors que le fichier existe —
  // et le lien « Lancer le module » de la page d'accueil est casse en local.
  let fichier = cible;
  try {
    if (fs.existsSync(fichier) && fs.statSync(fichier).isDirectory()) {
      fichier = path.join(fichier, 'index.html');
    }
  } catch (e) { /* on laisse readFile produire le 404 */ }

  fs.readFile(fichier, (err, data) => {
    if (err) {
      // Meme repli que les regles _redirects appliquees par Netlify : une
      // application a routage interne doit recevoir son propre index.html pour
      // toute route profonde. Sans cette regle, recharger la page sur
      // /demos/devispro/factures renvoie 404 en local alors que la version en
      // ligne fonctionne — et le defaut ne se voit qu'apres deploiement.
      const spa = /^\/demos\/([^/]+)\//.exec(rel);
      if (spa && SLUGS_SPA.has(spa[1])) {
        const repli = path.join(RACINE, 'demos', spa[1], 'index.html');
        if (fs.existsSync(repli)) {
          res.writeHead(200, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-cache' });
          res.end(fs.readFileSync(repli));
          return;
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 — ' + rel + ' introuvable');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(fichier).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

serveur.listen(PORT, () => {
  console.log('Portfolio servi sur http://localhost:' + PORT);
  console.log('Racine : ' + RACINE);
});
