/* =============================================================================
   data.js — Le référentiel de la checklist.

   38 points de contrôle, regroupés par famille. Chacun porte :
     - le critère WCAG 2.1 correspondant
     - une formulation en langage de praticien, pas en langage de norme
     - « comment vérifier » : le geste concret, en moins de 30 secondes
     - « pourquoi » : l'impact réel sur une personne, pas la référence au texte
     - poids : 3 = bloquant, 2 = majeur, 1 = mineur

   Le poids sert au score. Un support qui rate un point bloquant ne peut pas
   afficher 90 % de conformité : ce serait mentir sur ce qui compte.
   ============================================================================= */

window.CHECKLIST = {
  meta: {
    titre: 'Checklist accessibilité — supports pédagogiques',
    version: '1.0.0',
    referentiel: 'WCAG 2.1 niveau AA',
    auteur: 'Joyce Djomnang'
  },

  familles: [
    {
      id: 'structure',
      nom: 'Structure',
      intro: "Ce qui donne un plan au document. Invisible à l'œil, décisif à l'oreille.",
      points: [
        {
          id: 'st1', poids: 3, wcag: '1.3.1',
          label: 'Les titres sont de vrais titres, pas du texte agrandi',
          verifier: "Ouvrez le volet de navigation (Word) ou l'inspecteur (web). Si le plan est vide, aucun style de titre n'a été appliqué.",
          pourquoi: "Le plan est le sommaire du document. Sans lui, une personne aveugle doit écouter tout le support en linéaire pour trouver une information."
        },
        {
          id: 'st2', poids: 2, wcag: '2.4.6',
          label: 'Un seul titre de niveau 1, et aucun niveau sauté',
          verifier: "Listez les titres dans l'ordre. Après un niveau 2 doit venir un niveau 3, jamais directement un 4.",
          pourquoi: "Un niveau sauté produit un plan incohérent. L'auditeur ne sait plus s'il est entré dans une sous-partie ou changé de chapitre."
        },
        {
          id: 'st3', poids: 2, wcag: '1.3.1',
          label: 'Les listes sont de vraies listes',
          verifier: "Une ligne commençant par un tiret ou une puce tapée à la main n'est pas une liste.",
          pourquoi: "Un lecteur d'écran annonce « liste de 5 éléments » : l'auditeur sait d'emblée combien de points il va entendre."
        },
        {
          id: 'st4', poids: 2, wcag: '1.3.1',
          label: 'Les tableaux ont des en-têtes déclarés et une légende',
          verifier: "Les cellules d'en-tête sont-elles des en-têtes, ou du texte en gras ?",
          pourquoi: "Sans en-tête déclaré, l'auditeur entend une suite de valeurs sans savoir à quelle colonne elles appartiennent."
        },
        {
          id: 'st5', poids: 1, wcag: '3.1.1',
          label: 'La langue du document est déclarée',
          verifier: "En HTML : l'attribut lang. Dans Word : Révision → Langue.",
          pourquoi: "Sans déclaration, un lecteur d'écran configuré en anglais prononce le français avec la phonétique anglaise. Le contenu devient incompréhensible."
        },
        {
          id: 'st6', poids: 1, wcag: '2.4.2',
          label: 'Le titre du document est explicite',
          verifier: "« Fiche » ou « Document1 » ne permettent de retrouver la page ni dans un historique ni dans une liste d'onglets.",
          pourquoi: "C'est la première chose annoncée à l'ouverture, et le seul repère dans une liste de favoris."
        }
      ]
    },

    {
      id: 'texte',
      nom: 'Texte',
      intro: "La lisibilité se règle avec trois valeurs. Elles sont presque toujours mal réglées.",
      points: [
        {
          id: 'tx1', poids: 2, wcag: '1.4.4',
          label: 'Aucun texte sous 16 px (12 pt)',
          verifier: "Vérifiez aussi les légendes, les mentions de bas de page et les notes — c'est là que ça descend.",
          pourquoi: "Sous 16 px, la lecture devient pénible pour tout le monde, et impossible pour une personne malvoyante sans zoom."
        },
        {
          id: 'tx2', poids: 2, wcag: '1.4.12',
          label: 'Interlignage d\'au moins 1,5',
          verifier: "C'est le réglage le plus souvent oublié, et celui qui change le plus la lisibilité.",
          pourquoi: "Des lignes trop serrées font sauter une ligne à la lecture, particulièrement en cas de dyslexie."
        },
        {
          id: 'tx3', poids: 1, wcag: '1.4.8',
          label: 'Pas plus de 68 caractères par ligne',
          verifier: "Comptez une ligne pleine de votre bloc de texte le plus large.",
          pourquoi: "Au-delà, l'œil perd la ligne au retour chariot et relit deux fois la même."
        },
        {
          id: 'tx4', poids: 2, wcag: '1.4.5',
          label: 'Aucun texte en image',
          verifier: "Essayez de sélectionner le texte. S'il ne se sélectionne pas, c'est une image.",
          pourquoi: "Un texte en image ne se lit pas au lecteur d'écran, ne se traduit pas, et devient flou dès 150 % de zoom."
        },
        {
          id: 'tx5', poids: 1, wcag: '3.1.5',
          label: 'Les sigles sont développés à leur première occurrence',
          verifier: "RGAA, WCAG, LMS, SCORM : développés une fois, au moins.",
          pourquoi: "Un sigle non développé exclut le débutant, qui est précisément le public d'un module d'initiation."
        }
      ]
    },

    {
      id: 'couleur',
      nom: 'Couleur',
      intro: "Le seul point entièrement mesurable de cette liste. Donc le seul sans excuse.",
      points: [
        {
          id: 'co1', poids: 3, wcag: '1.4.3',
          label: 'Contraste du texte courant à 4,5:1 minimum',
          verifier: "Mesurez, ne jugez pas à l'œil. Un écran calibré ment sur cette question.",
          pourquoi: "Le gris clair sur blanc paraît élégant à son auteur et devient invisible sur un portable en extérieur, ou après 55 ans."
        },
        {
          id: 'co2', poids: 2, wcag: '1.4.3',
          label: 'Contraste du grand texte à 3:1 minimum',
          verifier: "Grand texte = 24 px, ou 18,5 px en gras.",
          pourquoi: "Un titre pâle est le défaut le plus fréquent des modèles de présentation."
        },
        {
          id: 'co3', poids: 2, wcag: '1.4.11',
          label: 'Contraste des éléments d\'interface à 3:1 minimum',
          verifier: "Bordures de champs, icônes porteuses de sens, barres de progression, anneau de focus.",
          pourquoi: "Un champ de formulaire dont on ne distingue pas la bordure ne se voit pas comme un champ."
        },
        {
          id: 'co4', poids: 3, wcag: '1.4.1',
          label: 'Aucune information portée par la seule couleur',
          verifier: "Passez le support en niveaux de gris. Tout se comprend-il encore ?",
          pourquoi: "Environ 8 % des hommes ont une déficience de la vision des couleurs. Et un lecteur d'écran ne restitue aucune couleur."
        },
        {
          id: 'co5', poids: 1, wcag: '1.4.3',
          label: 'Le texte posé sur une image reste lisible',
          verifier: "Mesurez contre la zone effectivement située sous le texte, pas contre la moyenne de l'image.",
          pourquoi: "Un titre blanc sur une photo claire disparaît, et c'est souvent le titre principal."
        }
      ]
    },

    {
      id: 'images',
      nom: 'Images et médias',
      intro: "La règle tient en une question : cette image dit-elle quelque chose ?",
      points: [
        {
          id: 'im1', poids: 3, wcag: '1.1.1',
          label: 'Chaque image porteuse de sens a une alternative rédigée',
          verifier: "Masquez l'image. La phrase qui la remplace transmet-elle la même information ?",
          pourquoi: "Sans alternative, l'information de l'image n'existe pas pour une personne aveugle."
        },
        {
          id: 'im2', poids: 2, wcag: '1.1.1',
          label: 'Chaque image décorative a une alternative vide',
          verifier: "Une alternative vide est une décision. Une alternative absente est un oubli.",
          pourquoi: "Sans attribut, beaucoup de lecteurs d'écran annoncent le nom du fichier : « separateur-final-v3-copie.png »."
        },
        {
          id: 'im3', poids: 2, wcag: '1.1.1',
          label: 'Les images cliquables décrivent l\'action, pas le dessin',
          verifier: "Une loupe cliquable : « Rechercher », jamais « loupe ».",
          pourquoi: "L'utilisateur veut savoir ce que fait le contrôle, pas à quoi il ressemble."
        },
        {
          id: 'im4', poids: 2, wcag: '1.1.1',
          label: 'Les graphiques donnent leurs chiffres clés',
          verifier: "L'alternative d'un graphique restitue la tendance et les valeurs, pas l'apparence.",
          pourquoi: "« Graphique en barres bleues » laisse l'information entièrement inaccessible."
        },
        {
          id: 'im5', poids: 3, wcag: '1.2.2',
          label: 'Les vidéos sont sous-titrées',
          verifier: "Sous-titres rédigés et relus. Les sous-titres automatiques ne suffisent pas.",
          pourquoi: "Une vidéo non sous-titrée exclut les personnes sourdes — et toutes celles qui regardent sans le son."
        },
        {
          id: 'im6', poids: 2, wcag: '1.2.1',
          label: 'Les contenus audio ont une transcription',
          verifier: "Un texte reprenant l'intégralité de ce qui est dit.",
          pourquoi: "La transcription sert aussi à la recherche, à la traduction et à la révision rapide."
        },
        {
          id: 'im7', poids: 2, wcag: '—',
          label: 'Les visuels générés par IA ont leur fiche de traçabilité',
          verifier: "Prompt, outil, seed, retouches, droits vérifiés, alternative rédigée à la main.",
          pourquoi: "Sans fiche, le visuel est irreproductible. « La même chose en vert » devient un chantier."
        },
        {
          id: 'im8', poids: 2, wcag: '1.1.1',
          label: 'Les visuels IA ont été relus avant description',
          verifier: "Texte parasite ? Mains ou visages déformés ? Stéréotypes ? Détails non demandés ?",
          pourquoi: "L'alternative doit décrire l'image obtenue, pas l'intention du prompt. Entre les deux, il y a toujours un écart."
        }
      ]
    },

    {
      id: 'interaction',
      nom: 'Interaction',
      intro: "Le test le plus rentable de toute la liste : posez votre souris.",
      points: [
        {
          id: 'in1', poids: 3, wcag: '2.1.1',
          label: 'Tout est atteignable au clavier',
          verifier: "Souris débranchée. Parcourez le support entier avec Tab, Entrée et Échap.",
          pourquoi: "Un contrôle inatteignable au clavier n'existe pas pour une partie des utilisateurs."
        },
        {
          id: 'in2', poids: 3, wcag: '2.4.7',
          label: 'Le focus est visible en permanence',
          verifier: "Tabulez. Voyez-vous toujours où vous êtes ?",
          pourquoi: "Sans indicateur de focus, la navigation au clavier se fait à l'aveugle."
        },
        {
          id: 'in3', poids: 3, wcag: '2.1.2',
          label: 'Aucun piège au clavier',
          verifier: "Entrez dans chaque fenêtre modale et essayez d'en sortir avec Tab, puis Échap.",
          pourquoi: "C'est le seul défaut d'accessibilité qui bloque totalement un utilisateur, sans échappatoire."
        },
        {
          id: 'in4', poids: 2, wcag: '2.4.3',
          label: 'L\'ordre de tabulation suit l\'ordre visuel',
          verifier: "Sous Genially : le panneau Calques. À revérifier après chaque modification.",
          pourquoi: "Un ordre incohérent fait sauter d'un bout à l'autre de l'écran sans logique."
        },
        {
          id: 'in5', poids: 2, wcag: '2.5.8',
          label: 'Les cibles cliquables font au moins 44 × 44 px',
          verifier: "Le seuil AA est de 24 px. 44 px est la valeur confortable sur mobile.",
          pourquoi: "Un support pédagogique se consulte massivement sur téléphone, souvent d'une seule main."
        },
        {
          id: 'in6', poids: 2, wcag: '2.4.4',
          label: 'Les intitulés de liens sont explicites hors contexte',
          verifier: "Listez les liens du support. « Ici » et « en savoir plus » sont-ils présents ?",
          pourquoi: "Un lecteur d'écran permet de lister les liens. Une liste de « ici » n'apprend rien."
        },
        {
          id: 'in7', poids: 3, wcag: '2.2.1',
          label: 'Aucun délai imposé',
          verifier: "Compte à rebours, avancement automatique, fermeture de session : tous doivent pouvoir être désactivés ou allongés.",
          pourquoi: "Une personne utilisant un lecteur d'écran met deux à trois fois plus de temps sur le même contenu."
        }
      ]
    },

    {
      id: 'formulaires',
      nom: 'Formulaires',
      intro: "Quatre points. Ils règlent l'essentiel des abandons.",
      points: [
        {
          id: 'fo1', poids: 3, wcag: '3.3.2',
          label: 'Chaque champ a une étiquette liée',
          verifier: "Cliquez sur le libellé : le curseur doit se placer dans le champ.",
          pourquoi: "Sans liaison, le lecteur d'écran annonce « zone d'édition » sans dire laquelle."
        },
        {
          id: 'fo2', poids: 2, wcag: '3.3.2',
          label: 'Le format attendu est indiqué avant la saisie',
          verifier: "Format de date, longueur, valeurs acceptées — indiqués avant, pas après l'erreur.",
          pourquoi: "Prévenir l'erreur coûte moins cher que la corriger, pour l'utilisateur comme pour le support."
        },
        {
          id: 'fo3', poids: 3, wcag: '3.3.1',
          label: 'Les erreurs sont explicites et annoncées',
          verifier: "Le message dit-il quel champ, et quoi corriger ? Est-il annoncé au lecteur d'écran ?",
          pourquoi: "« Formulaire invalide » oblige l'utilisateur à chercher lui-même l'erreur."
        },
        {
          id: 'fo4', poids: 1, wcag: '1.3.5',
          label: 'La finalité des champs personnels est déclarée',
          verifier: "L'attribut autocomplete sur nom, adresse électronique, téléphone.",
          pourquoi: "Permet le remplissage automatique, essentiel en cas de trouble moteur ou cognitif."
        }
      ]
    },

    {
      id: 'mouvement',
      nom: 'Mouvement',
      intro: "Deux points. Ils sont courts, et ils sont non négociables.",
      points: [
        {
          id: 'mo1', poids: 3, wcag: '2.3.1',
          label: 'Aucun clignotement de plus de 3 fois par seconde',
          verifier: "Aucune exception. Aucune.",
          pourquoi: "Un clignotement rapide peut déclencher une crise d'épilepsie photosensible."
        },
        {
          id: 'mo2', poids: 2, wcag: '2.2.2',
          label: 'Tout mouvement automatique peut être arrêté',
          verifier: "Carrousels, textes défilants, animations en boucle, lecture automatique.",
          pourquoi: "Un mouvement permanent capte l'attention et peut déclencher des nausées."
        },
        {
          id: 'mo3', poids: 1, wcag: '—',
          label: 'La préférence système de mouvement réduit est respectée',
          verifier: "prefers-reduced-motion doit neutraliser les transitions.",
          pourquoi: "Certaines personnes ont réglé cette préférence pour une raison médicale."
        }
      ]
    }
  ]
};
