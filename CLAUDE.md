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
  "public": ["7-10", "11-15"],
  "duree": "<30min",
  "duree_detail": null,
  "groupe": ["Moyen"],
  "themes": ["IA déconnecté"],
  "contexte": ["Scolaire"],
  "description_courte": "...",
  "description": "...",
  "apprentissage_cle": "..."
}
```

## Valeurs de référence

- **Phases** : Avant, Demander, Produire, Évaluer, Sécuriser, Piloter, Construire, Contribuer
- **Public** : 7-10, 11-15, 16-20, Post-bac, Adultes
- **Durée** : <30min, 30-60min, 1-2h, 2-4h, Projet
- **Groupe** : Petit, Moyen, Grand
- **Contexte** : Scolaire, Études sup., Entreprise
- **IDs créés via formulaire** : format `CUS-001`, `CUS-002`, …

## Commandes

```bash
npm run dev      # Dev server
npm run build    # Build production (doit passer sans erreur)
npm run preview  # Prévisualiser le build
```
