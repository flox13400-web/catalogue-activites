# Interacthèque — catalogue d'activités pédagogiques

## Description du projet

Application React + Vite : catalogue d'activités pédagogiques, sans dépendances externes (vanilla React uniquement). Démarre vide — l'utilisateur charge ou crée ses propres activités.

## Architecture

```text
src/
├── data/
│   └── ia_deconnecte.json       # catalogue "IA déconnecté" (chargeable via l'interface)
├── components/
│   ├── Header.jsx               # Bandeau titre + stats + boutons
│   ├── ActivityCard.jsx         # Carte d'activité
│   ├── FilterPanel.jsx          # Panneau filtres + recherche
│   ├── CartPanel.jsx            # Panier de séance + export
│   ├── DetailModal.jsx          # Modale de détail d'une activité
│   ├── AddActivityModal.jsx     # ChoixImportModal + ImportFichierModal + ActivityFormModal + parsers
│   ├── CorbeillModal.jsx        # Corbeille (suppressions/modifications)
│   └── PrintView.jsx            # Vue impression (@media print)
├── utils/
│   ├── filters.js               # FILTRES_INIT, applyFilters()
│   ├── export.js                # exportJSON(), exportMarkdown(), exportCSV()
│   └── storage.js               # KEYS (localStorage), loadJSON(), saveJSON()
├── styles/
│   ├── global.css               # :root, reset, layout, header, boutons, footer, responsive
│   ├── card.css                 # cartes, grille, @media print
│   ├── modal.css                # modales détail/form/import/corbeille, formulaires
│   ├── filters.css              # panneau filtres, search, chips, thèmes
│   └── cart.css                 # panier, drag & drop, export
├── catalogue.jsx                # Orchestrateur — état global
├── App.jsx                      # Entrée simple (importe Catalogue)
└── main.jsx                     # Point d'entrée Vite
```

## Règles absolues du projet

- **Zéro style inline** (`style={{...}}`) dans les JSX
- **Zéro CSS en template literal** dans les fichiers JS/JSX
- **Zéro dépendance externe** — vanilla React uniquement

## Format du panier (panierOrdre)

`panierOrdre` est un tableau mixte d'items :

```js
[
  { type: "activite", id: "A01" },
  { type: "texte", id: "TEXT-1234567890", contenu: "Introduction…" },
  { type: "activite", id: "A02" },
]
```

## Clés localStorage

| Clé | Contenu |
| --- | --- |
| `catalogue_activites` | Tableau de toutes les activités |
| `catalogue_panier_ordre` | Tableau ordonné des items du panier |
| `catalogue_corbeille` | Historique des suppressions/modifications |

## Structure d'une activité

```json
{
  "id": "A01",
  "titre": "...",
  "phase": "Avant",
  "age_public": ["Collège", "Lycée"],
  "duree": "30-45min",
  "taille_groupe": ["7-12"],
  "themes": ["IA déconnecté"],
  "materiels": ["Cartes", "Tableau"],
  "contexte": ["Scolaire"],
  "modalite": ["Présentielle"],
  "description": "...",
  "apprentissage_cle": "...",
  "problematique": null,
  "remediation": null
}
```

## Valeurs de référence

- **Âge du public** : Primaire, Collège, Lycée, Post-bac, Adultes
- **Durée** : 0-15min, 15-30min, 30-45min, 45-60min, >60min
- **Taille de groupe** : 1, 2-6, 7-12, >12
- **Contexte** : Scolaire, Entreprise, Montée en compétence, Diplomant
- **Modalité** : Présentielle, Distanciel, Synchrone, Asynchrone
- **Thèmes** : mots-clés libres (liste déroulante alimentée par le catalogue)
- **Matériels** : mots-clés libres (liste déroulante alimentée par le catalogue)
- **IDs créés via formulaire** : format `CUS-001`, `CUS-002`, …
- **Champs obligatoires** (formulaire) : titre, durée uniquement

## Filtres — logique de combinaison

- **Au sein d'une même catégorie** : OR — sélectionner Collège + Lycée affiche les activités pour l'un OU l'autre
- **Entre catégories** : AND — l'activité doit satisfaire tous les filtres actifs simultanément

## Commandes

```bash
npm run dev      # Dev server
npm run build    # Build production (doit passer sans erreur)
npm run preview  # Prévisualiser le build
npm test         # Lance les 82 tests unitaires (toujours avant git push)
```

## Règles de collaboration

### Communication

- L'utilisateur n'est pas développeur. Chaque action doit être accompagnée d'une explication courte en français : **ce qu'on fait**, **pourquoi**, et **comment on pourrait le refaire manuellement** si besoin. Pas de long monologue — une à deux phrases suffisent.
- Éviter le jargon technique sans explication. Si un terme technique est inévitable, le définir brièvement entre parenthèses juste après.

### Avant chaque `git push`

- Toujours exécuter `npm test` avant de pousser.
- Afficher le résultat sous la forme "X/X tests passés".
- Si un ou plusieurs tests échouent : **ne pas pousser**, expliquer le problème simplement et le corriger d'abord.

### Économie de ressources

- Toujours préférer l'approche la plus simple quand elle ne comporte aucun risque pour les fonctionnalités existantes.
- Pas de refactoring, d'abstraction ou de complexité supplémentaire non demandés.
- Si deux solutions donnent le même résultat, choisir la plus courte et la plus lisible.
