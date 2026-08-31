#!/usr/bin/env python3
"""
generer.py — Produit le tableau de bord HTML depuis l'entrepôt.

Un fichier autonome, sans serveur ni dépendance : les données sont injectées
dans la page au moment de la génération. On l'ouvre par double-clic, on
l'envoie par courriel, on le publie sur GitHub Pages — il fonctionne partout.

Les requêtes affichées sont celles de entrepot/requetes/, lues telles quelles.
Ce qui est montré est donc exactement ce qui est versionné, sans SQL caché
dans le générateur.

Usage : python tableau-de-bord/generer.py
"""

import glob
import html
import json
import os
import sqlite3
import sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BDD = os.path.join(RACINE, "entrepot", "entrepot.db")
SORTIE = os.path.join(RACINE, "tableau-de-bord", "index.html")


def requetes(db):
    """Exécute chaque fichier .sql et renvoie son nom et ses lignes."""
    resultats = {}
    for chemin in sorted(glob.glob(os.path.join(RACINE, "entrepot", "requetes", "*.sql"))):
        nom = os.path.basename(chemin).replace(".sql", "")
        sql = open(chemin, encoding="utf-8").read()
        lignes = [dict(r) for r in db.execute(sql).fetchall()]
        resultats[nom] = {"sql": sql, "lignes": lignes}
    return resultats


def barres(lignes, cle_libelle, cle_valeur, unite="m³"):
    """Barres horizontales en HTML pur — aucune bibliothèque de graphiques."""
    if not lignes:
        return "<p class='vide'>Aucune donnée.</p>"
    maxi = max((l[cle_valeur] or 0) for l in lignes) or 1
    out = ['<div class="barres">']
    for l in lignes:
        v = l[cle_valeur] or 0
        pct = v / maxi * 100
        out.append(
            f'<div class="barre">'
            f'<span class="barre__lib">{html.escape(str(l[cle_libelle]))}</span>'
            f'<span class="barre__piste"><span class="barre__jauge" style="width:{pct:.1f}%"></span></span>'
            f'<span class="barre__val">{v:,.0f} {unite}</span>'
            f'</div>'.replace(",", " ")
        )
    out.append("</div>")
    return "\n".join(out)


def tableau(lignes, colonnes=None):
    if not lignes:
        return "<p class='vide'>Aucune donnée.</p>"
    cols = colonnes or list(lignes[0].keys())
    entetes = "".join(f"<th scope='col'>{html.escape(c.replace('_', ' '))}</th>" for c in cols)
    corps = []
    for l in lignes:
        cellules = []
        for c in cols:
            v = l.get(c)
            if isinstance(v, float):
                texte = f"{v:,.1f}".replace(",", " ")
                cellules.append(f"<td class='num'>{texte}</td>")
            elif isinstance(v, int):
                cellules.append(f"<td class='num'>{v}</td>")
            else:
                cellules.append(f"<td>{html.escape(str(v)) if v is not None else '—'}</td>")
        corps.append("<tr>" + "".join(cellules) + "</tr>")
    return (f"<div class='cadre-table'><table><thead><tr>{entetes}</tr></thead>"
            f"<tbody>{''.join(corps)}</tbody></table></div>")


def principal():
    if not os.path.exists(BDD):
        print("Entrepôt absent. Lancez d'abord : python pipeline/executer.py")
        return 2

    db = sqlite3.connect(BDD)
    db.row_factory = sqlite3.Row
    r = requetes(db)

    exe = dict(db.execute(
        "SELECT * FROM pipeline_execution ORDER BY id DESC LIMIT 1").fetchone())
    verite = json.load(open(os.path.join(RACINE, "sources", "verite-de-reference.json"),
                            encoding="utf-8"))

    zones = r["01-consommation-par-zone"]["lignes"]
    total_brut = sum(z["total_brut_m3"] or 0 for z in zones)
    total_net = sum(z["total_hors_signales_m3"] or 0 for z in zones)
    part_signales = (total_brut - total_net) / total_brut * 100 if total_brut else 0

    taux_charge = exe["lignes_chargees"] / exe["lignes_lues"] * 100

    # Le classement change-t-il selon qu'on inclut les signalés ? C'est le
    # constat central : si oui, aucun total brut n'est publiable tel quel.
    par_brut = [z["zone"] for z in sorted(zones, key=lambda z: -(z["total_brut_m3"] or 0))]
    par_net = [z["zone"] for z in sorted(zones, key=lambda z: -(z["total_hors_signales_m3"] or 0))]
    classement_change = par_brut != par_net

    style = open(os.path.join(RACINE, "tableau-de-bord", "style.css"), encoding="utf-8").read()

    # Construit hors du gabarit : une apostrophe française dans une f-string
    # imbriquée est un piège inutile.
    phrase_classement = (
        "<strong>Conséquence directe : le classement des zones s’inverse selon "
        "qu’on les inclut ou non.</strong> " if classement_change else ""
    )

    page = f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tableau de bord — Consommation et qualité des données</title>
<meta name="description" content="Pipeline ETL avec contrôle qualité tracé : {exe['lignes_lues']} lignes lues, {exe['lignes_rejetees']} rejetées, chaque rejet motivé.">
<meta name="color-scheme" content="light dark">
<style>
{style}
</style>
</head>
<body>
<a class="evitement" href="#contenu">Aller au contenu</a>

