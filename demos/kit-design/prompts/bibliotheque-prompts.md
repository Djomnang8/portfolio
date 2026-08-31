# Bibliothèque de prompts — visuels pédagogiques

12 prompts cadrés, groupés par usage, tous construits sur le même **bloc de
style**. L'objectif de cette bibliothèque n'est pas de produire de belles images :
c'est qu'un module de 20 visuels ressemble à **un module**, pas à 20 images.

> Le format d'une fiche, les paramètres à consigner et le protocole de relecture
> sont dans [`charte-visuelle.md`](charte-visuelle.md).
> Les règles de licence et de traçabilité sont dans [`../charte-ia.md`](../charte-ia.md).

---

## Le bloc de style

**À copier tel quel dans chaque prompt. Ne jamais le paraphraser** — c'est la
reformulation qui fait dériver une série.

```
flat vector illustration, editorial style, limited palette of deep navy #16213E,
clear blue #1D4ED8 and warm ochre #B03A0B on off-white #F1F5FB background,
2px uniform outlines, no gradients, no drop shadows, generous negative space,
geometric shapes, calm and instructional tone, no text anywhere in the image
```

**Le prompt négatif, lui aussi constant :**

```
photorealistic, 3d render, text, letters, numbers, watermark, signature,
gradient, blur, neon, cluttered composition, faces, hands
```

`faces, hands` est là par défaut et se retire au cas par cas : ce sont les deux
zones où les artefacts sont les plus fréquents et les plus visibles. Sur un
support de formation, une main à six doigts ruine la crédibilité de tout le
module.

---

## Pourquoi chaque contrainte du bloc

| Contrainte | Ce qu'elle empêche |
| --- | --- |
| Palette nommée en hexadécimal | La dérive chromatique sur une série longue |
| `no gradients, no drop shadows` | Un contraste imprévisible, donc invérifiable |
| `no text anywhere in the image` | Du texte déformé, et une non-conformité au critère WCAG 1.4.5 |
| `generous negative space` | L'impossibilité de superposer un vrai titre HTML |
| `2px uniform outlines` | La rupture visuelle avec les schémas produits en SVG |
| `flat vector, geometric shapes` | Le style « banque d'images » générique |

---

## A · Ouvertures de module

### A-01 — Couverture générique

```
A single open laptop seen from a three-quarter angle, its screen showing simple
abstract interface blocks. Wide horizontal framing, large empty area on the left
third for a title overlay.
+ BLOC DE STYLE
```
**Usage :** vignette de partage, en-tête de module · **Format :** 1200 × 630

---

### A-02 — Ouverture « parcours »

```
Three simple geometric milestones arranged along a gently curving path that goes
from bottom-left to top-right. Each milestone is a different simple shape. Wide
horizontal framing, empty sky area at the top for a title.
+ BLOC DE STYLE
```
**Usage :** ouverture d'un parcours multi-modules · **Format :** 1600 × 600

---

### A-03 — Ouverture « atelier »

```
A round table seen from directly above, with four simple notebooks and a few
geometric tokens arranged on it. Perfectly centered, symmetrical, generous margin
all around.
+ BLOC DE STYLE (retirer "faces, hands" du prompt négatif n'est pas nécessaire ici)
```
**Usage :** module collaboratif, formation en présentiel · **Format :** 1200 × 1200

---

## B · Concepts pédagogiques

### B-01 — Progression

```
Four vertical bars of increasing height arranged left to right, the tallest one
highlighted in a warmer tone. Clean baseline underneath. Centered composition.
+ BLOC DE STYLE
```
**Usage :** évaluation, montée en compétence
**Attention :** si les hauteurs doivent représenter des données réelles, **ne pas
générer** — passer en SVG. Une IA ne place pas une barre à 58 % précis.

---

### B-02 — Choix / bifurcation

```
A single path that splits into two diverging paths, one marked at its end with a
simple circle, the other with a simple square. Seen from above, wide framing.
+ BLOC DE STYLE
```
**Usage :** étude de cas, scénario à embranchement

---

### B-03 — Assemblage

```
Five geometric puzzle-like shapes floating slightly apart, arranged so that they
would clearly fit together. Soft even spacing, centered composition.
+ BLOC DE STYLE
```
**Usage :** synthèse, mise en relation de notions

---

### B-04 — Filtre / tri

```
A funnel shape seen from the side. Above it, eight small shapes of mixed types
falling in. Below it, only three identical shapes coming out.
+ BLOC DE STYLE
```
**Usage :** méthode de sélection, critères, curation

---

### B-05 — Boucle d'amélioration

```
Four arrows arranged in a continuous circular loop, each arrow a slightly
different length, one of them highlighted in a warmer tone. Centered, generous
margin.
+ BLOC DE STYLE
```
**Usage :** démarche itérative, cycle qualité

---

## C · Accessibilité et inclusion

### C-01 — Canaux multiples

```
One central rectangle representing a screen, with four small symbols orbiting
around it at equal distance: a magnifying glass, a keyboard key, a sound wave,
a caption box. Perfectly symmetrical radial composition.
+ BLOC DE STYLE
```
**Usage :** introduction à l'accessibilité
**Note :** appliqué dans le module e-learning, en version SVG codée.

---

### C-02 — Obstacle levé

```
A staircase on the left and a smooth ramp on the right, both leading to the same
raised platform. Side view, wide framing, equal visual weight given to both.
+ BLOC DE STYLE
```
**Usage :** conception universelle
**Attention :** ne jamais dévaloriser visuellement l'un des deux chemins. La rampe
n'est pas un rattrapage, c'est un accès. Si la génération produit une rampe étroite
ou en retrait, régénérer.

---

## D · Bandeaux et fonds

### D-01 — Bandeau neutre

```
A loose horizontal arrangement of simple geometric shapes of varied sizes,
scattered with generous spacing across a very wide banner. Very low visual
density, most of the surface left empty.
+ BLOC DE STYLE
```
**Usage :** fond d'en-tête de section
**Règle :** densité faible obligatoire — un titre viendra par-dessus.

---

### D-02 — Motif de séparation

```
A single continuous wavy line crossing the full width of a very wide, very short
canvas. Nothing else in the image.
+ BLOC DE STYLE
```
**Usage :** séparateur de section · **Format :** 1600 × 200
**Alternative textuelle :** vide. C'est un motif décoratif.

---

## Fiche à remplir pour chaque visuel produit

À recopier dans le dossier du projet, une fiche par image générée.

```markdown
### V-__ — [nom du visuel]

| Champ | Valeur |
| --- | --- |
| Prompt de référence | [ex : B-02] |
| Prompt complet | [collé intégralement, bloc de style compris] |
| Prompt négatif | [collé intégralement] |
| Outil et version | |
| Seed | |
| Date de génération | |
| Nombre de variantes | |
| Retouches appliquées | [recalage colorimétrique / suppression de texte / recadrage] |
| Alternative textuelle | [rédigée à la main, en regardant l'image finale] |
| Usage | [écran, format, dimensions] |
| Droits vérifiés le | |
```

---

## Statut de cette bibliothèque

Les 12 prompts sont **écrits, cadrés et prêts à exécuter**. Les colonnes *Outil*,
*Seed* et *Date* des fiches ne peuvent être renseignées qu'au moment de la
génération réelle, sur un compte disposant des droits commerciaux adaptés.

C'est volontaire. Un fichier de prompts affichant un seed inventé est pire qu'un
fichier incomplet : il donne l'illusion de la reproductibilité, et la promesse
s'effondre au premier « peux-tu me refaire la même en vert ? ».
