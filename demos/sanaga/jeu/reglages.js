/* GENERE par outils/build-reglages.js depuis 02-regles/equilibrage.json.
   Ne pas modifier a la main : la prochaine generation ecrase ce fichier.
   La source unique des valeurs du jeu reste le JSON. */

window.REGLAGES =
{
  "$description": "Toutes les valeurs chiffrees du jeu. Aucune constante de combat n'existe ailleurs : le jeu et le simulateur lisent ce fichier. Une modification ici change les deux, et le rapport d'equilibrage se regenere.",
  "version": "1.0.0",
  "plateau": {
    "colonnes": 8,
    "lignes": 5,
    "colonnes_deploiement": 3,
    "$note": "Chaque camp deploie sur ses trois colonnes. Les deux colonnes centrales sont la zone de rencontre.",
    "unites_max_par_camp": 8,
    "$unites_max": "Deux ressources limitent une composition : l'or et les places. En debut de partie l'or contraint, en fin de partie ce sont les places. Ce plafond est une decision de conception, pas une consequence du nombre de lignes."
  },
  "combat": {
    "tours_max": 60,
    "variance_degats": 0.15,
    "$variance": "Les degats varient de plus ou moins 15 %. Sans cette variance, deux memes equipes donneraient toujours le meme resultat et un taux de victoire n'aurait aucun sens. Au-dela de 25 %, le hasard domine la composition et l'equilibrage devient impossible a mesurer.",
    "degats_minimum": 1,
    "zone_cibles_secondaires": 0.6,
    "$zone_secondaires": "Les cibles autres que la cible principale d'une attaque de zone subissent 60 % des degats. Sans cette attenuation, les degats de zone montent plus vite que tout le reste quand les armees grossissent : le Sorcier passait de 51 % a 18 d'or a 84 %, alors que rien d'autre n'avait change que la taille des camps. Une unite dont la puissance depend du nombre d'ennemis ne peut pas etre reglee par un seul chiffre de degats."
  },
  "economie": {
    "or_depart": 10,
    "or_par_manche": 5,
    "or_victoire": 2,
    "points_vie_joueur": 12,
    "manches": 8
  },
  "unites": [
    {
      "id": "eclaireur",
      "nom": "Eclaireur",
      "role": "Harceleur rapide, meurt vite",
      "cout": 2,
      "pv": 56,
      "degats": 13,
      "portee": 1,
      "initiative": 9,
      "deplacement": 2,
      "special": null
    },
    {
      "id": "lancier",
      "nom": "Lancier",
      "role": "Ligne de front polyvalente",
      "cout": 3,
      "pv": 80,
      "degats": 16,
      "portee": 1,
      "initiative": 6,
      "deplacement": 1,
      "special": null
    },
    {
      "id": "archere",
      "nom": "Archere",
      "role": "Degats a distance, fragile",
      "cout": 3,
      "pv": 59,
      "degats": 15,
      "portee": 2,
      "initiative": 7,
      "deplacement": 1,
      "special": null
    },
    {
      "id": "bouclier",
      "nom": "Porte-bouclier",
      "role": "Encaisse et fixe l'ennemi",
      "cout": 4,
      "pv": 160,
      "degats": 12,
      "portee": 1,
      "initiative": 4,
      "deplacement": 1,
      "special": "provocation"
    },
    {
      "id": "guerisseuse",
      "nom": "Guerisseuse",
      "role": "Soigne l'allie le plus blesse",
      "cout": 4,
      "pv": 70,
      "degats": 6,
      "portee": 2,
      "initiative": 5,
      "deplacement": 1,
      "special": "soin",
      "soin": 16
    },
    {
      "id": "sorcier",
      "nom": "Sorcier",
      "role": "Degats de zone sur les groupes",
      "cout": 5,
      "pv": 60,
      "degats": 26,
      "portee": 2,
      "initiative": 5,
      "deplacement": 1,
      "special": "zone",
      "rayon_zone": 1
    },
    {
      "id": "assassin",
      "nom": "Assassin",
      "role": "Frappe la cible la plus faible",
      "cout": 4,
      "pv": 90,
      "degats": 30,
      "portee": 1,
      "initiative": 8,
      "deplacement": 2,
      "special": "cible_faible"
    },
    {
      "id": "colosse",
      "nom": "Colosse",
      "role": "Masse lente et tres resistante",
      "cout": 6,
      "pv": 160,
      "degats": 20,
      "portee": 1,
      "initiative": 3,
      "deplacement": 1,
      "special": null
    }
  ],
  "equilibrage": {
    "$description": "Les bornes que le banc d'essai fait respecter. check-equilibrage.js sort en erreur si une seule unite en sort.",
    "taux_victoire_min": 0.45,
    "taux_victoire_max": 0.55,
    "parties_par_duel": 400,
    "graine_par_defaut": 20260902,
    "gaspillage_max": 0.2,
    "$gaspillage": "Un duel a budget egal n'est comparable que si les deux camps depensent reellement leur or. Au-dela de 20 % de reliquat, l'ecart mesure un arrondi et non une unite : le budget est declare non mesurable au lieu d'etre compte comme un desequilibre.",
    "budget_reference": 12,
    "$budget_reference": "Le budget sur lequel le jeu s'engage. C'est celui des manches 3 a 5, ou la partie se decide. check-equilibrage.js echoue si une unite en sort.",
    "budgets_observes": [
      6,
      9,
      18
    ],
    "$budgets_observes": "Mesures rapportees mais non bloquantes. A 6 et 9 d'or les arrondis rendent la comparaison non significative ; a 18 le desequilibre est reel et reste ouvert.",
    "graines_controle": [
      1,
      777,
      20260902,
      999983,
      31337
    ],
    "$graines": "Cinq graines independantes : un equilibrage qui ne tient que sur une graine est un surajustement, pas un equilibrage."
  }
};
