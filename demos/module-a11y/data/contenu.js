/* =============================================================================
   contenu.js — Contenu pédagogique du module.
   Volontairement séparé du code : un ingénieur pédagogique doit pouvoir
   relire et corriger ce fichier sans toucher à une ligne de JavaScript.

   Chargé en <script> classique (pas fetch/JSON) pour que le module
   fonctionne aussi en ouverture locale file:// sans serveur.
   ============================================================================= */

window.CONTENU = {
  meta: {
    titre: "Les bases de l'accessibilité numérique",
    sousTitre: "Module d'initiation — 12 minutes",
    duree: 12,
    public: "Toute personne qui produit du contenu numérique : formateurs, graphistes, rédacteurs.",
    prerequis: "Aucun.",
    auteur: "Joyce Djomnang",
    version: "1.0.0"
  },

  /* ---- Objectifs pédagogiques (taxonomie de Bloom, niveaux 1 à 3) ---- */
  objectifs: [
    "Expliquer ce que le contraste de couleur change pour un utilisateur malvoyant.",
    "Rédiger une alternative textuelle utile pour trois types d'images.",
    "Identifier un parcours clavier cassé sur une interface.",
    "Corriger une hiérarchie de titres incohérente."
  ],

  ecrans: [
    /* ---------------------------------------------------------------- 0 */
    {
      id: "accueil",
      type: "intro",
      titre: "Les bases de l'accessibilité numérique",
      illustration: {
        src: "img/ill-accueil.svg",
        alt: "Quatre personnes utilisant chacune un moyen différent d'accéder au même écran : loupe, clavier, lecteur d'écran, sous-titres."
      },
      accroche: "Un contenu inaccessible n'est pas un contenu « moins joli ». C'est un contenu qu'une partie de vos apprenants ne peut tout simplement pas suivre.",
      corps: [
        "En France, 12 millions de personnes vivent avec un handicap. Mais l'accessibilité ne concerne pas qu'elles : elle sert aussi la personne qui suit une formation dans un train bruyant, celle qui a cassé sa souris, celle dont l'écran est en plein soleil.",
        "Ce module couvre les quatre points qui, à eux seuls, règlent la majorité des problèmes rencontrés sur un support pédagogique."
      ],
      duree: "12 min",
      chapitres: ["Le contraste", "Les alternatives textuelles", "La navigation clavier", "La structure des titres"]
    },

    /* ---------------------------------------------------------------- 1 */
    {
      id: "contraste",
      type: "lecon",
      numero: 1,
      titre: "Le contraste",
      objectif: "Expliquer ce que le contraste de couleur change pour un utilisateur malvoyant.",
      illustration: {
        src: "img/ill-contraste.svg",
        alt: "Deux cartes côte à côte : à gauche un texte gris pâle presque illisible sur fond blanc, à droite le même texte en bleu foncé nettement lisible."
      },
      corps: [
        "Le contraste est le rapport de luminosité entre un texte et son fond. Il s'exprime en ratio, de 1:1 (invisible) à 21:1 (noir sur blanc).",
        "La norme WCAG 2.1 exige un ratio d'au moins <strong>4,5:1</strong> pour un texte courant, et <strong>3:1</strong> pour un grand texte (à partir de 24 px, ou 18,5 px en gras) ainsi que pour les éléments d'interface comme les bordures de champs."
      ],
      encadre: {
        type: "attention",
        titre: "L'erreur la plus fréquente",
        texte: "Le gris clair sur blanc. Il paraît « élégant et aéré » sur l'écran calibré du graphiste. Il devient invisible sur un portable bas de gamme, en extérieur, ou pour une personne de plus de 55 ans, dont le cristallin laisse passer environ deux fois moins de lumière qu'à 20 ans."
      },
      interaction: { type: "contraste" },
      aRetenir: "4,5:1 minimum pour un texte normal. Ce n'est pas une question de goût : c'est mesurable, donc vérifiable avant livraison."
    },

    /* ---------------------------------------------------------------- 2 */
    {
      id: "alternatives",
      type: "lecon",
      numero: 2,
      titre: "Les alternatives textuelles",
      objectif: "Rédiger une alternative textuelle utile pour trois types d'images.",
      illustration: {
        src: "img/ill-alternatives.svg",
        alt: "Une image encadrée reliée par une flèche à une bulle de texte, symbolisant l'attribut alt qui décrit l'image."
      },
      corps: [
        "Une alternative textuelle (attribut <code>alt</code>) est le texte qu'un lecteur d'écran lit à la place de l'image. C'est aussi ce qui s'affiche quand l'image ne se charge pas.",
        "La bonne alternative ne décrit pas l'image : elle transmet <strong>la même information, dans le même contexte</strong>. La même photo aura une alternative différente selon la page où elle se trouve."
      ],
      liste: {
        titre: "Trois cas, trois règles",
        items: [
          "<strong>Image porteuse d'information</strong> (schéma, graphique, photo qui illustre un propos) : décrire l'information, pas le visuel. Pour un graphique, donner la tendance et les chiffres clés.",
          "<strong>Image décorative</strong> (motif, séparateur, fond) : alternative vide. Une alternative vide est une décision ; une alternative absente est un oubli, et le lecteur d'écran lira alors le nom du fichier.",
          "<strong>Image cliquable</strong> (icône-bouton, logo-lien) : décrire <em>la destination ou l'action</em>, pas le dessin. Pour une loupe cliquable, écrire « Rechercher », jamais « loupe »."
        ]
      },
      encadre: {
        type: "info",
        titre: "Et les visuels générés par IA ?",
        texte: "Même règle, avec une vigilance en plus : une image générée contient souvent des détails que vous n'avez pas demandés. Regardez-la vraiment avant de la décrire, et ne laissez jamais une IA rédiger l'alternative à votre place sans relecture : elle décrit ce qu'elle voit, pas ce que vous vouliez dire."
      },
      interaction: { type: "alt" },
      aRetenir: "L'alternative transmet la fonction de l'image dans son contexte. Décorative égale alternative vide, jamais alternative absente."
    },

    /* ---------------------------------------------------------------- 3 */
    {
      id: "clavier",
      type: "lecon",
      numero: 3,
      titre: "La navigation au clavier",
      objectif: "Identifier un parcours clavier cassé sur une interface.",
      illustration: {
        src: "img/ill-clavier.svg",
        alt: "Une touche Tab reliée par un trait fléché numéroté à trois éléments d'un formulaire, montrant l'ordre de parcours au clavier."
      },
      corps: [
        "Certaines personnes n'utilisent jamais de souris : troubles moteurs, malvoyance, usage d'un lecteur d'écran, ou simplement habitude. Elles parcourent l'interface avec <kbd>Tab</kbd> et l'activent avec <kbd>Entrée</kbd> ou <kbd>Espace</kbd>.",
        "Trois défauts cassent ce parcours, et on les retrouve dans presque tous les modules e-learning non audités."
      ],
      liste: {
        titre: "Les trois défauts classiques",
        items: [
          "<strong>Le focus invisible.</strong> Quelqu'un a neutralisé le contour de focus parce que « le liseré bleu est moche ». L'utilisateur au clavier navigue désormais à l'aveugle.",
          "<strong>Le piège au clavier.</strong> On entre dans une fenêtre modale, on ne peut plus en sortir ni avec <kbd>Tab</kbd>, ni avec <kbd>Échap</kbd>. C'est le seul défaut d'accessibilité qui bloque totalement un utilisateur.",
          "<strong>L'élément non atteignable.</strong> Une simple boîte transformée en bouton avec un gestionnaire de clic. Cliquable à la souris, inexistante au clavier."
        ]
      },
      encadre: {
        type: "astuce",
        titre: "Le test qui prend 30 secondes",
        texte: "Posez votre souris. Parcourez votre module uniquement avec Tab, Entrée et Échap. Si vous perdez de vue où vous êtes, ou si vous ne pouvez pas atteindre un bouton, vos apprenants au clavier ne le pourront pas non plus. C'est le test le plus rentable de tout l'audit."
      },
      interaction: { type: "clavier" },
      aRetenir: "Focus toujours visible, jamais de piège, tout élément cliquable atteignable avec Tab."
    },

    /* ---------------------------------------------------------------- 4 */
    {
      id: "structure",
      type: "lecon",
      numero: 4,
      titre: "La structure des titres",
      objectif: "Corriger une hiérarchie de titres incohérente.",
      illustration: {
        src: "img/ill-structure.svg",
        alt: "Un plan de document en arborescence : un titre de niveau 1 avec deux titres de niveau 2, dont l'un contient deux titres de niveau 3."
      },
      corps: [
        "Un lecteur d'écran propose de naviguer de titre en titre : c'est le sommaire, et c'est la première chose qu'une personne aveugle consulte pour se repérer dans un support.",
        "Encore faut-il que les titres soient de vrais titres. Du texte agrandi et mis en gras n'est pas un titre : visuellement il y ressemble, structurellement il n'existe pas."
      ],
      liste: {
        titre: "Les règles de la hiérarchie",
        items: [
          "Un seul titre de niveau 1 par page ou par écran : le titre du contenu.",
          "On ne saute jamais un niveau en descendant : après un niveau 2 vient un niveau 3, jamais directement un niveau 4.",
          "Le niveau traduit la <strong>logique</strong>, pas la taille. Si un titre de niveau 3 doit paraître plus gros, c'est le style qu'on change, pas la balise."
        ]
      },
      encadre: {
        type: "info",
        titre: "Ça vaut aussi hors du web",
        texte: "Dans Word, PowerPoint et les PDF exportés, ce sont les styles « Titre 1 » et « Titre 2 » qui produisent la même structure. Un titre mis en forme à la main (gras, 20 points) donne un document dont le sommaire est vide pour un lecteur d'écran. C'est le défaut numéro un des supports de cours en PDF."
      },
      interaction: { type: "structure" },
      aRetenir: "La hiérarchie de titres est le sommaire du document. Un niveau sauté, et le plan devient illisible."
    },

    /* ---------------------------------------------------------------- 5 */
    {
      id: "quiz",
      type: "quiz",
      titre: "Vérifions vos acquis",
      intro: "Cinq questions, une seule bonne réponse par question. Chaque réponse est commentée : lisez le retour même quand vous avez juste.",
      seuilReussite: 4,
      questions: [
        {
          enonce: "Vous devez placer un texte gris #767676 sur un fond blanc. Le ratio mesuré est de 4,54:1. Que pouvez-vous en conclure ?",
          options: [
            "C'est conforme au niveau AA pour un texte courant.",
            "C'est conforme au niveau AAA pour un texte courant.",
            "C'est non conforme, il faut au moins 7:1.",
            "Impossible à dire sans connaître la taille du texte."
          ],
          bonne: 0,
          feedback: {
            juste: "Exact. 4,54 dépasse tout juste le seuil de 4,5:1 exigé au niveau AA pour un texte courant. C'est conforme, mais sans aucune marge : si le fond est légèrement assombri par la suite, vous basculez en non-conformité.",
            faux: "Le seuil AA pour un texte courant est de 4,5:1, et 4,54 le dépasse tout juste : c'est donc conforme AA. Le seuil de 7:1 correspond au niveau AAA, plus exigeant et non obligatoire dans la plupart des cadres réglementaires."
          }
        },
        {
          enonce: "Un trait purement décoratif sépare deux sections de votre module. Quelle alternative textuelle lui donner ?",
          options: [
            "Le texte « ligne de séparation »",
            "Une alternative vide",
            "Aucun attribut d'alternative",
            "Le texte « décoration »"
          ],
          bonne: 1,
          feedback: {
            juste: "Exact. Une alternative vide dit explicitement au lecteur d'écran d'ignorer l'image. C'est une décision, et elle est lisible par la machine.",
            faux: "Il faut une alternative vide. Décrire le trait ajoute du bruit inutile à l'écoute. Et omettre l'attribut est pire encore : beaucoup de lecteurs d'écran annoncent alors le nom du fichier, par exemple « separateur-final-v3-copie.png »."
          }
        },
        {
          enonce: "Vous testez un module au clavier. En arrivant sur une fenêtre modale, Tab continue de circuler dans la page derrière, et Échap ne ferme rien. Comment qualifiez-vous ce défaut ?",
          options: [
            "Un défaut mineur de confort.",
            "Un défaut de contraste.",
            "Une gestion de focus défaillante, qui rend la modale inutilisable au clavier.",
            "Un problème de compatibilité navigateur."
          ],
          bonne: 2,
          feedback: {
            juste: "Exact. Une modale doit capturer le focus à l'ouverture, le maintenir en boucle à l'intérieur, se fermer avec Échap, et rendre le focus à l'élément déclencheur. Ici, l'utilisateur au clavier est perdu dans une page qu'il ne voit plus.",
            faux: "Il s'agit d'une gestion de focus défaillante. Une modale doit capturer le focus à l'ouverture, le maintenir à l'intérieur, se fermer avec Échap et rendre le focus au bouton d'origine. Rien de tout cela n'est fait ici."
          }
        },
        {
          enonce: "Dans un support de cours, l'auteur a écrit ses sous-titres en Arial 18 points gras plutôt qu'avec le style « Titre 2 ». Quelle en est la conséquence ?",
          options: [
            "Aucune, le rendu visuel est identique.",
            "Le document sera plus lourd à l'export.",
            "La police risque de ne pas s'afficher partout.",
            "Le sommaire du document est vide : un lecteur d'écran ne peut plus naviguer de section en section."
          ],
          bonne: 3,
          feedback: {
            juste: "Exact. Visuellement identique, structurellement inexistant. C'est le défaut numéro un des supports de cours exportés en PDF, et il reste invisible tant qu'on ne teste pas avec un lecteur d'écran.",
            faux: "La conséquence est structurelle : sans style de titre, le document n'a pas de plan. Une personne aveugle perd la possibilité de sauter de section en section et doit tout écouter linéairement."
          }
        },
        {
          enonce: "Vous générez une illustration par IA pour un module. Quelle vérification est spécifiquement nécessaire, en plus des contrôles habituels ?",
          options: [
            "Vérifier que l'image est bien en 300 dpi.",
            "Relire l'image en détail avant d'écrire son alternative, car elle contient des éléments non demandés.",
            "Convertir systématiquement l'image en SVG.",
            "Rien de particulier, une image générée se traite comme une autre."
          ],
          bonne: 1,
          feedback: {
            juste: "Exact. Une image générée contient souvent du texte déformé, des détails parasites ou des représentations stéréotypées que vous n'avez pas demandés. L'alternative doit décrire ce qui est réellement affiché, pas ce que vous aviez en tête en écrivant le prompt.",
            faux: "Le point spécifique est la relecture attentive avant rédaction de l'alternative : une image générée contient fréquemment du texte illisible ou des détails involontaires. Décrire son intention plutôt que l'image produite crée un décalage entre ce que voient les uns et ce qu'entendent les autres."
          }
        }
      ]
    },

    /* ---------------------------------------------------------------- 6 */
    {
      id: "bilan",
      type: "bilan",
      titre: "Bilan du module",
      illustration: {
        src: "img/ill-bilan.svg",
        alt: "Une liste de quatre points cochés surmontée d'une coche de validation."
      },
      recap: [
        { titre: "Le contraste", texte: "4,5:1 minimum pour un texte courant, 3:1 pour un grand texte et les éléments d'interface. C'est mesurable, donc vérifiable avant livraison." },
        { titre: "Les alternatives textuelles", texte: "Transmettre la fonction de l'image dans son contexte. Décorative égale alternative vide, jamais alternative absente." },
        { titre: "La navigation clavier", texte: "Focus toujours visible, jamais de piège, tout élément cliquable atteignable avec Tab." },
        { titre: "La structure des titres", texte: "La hiérarchie est le sommaire du document. Un niveau sauté, et le plan devient illisible." }
      ],
      pourAllerPlusLoin: [
        { label: "WCAG 2.1 — Comprendre les critères (W3C, traduction française)", url: "https://www.w3.org/Translations/WCAG21-fr/" },
        { label: "RGAA 4.1 — Référentiel général d'amélioration de l'accessibilité", url: "https://accessibilite.numerique.gouv.fr/" },
        { label: "NVDA — Lecteur d'écran libre et gratuit pour Windows", url: "https://www.nvaccess.org/download/" }
      ]
    }
  ]
};
