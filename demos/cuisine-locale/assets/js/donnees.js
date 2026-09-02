/**
 * donnees.js — Catalogue de Cuisine Locale.
 *
 * Source unique : les pages, le panier, la recherche et les contrôles lisent
 * toutes ce fichier. Un plat ajouté ici apparaît partout, avec son prix, sans
 * qu'aucune page n'ait à être modifiée.
 *
 * Choix volontaire d'un fichier JavaScript plutôt que JSON : le site
 * fonctionne alors aussi en ouvrant simplement index.html depuis le disque,
 * là où un fetch() serait bloqué par la politique d'origine du navigateur.
 */

'use strict';

const CATEGORIES = [
  { id: 'petit-dejeuner', nom: 'Petit-déjeuner', description: 'Ce qu\'on mange à Douala avant sept heures.' },
  { id: 'dejeuner', nom: 'Déjeuner', description: 'Les plats de midi, servis avec leur accompagnement.' },
  { id: 'diner', nom: 'Dîner', description: 'Les plats du soir, plus longs à préparer.' },
  { id: 'boissons', nom: 'Boissons', description: 'Jus naturels et boissons traditionnelles.' },
];

/**
 * Un plat.
 * @typedef {Object} Plat
 * @property {string} id          Identifiant d'URL, stable
 * @property {string} nom
 * @property {number} prix        En francs CFA, entier
 * @property {string} categorie   Identifiant d'une entrée de CATEGORIES
 * @property {string} image       Nom du fichier dans assets/img/plats/
 * @property {string} alt         Alternative textuelle, descriptive
 * @property {string} resume      Une phrase, affichée sur la carte
 * @property {string} description Deux à trois phrases, page du plat
 * @property {string[]} ingredients
 * @property {string[]} allergenes  Liste vide si aucun
 * @property {number} preparation   Minutes
 * @property {number} piment        0 à 3
 * @property {boolean} vegetarien
 * @property {boolean} populaire
 */
