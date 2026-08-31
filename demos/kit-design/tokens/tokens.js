/* GÉNÉRÉ par outils/build-css.js — NE PAS ÉDITER. Source : tokens/tokens.json */
window.TOKENS = {
  "$name": "Kit Design Pédagogique — Design Tokens",
  "$version": "1.0.0",
  "$description": "Jeu de tokens conçu pour des supports pédagogiques. Toute paire texte/fond listée dans `pairs` est vérifiée automatiquement par outils/check-contrast.js contre WCAG 2.1 (AA = 4.5:1 texte normal, 3:1 texte large et composants d'interface).",
  "color": {
    "light": {
      "ink": {
        "value": "#16213E",
        "role": "Texte principal"
      },
      "ink-soft": {
        "value": "#4A5673",
        "role": "Texte secondaire, légendes"
      },
      "surface": {
        "value": "#FFFFFF",
        "role": "Fond principal"
      },
      "surface-alt": {
        "value": "#F1F5FB",
        "role": "Fond de section, encadré"
      },
      "surface-sunk": {
        "value": "#E3EAF6",
        "role": "Fond de champ, piste de progression"
      },
      "border": {
        "value": "#78859F",
        "role": "Bordure porteuse de sens (champ, carte cliquable) — doit atteindre 3:1"
      },
      "border-soft": {
        "value": "#C3CEE3",
        "role": "Séparateur purement décoratif — exempté de 1.4.11"
      },
      "primary": {
        "value": "#1D4ED8",
        "role": "Action principale, liens"
      },
      "primary-dark": {
        "value": "#1B3FA8",
        "role": "Survol / actif de l'action principale"
      },
      "on-primary": {
        "value": "#FFFFFF",
        "role": "Texte sur fond primaire"
      },
      "accent": {
        "value": "#B03A0B",
        "role": "Mise en avant, badge pédagogique"
      },
      "accent-soft": {
        "value": "#FDEEE6",
        "role": "Fond d'encadré accent"
      },
      "success": {
        "value": "#146C39",
        "role": "Bonne réponse, conformité"
      },
      "success-soft": {
        "value": "#E4F5EA",
        "role": "Fond de feedback positif"
      },
      "danger": {
        "value": "#A81E1E",
        "role": "Erreur, non-conformité"
      },
      "danger-soft": {
        "value": "#FCEAEA",
        "role": "Fond de feedback négatif"
      },
      "focus": {
        "value": "#B45309",
        "role": "Anneau de focus clavier"
      }
    },
    "dark": {
      "ink": {
        "value": "#EAF0FA",
        "role": "Texte principal"
      },
      "ink-soft": {
        "value": "#AEBBD4",
        "role": "Texte secondaire, légendes"
      },
      "surface": {
        "value": "#111827",
        "role": "Fond principal"
      },
      "surface-alt": {
        "value": "#1B2436",
        "role": "Fond de section, encadré"
      },
      "surface-sunk": {
        "value": "#243044",
        "role": "Fond de champ, piste de progression"
      },
      "border": {
        "value": "#68779A",
        "role": "Bordure porteuse de sens (champ, carte cliquable) — doit atteindre 3:1"
      },
      "border-soft": {
        "value": "#2E3A50",
        "role": "Séparateur purement décoratif — exempté de 1.4.11"
      },
      "primary": {
        "value": "#8FB4FF",
        "role": "Action principale, liens"
      },
      "primary-dark": {
        "value": "#B3CCFF",
        "role": "Survol / actif de l'action principale"
      },
      "on-primary": {
        "value": "#0B1220",
        "role": "Texte sur fond primaire"
      },
      "accent": {
        "value": "#FFAD7A",
        "role": "Mise en avant, badge pédagogique"
      },
      "accent-soft": {
        "value": "#3A2418",
        "role": "Fond d'encadré accent"
      },
      "success": {
        "value": "#7BD9A2",
        "role": "Bonne réponse, conformité"
      },
      "success-soft": {
        "value": "#12301F",
        "role": "Fond de feedback positif"
      },
      "danger": {
        "value": "#FF9A9A",
        "role": "Erreur, non-conformité"
      },
      "danger-soft": {
        "value": "#3A1A1A",
        "role": "Fond de feedback négatif"
      },
      "focus": {
        "value": "#FFC46B",
        "role": "Anneau de focus clavier"
      }
    }
  },
  "pairs": [
    {
      "fg": "ink",
      "bg": "surface",
      "usage": "Corps de texte",
      "min": 4.5
    },
    {
      "fg": "ink",
      "bg": "surface-alt",
      "usage": "Texte en encadré",
      "min": 4.5
    },
    {
      "fg": "ink",
      "bg": "surface-sunk",
      "usage": "Texte en champ de formulaire",
      "min": 4.5
    },
    {
      "fg": "ink-soft",
      "bg": "surface",
      "usage": "Légende, texte secondaire",
      "min": 4.5
    },
    {
      "fg": "ink-soft",
      "bg": "surface-alt",
      "usage": "Légende en encadré",
      "min": 4.5
    },
    {
      "fg": "primary",
      "bg": "surface",
      "usage": "Lien dans le texte",
      "min": 4.5
    },
    {
      "fg": "primary",
      "bg": "surface-alt",
      "usage": "Lien en encadré",
      "min": 4.5
    },
    {
      "fg": "on-primary",
      "bg": "primary",
      "usage": "Libellé de bouton principal",
      "min": 4.5
    },
    {
      "fg": "on-primary",
      "bg": "primary-dark",
      "usage": "Bouton principal au survol",
      "min": 4.5
    },
    {
      "fg": "accent",
      "bg": "surface",
      "usage": "Titre de mise en avant",
      "min": 4.5
    },
    {
      "fg": "accent",
      "bg": "accent-soft",
      "usage": "Texte en encadré accent",
      "min": 4.5
    },
    {
      "fg": "success",
      "bg": "surface",
      "usage": "Message de réussite",
      "min": 4.5
    },
    {
      "fg": "success",
      "bg": "success-soft",
      "usage": "Feedback bonne réponse",
      "min": 4.5
    },
    {
      "fg": "danger",
      "bg": "surface",
      "usage": "Message d'erreur",
      "min": 4.5
    },
    {
      "fg": "danger",
      "bg": "danger-soft",
      "usage": "Feedback mauvaise réponse",
      "min": 4.5
    },
    {
      "fg": "border",
      "bg": "surface",
      "usage": "Bordure de composant (non-texte)",
      "min": 3
    },
    {
      "fg": "border",
      "bg": "surface-alt",
      "usage": "Bordure de composant sur encadré",
      "min": 3
    },
    {
      "fg": "focus",
      "bg": "surface",
      "usage": "Anneau de focus (non-texte)",
      "min": 3
    },
    {
      "fg": "focus",
      "bg": "surface-alt",
      "usage": "Anneau de focus sur encadré",
      "min": 3
    },
    {
      "fg": "primary",
      "bg": "surface-sunk",
      "usage": "Barre de progression remplie",
      "min": 3
    }
  ],
  "typography": {
    "font-body": {
      "value": "'Atkinson Hyperlegible', 'Segoe UI', system-ui, -apple-system, sans-serif",
      "role": "Texte courant — Atkinson Hyperlegible est dessinée pour la basse vision"
    },
    "font-title": {
      "value": "'Atkinson Hyperlegible', 'Segoe UI', system-ui, sans-serif",
      "role": "Titres"
    },
    "font-mono": {
      "value": "'Cascadia Mono', 'SFMono-Regular', Consolas, monospace",
      "role": "Code, valeurs techniques"
    },
    "size-min": {
      "value": "1rem",
      "role": "Taille minimale absolue — jamais de texte sous 16px"
    },
    "scale": {
      "xs": "0.875rem",
      "sm": "1rem",
      "md": "1.125rem",
      "lg": "1.375rem",
      "xl": "1.75rem",
      "2xl": "2.25rem",
      "3xl": "2.875rem"
    },
    "line-height": {
      "body": "1.6",
      "title": "1.2",
      "min-wcag": "1.5"
    },
    "measure": {
      "value": "68ch",
      "role": "Largeur de ligne max — au-delà, l'œil perd la ligne"
    },
    "letter-spacing": {
      "body": "0.01em",
      "title": "-0.01em"
    },
    "word-spacing": {
      "value": "0.16em",
      "role": "Applicable via la classe .u-lisible (critère WCAG 1.4.12)"
    }
  },
  "space": {
    "3xs": "0.25rem",
    "2xs": "0.5rem",
    "xs": "0.75rem",
    "sm": "1rem",
    "md": "1.5rem",
    "lg": "2rem",
    "xl": "3rem",
    "2xl": "4.5rem"
  },
  "radius": {
    "sm": "6px",
    "md": "12px",
    "lg": "20px",
    "pill": "999px"
  },
  "target": {
    "min": {
      "value": "44px",
      "role": "Taille minimale de cible tactile (WCAG 2.5.5 AAA / 2.5.8 AA à 24px — on vise 44px)"
    }
  },
  "motion": {
    "fast": "140ms",
    "base": "240ms",
    "slow": "420ms",
    "ease": "cubic-bezier(.2,.7,.3,1)",
    "$note": "Toute transition doit être neutralisée sous @media (prefers-reduced-motion: reduce)."
  }
};