<header class="entete">
  <div class="conteneur">
    <p class="surtitre">Entrepôt de données · exécution du {html.escape(exe['horodatage'])}</p>
    <h1>Consommation et qualité des données</h1>
    <p class="accroche">
      {exe['lignes_lues']} lignes lues depuis 3 sources en 3 formats.
      {exe['lignes_rejetees']} rejetées, {exe['lignes_corrigees']} corrigées,
      {exe['lignes_signalees']} signalées — <strong>chacune avec son motif</strong>.
    </p>
  </div>
</header>

<main id="contenu" class="conteneur">

  <section aria-labelledby="t-pipeline">
    <h2 id="t-pipeline">L'exécution du pipeline</h2>
    <div class="chiffres">
      <p class="chiffre"><b>{exe['lignes_lues']}</b><span>lignes lues</span></p>
      <p class="chiffre chiffre--ok"><b>{exe['lignes_chargees']}</b><span>chargées — {taux_charge:.1f} %</span></p>
      <p class="chiffre chiffre--ko"><b>{exe['lignes_rejetees']}</b><span>rejetées, motif tracé</span></p>
      <p class="chiffre chiffre--attention"><b>{exe['lignes_corrigees']}</b><span>corrigées automatiquement</span></p>
      <p class="chiffre chiffre--signal"><b>{exe['lignes_signalees']}</b><span>signalées, conservées</span></p>
      <p class="chiffre"><b>{exe['duree_ms']} ms</b><span>durée totale</span></p>
    </div>
  </section>

  <section aria-labelledby="t-alerte" class="encadre">
    <h2 id="t-alerte">Le chiffre qu'il ne faut pas publier tel quel</h2>
    <p>
      Les <strong>{exe['lignes_signalees']} relevés signalés</strong> — fuites probables,
      conservés volontairement — représentent <strong>{part_signales:.0f} %</strong> de la
      consommation totale, pour {exe['lignes_signalees']} lignes sur {exe['lignes_chargees']}.
    </p>
    <p>
      {phrase_classement}
      En brut, l'ordre est {html.escape(' > '.join(par_brut[:3]))}.
      Hors signalés, il devient {html.escape(' > '.join(par_net[:3]))}.
      Un tableau de bord qui n'afficherait que le total brut donnerait une image fausse
      de la consommation ordinaire — et masquerait les fuites, noyées dans un total
      qu'elles constituent.
    </p>
  </section>

  <section aria-labelledby="t-zones">
    <h2 id="t-zones">Consommation par zone</h2>
    <h3>Hors relevés signalés — la consommation ordinaire</h3>
    {barres(sorted(zones, key=lambda z: -(z['total_hors_signales_m3'] or 0)), 'zone', 'total_hors_signales_m3')}
    <h3>Total brut — signalés inclus</h3>
    {barres(sorted(zones, key=lambda z: -(z['total_brut_m3'] or 0)), 'zone', 'total_brut_m3')}
    {tableau(zones)}
  </section>

  <section aria-labelledby="t-mois">
    <h2 id="t-mois">Évolution mensuelle</h2>
    {barres(r['02-consommation-mensuelle']['lignes'], 'mois', 'consommation_m3')}
  </section>

  <section aria-labelledby="t-top">
    <h2 id="t-top">Les dix plus gros consommateurs</h2>
    {tableau(r['03-top-consommateurs']['lignes'])}
  </section>

  <section aria-labelledby="t-signales">
    <h2 id="t-signales">Relevés signalés — à examiner en priorité</h2>
    <p class="aide">
      Conservés et marqués plutôt que rejetés : une consommation multipliée par cent
      est peut-être une fuite réelle. La rejeter reviendrait à jeter l'information
      qui compte le plus.
    </p>
    {tableau(r['06-releves-signales']['lignes'])}
  </section>

  <section aria-labelledby="t-qualite">
    <h2 id="t-qualite">Qualité par règle</h2>
    <p class="aide">
      {verite['total_defauts']} défauts ont été injectés dans les sources par
      <code>sources/generer-sources.py</code>. Le rapport de réconciliation
      (<code>qualite/reconcilier.py</code>) vérifie qu'aucun n'a échappé au pipeline.
    </p>
    {tableau(r['04-qualite-par-regle']['lignes'])}
  </section>

  <section aria-labelledby="t-sources">
    <h2 id="t-sources">Qualité par source</h2>
    <p class="aide">
      La requête qui permet d'aller corriger le problème à la racine, au lieu de
      nettoyer indéfiniment en aval.
    </p>
    {tableau(r['05-qualite-par-source']['lignes'])}
  </section>

</main>

<footer class="pied">
  <div class="conteneur">
    <p>
      Généré par <code>tableau-de-bord/generer.py</code> depuis l'entrepôt —
      aucune donnée saisie à la main.
      Les requêtes affichées sont celles de <code>entrepot/requetes/</code>.
    </p>
    <p>Joyce Djomnang · Licence MIT</p>
  </div>
</footer>
</body>
</html>
"""

    with open(SORTIE, "w", encoding="utf-8") as f:
        f.write(page)

    print(f"Tableau de bord généré — {len(page) / 1024:.1f} Ko")
    print(f"  {SORTIE}")
    print(f"  {len(r)} requêtes exécutées")
    print(f"  part des relevés signalés dans le total : {part_signales:.1f} %")
    print(f"  le classement des zones change selon l'inclusion : "
          f"{'OUI' if classement_change else 'non'}")
    return 0


if __name__ == "__main__":
    sys.exit(principal())