const PLATS = [
  {
    id: 'beignets-haricots',
    nom: 'Beignets-haricots-bouillie',
    prix: 600,
    categorie: 'petit-dejeuner',
    image: 'beignets-haricots.webp',
    alt: 'Assiette de beignets dorés, bol de haricots en sauce et tasse de bouillie de maïs',
    resume: 'Beignets croustillants, haricots savoureux et bouillie douce.',
    description: 'Le petit-déjeuner le plus servi du Cameroun, et le plus exigeant à réussir : la pâte lève une nuit entière, les haricots mijotent deux heures. Les beignets sortent de l\'huile au moment de servir, jamais avant.',
    ingredients: ['Farine de blé', 'Haricots rouges', 'Farine de maïs', 'Huile de palme', 'Oignon', 'Sel'],
    allergenes: ['Gluten'],
    preparation: 10,
    piment: 0,
    vegetarien: true,
    populaire: true,
  },
  {
    id: 'koki',
    nom: 'Koki de haricots',
    prix: 600,
    categorie: 'petit-dejeuner',
    image: 'koki.jpeg',
    alt: 'Parts de koki de haricots cuites en feuilles de bananier, servies avec une sauce pimentée',
    resume: 'Koki cuit en feuilles de bananier, avec sa sauce pimentée.',
    description: 'Une pâte de haricots blancs décortiqués, montée à l\'huile de palme rouge et cuite à la vapeur dans des feuilles de bananier. La feuille n\'est pas décorative : c\'est elle qui donne le parfum.',
    ingredients: ['Haricots blancs', 'Huile de palme', 'Feuilles de bananier', 'Piment', 'Sel'],
    allergenes: [],
    preparation: 10,
    piment: 2,
    vegetarien: true,
    populaire: false,
  },
  {
    id: 'beignets-banane',
    nom: 'Beignets de banane',
    prix: 600,
    categorie: 'petit-dejeuner',
    image: 'beignets-banane.jpeg',
    alt: 'Beignets de banane dorés et croustillants présentés dans un panier',
    resume: 'Une douceur tropicale croustillante et sucrée.',
    description: 'Bananes bien mûres écrasées, farine, un peu de muscade. Rien d\'autre. La friture doit être vive pour que le cœur reste fondant.',
    ingredients: ['Banane douce', 'Farine de blé', 'Sucre', 'Muscade', 'Huile'],
    allergenes: ['Gluten'],
    preparation: 8,
    piment: 0,
    vegetarien: true,
    populaire: false,
  },
  {
    id: 'ndole',
    nom: 'Ndolé aux crevettes',
    prix: 1500,
    categorie: 'dejeuner',
    image: 'ndole.jpeg',
    alt: 'Assiette de ndolé vert foncé aux crevettes et arachides, accompagnée de bâton de manioc et de riz',
    resume: 'Ndolé savoureux, avec bâton de manioc et riz parfumé.',
    description: 'Le plat national. Les feuilles de ndolé sont lavées trois fois pour retirer l\'amertume, puis liées à la pâte d\'arachide. Servi avec bâton de manioc et riz blanc.',
    ingredients: ['Feuilles de ndolé', 'Pâte d\'arachide', 'Crevettes', 'Viande de bœuf', 'Ail', 'Crevettes séchées'],
    allergenes: ['Arachides', 'Crustacés'],
    preparation: 25,
    piment: 1,
    vegetarien: false,
    populaire: true,
  },
  {
    id: 'nkui',
    nom: 'Couscous au nkui',
    prix: 1500,
    categorie: 'dejeuner',
    image: 'nkui.jpeg',
    alt: 'Bol de sauce nkui brune et filante, servi avec du couscous de maïs et des légumes',
    resume: 'Couscous relevé au nkui, garni de légumes frais.',
    description: 'Une sauce bamiléké, filante par nature, obtenue en battant longuement l\'écorce de nkui. On la sert traditionnellement après une naissance — chez nous, tous les jours.',
    ingredients: ['Écorce de nkui', 'Couscous de maïs', 'Viande de bœuf', 'Épices de l\'Ouest', 'Légumes verts'],
    allergenes: [],
    preparation: 20,
    piment: 2,
    vegetarien: false,
    populaire: false,
  },
  {
    id: 'nkok',
    nom: 'Nkôk au manioc',
    prix: 1500,
    categorie: 'dejeuner',
    image: 'nkok.jpeg',
    alt: 'Plat de nkôk en sauce accompagné de bâtons de manioc',
    resume: 'Nkôk savoureux avec manioc, saveurs traditionnelles.',
    description: 'Un plat de fête préparé à l\'huile de palme et aux épices du terroir, servi avec du manioc. Sa cuisson lente est ce qui lui donne sa texture.',
    ingredients: ['Nkôk', 'Manioc', 'Huile de palme', 'Piment', 'Épices locales'],
    allergenes: [],
    preparation: 25,
    piment: 2,
    vegetarien: false,
    populaire: false,
  },
  {
    id: 'poulet-braise',
    nom: 'Poulet braisé et plantains',
    prix: 2500,
    categorie: 'dejeuner',
    image: 'poulet.jpeg',
    alt: 'Demi-poulet braisé doré accompagné de plantains frits et de sauce piquante',
    resume: 'Poulet braisé au feu de bois, plantains frits et sauce piment.',
    description: 'Mariné quatre heures au gingembre et à l\'ail, puis braisé au feu de bois. La sauce piment se prépare à part : personne n\'a le même seuil.',
    ingredients: ['Poulet fermier', 'Plantain', 'Gingembre', 'Ail', 'Piment', 'Huile'],
    allergenes: [],
    preparation: 30,
    piment: 2,
    vegetarien: false,
    populaire: true,
  },
  {
    id: 'mbongo-tchobi',
    nom: 'Mbongo Tchobi',
    prix: 2000,
    categorie: 'diner',
    image: 'mbongo-tchobi.jpeg',
    alt: 'Plat de mbongo tchobi à la sauce noire épicée, servi chaud avec du plantain',
    resume: 'Plat exotique riche en épices, servi bien chaud.',
    description: 'Sa couleur noire vient des épices brûlées volontairement — le mbongo — puis pilées. C\'est un plat sawa, et il ne ressemble à rien d\'autre.',
    ingredients: ['Épices mbongo', 'Poisson ou viande', 'Njansang', 'Basilic africain', 'Plantain'],
    allergenes: ['Poisson'],
    preparation: 30,
    piment: 3,
    vegetarien: false,
    populaire: true,
  },
  {
    id: 'taro',
    nom: 'Taro sauce jaune',
    prix: 2000,
    categorie: 'diner',
    image: 'taro.jpeg',
    alt: 'Boules de taro pilé servies avec une sauce jaune à l\'huile de palme',
    resume: 'Taro tendre et sauce jaune, riche en saveurs.',
    description: 'Le taro est pilé jusqu\'à devenir lisse, la sauce jaune tire sa couleur de l\'huile de palme et du njangsa. Un plat des Grassfields, servi le soir.',
    ingredients: ['Taro', 'Huile de palme', 'Njangsa', 'Écorces aromatiques', 'Sel'],
    allergenes: [],
    preparation: 25,
    piment: 1,
    vegetarien: true,
    populaire: false,
  },
  {
    id: 'poisson-braise',
    nom: 'Poisson braisé',
    prix: 2000,
    categorie: 'diner',
    image: 'poisson.jpeg',
    alt: 'Poisson entier braisé sur le gril, garni d\'oignons et de tomates',
    resume: 'Grillé à la perfection, servi avec sa garniture.',
    description: 'Bar ou maquereau selon l\'arrivage du port. Fendu, mariné, braisé entier. Servi avec miondo et sauce tomate crue.',
    ingredients: ['Poisson frais', 'Ail', 'Gingembre', 'Oignon', 'Tomate', 'Citron'],
    allergenes: ['Poisson'],
    preparation: 25,
    piment: 1,
    vegetarien: false,
    populaire: true,
  },
  {
    id: 'plateau-decouverte',
    nom: 'Plateau découverte',
    prix: 4500,
    categorie: 'diner',
    image: 'assortiment.jpeg',
    alt: 'Grand plateau réunissant plusieurs plats camerounais en portions individuelles',
    resume: 'Cinq plats en portions, pour goûter à tout.',
    description: 'Cinq portions : ndolé, poulet braisé, taro, plantains et koki. Conçu pour deux personnes, ou pour une première visite.',
    ingredients: ['Ndolé', 'Poulet braisé', 'Taro', 'Plantain', 'Koki'],
    allergenes: ['Arachides', 'Crustacés'],
    preparation: 35,
    piment: 2,
    vegetarien: false,
    populaire: true,
  },
  {
    id: 'folere',
    nom: 'Folere (bissap)',
    prix: 1000,
    categorie: 'boissons',
    image: 'folere.jpeg',
    alt: 'Bouteille et verre de folere, boisson rouge foncé à base d\'hibiscus',
    resume: 'Boisson rafraîchissante à l\'hibiscus, servie glacée.',
    description: 'Fleurs d\'hibiscus infusées à froid douze heures, menthe et gingembre. Sans conservateur : elle se garde trois jours.',
    ingredients: ['Fleurs d\'hibiscus', 'Gingembre', 'Menthe', 'Sucre de canne'],
    allergenes: [],
    preparation: 2,
    piment: 0,
    vegetarien: true,
    populaire: true,
  },
  {
    id: 'vin-de-palme',
    nom: 'Vin de palme',
    prix: 1000,
    categorie: 'boissons',
    image: 'vin-de-palme.jpeg',
    alt: 'Bouteille de vin de palme blanc laiteux posée sur une table en bois',
    resume: 'Boisson traditionnelle, douce et naturelle.',
    description: 'Récolté le matin même chez un producteur de Bonabéri. Il fermente vite : ce qu\'on boit le soir n\'a plus le goût du matin.',
    ingredients: ['Sève de palmier'],
    allergenes: [],
    preparation: 2,
    piment: 0,
    vegetarien: true,
    populaire: false,
  },
  {
    id: 'jus-gingembre',
    nom: 'Jus de gingembre',
    prix: 1000,
    categorie: 'boissons',
    image: 'boissons.jpeg',
    alt: 'Verres de jus de gingembre et de jus de fruits frais alignés sur un comptoir',
    resume: 'Gingembre frais pressé, citron et un peu de miel.',
    description: 'Pressé le matin, jamais la veille. Piquant — c\'est le but.',
    ingredients: ['Gingembre frais', 'Citron', 'Miel'],
    allergenes: [],
    preparation: 2,
    piment: 1,
    vegetarien: true,
    populaire: false,
  },
];

