/* =============================================================================
   donnees-demo.js — Le meme jeu de donnees que DonneesDemo.java.

   Pourquoi le dupliquer ici
   -------------------------
   La console doit rester utilisable quand aucun service ne tourne : c'est ce
   qui permet a quelqu'un d'ouvrir la demonstration en ligne et de juger le
   travail en trente secondes, sans installer Java ni Docker.

   Le jeu est identique a celui du service, references et quantites comprises,
   pour qu'une capture d'ecran faite en mode local et une capture faite contre
   les vrais services montrent les memes chiffres. Une demonstration qui ne
   correspond pas au produit ne demontre rien.

   Les quantites ne sont pas ecrites directement : comme cote serveur, elles
   sont atteintes par des mouvements reels, pour que le controle de coherence
   soit verifiable des le premier affichage.
   ============================================================================= */

window.DONNEES_DEMO = {
  articles: [
    // reference, nom, categorie, prix, recu, seuil, restant
    ['RIZ-25',  'Sac de riz 25 kg',    'Alimentaire',  18500,  40,  10,   8],
    ['HUI-05',  "Bidon d'huile 5 L",   'Alimentaire',   6200,  24,   8,  20],
    ['CIM-50',  'Sac de ciment 50 kg', 'Matériaux',     5400, 120,  30,  95],
    ['TOL-BAC', 'Tôle bac alu 3 m',    'Matériaux',    12800,  30,  12,  10],
    ['CAH-100', 'Cahier 100 pages',    'Papeterie',      450, 500, 100, 380],
    ['STY-BLU', 'Stylo bille bleu',    'Papeterie',      150, 300,  50, 300],
    ['AMP-LED', 'Ampoule LED 9 W',     'Électricité',   1750,  60,  15,   0],
    ['CAB-25',  'Câble 2,5 mm² (m)',   'Électricité',    900, 200,  40, 175],
  ],
};