/**
 * Frais de livraison par quartier de Douala.
 * Ils ne sont pas décoratifs : le panier les ajoute au total, et la commande
 * ne peut pas être validée sans quartier choisi.
 */
const QUARTIERS = [
  { nom: 'Akwa', frais: 500, delai: 25 },
  { nom: 'Bonanjo', frais: 500, delai: 25 },
  { nom: 'Bonapriso', frais: 750, delai: 30 },
  { nom: 'Deido', frais: 750, delai: 30 },
  { nom: 'Bonamoussadi', frais: 1000, delai: 40 },
  { nom: 'Makepe', frais: 1000, delai: 40 },
  { nom: 'Ndokotti', frais: 1000, delai: 40 },
  { nom: 'Logbessou', frais: 1250, delai: 50 },
  { nom: 'Bonabéri', frais: 1500, delai: 55 },
];

/** Seuil au-delà duquel la livraison est offerte. */
const LIVRAISON_OFFERTE = 15000;

/** Horaires d'ouverture, utilisés par la réservation pour refuser une heure fermée. */
const HORAIRES = {
  semaine: { libelle: 'Lundi à vendredi', ouverture: '08:00', fermeture: '22:00' },
  samedi: { libelle: 'Samedi', ouverture: '08:00', fermeture: '23:00' },
  dimanche: { libelle: 'Dimanche', ouverture: '10:00', fermeture: '21:00' },
};

const RESTAURANT = {
  nom: 'Cuisine Locale',
  accroche: 'La cuisine camerounaise, préparée le jour même',
  adresse: 'Rue Joss, Akwa — Douala, Cameroun',
  telephone: '+237 6 59 27 12 81',
  whatsapp: '237659271281',
  email: 'bonjour@cuisinelocale.cm',
  couvertsMax: 12,
};

/* Rendu utilisable côté navigateur comme côté Node (scripts de vérification). */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CATEGORIES, PLATS, QUARTIERS, HORAIRES, RESTAURANT, LIVRAISON_OFFERTE };
}
