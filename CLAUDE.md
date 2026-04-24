# Catalogue d'activités pédagogiques — IA générative

## Description du projet

Application React + Vite : catalogue de 105 activités pédagogiques sur l'IA générative, sans dépendances externes (vanilla React uniquement).

## Architecture (état actuel)

```text
src/
├── data/
│   └── activites.json           # 105 activités (ex ACTIVITES_NATIVES inline)
├── components/
│   ├── Header.jsx               # Bandeau titre + stats + boutons
│   ├── ActivityCard.jsx         # ActivityCard + PhaseSection + MetaItem
│   ├── FilterPanel.jsx          # FiltersPanel + ThemeFilterGroup + FilterGroup
│   ├── CartPanel.jsx            # Panier de séance + export
│   ├── DetailModal.jsx          # Modale de détail d'une activité
│   ├── AddActivityModal.jsx     # ChoixImportModal + ImportFichierModal + ActivityFormModal + parsers + genererIdCustom
│   └── PrintView.jsx            # Vue impression (@media print)
├── utils/
│   ├── filters.js               # PHASE_ORDER, PHASE_DESCRIPTIONS, FILTRES_INIT, applyFilters()
│   ├── export.js                # exportJSON(), exportMarkdown(), exportCSV()
│   └── storage.js               # KEYS (localStorage), loadJSON(), saveJSON()
├── styles/
│   ├── global.css               # :root, reset, layout, header, boutons génériques, footer, responsive
│   ├── card.css                 # cartes, phases, grille, badges, @media print complet
│   ├── modal.css                # modales détail/form/import, formulaires
│   ├── filters.css              # panneau filtres, search, chips, thèmes
│   └── cart.css                 # panier, ordre, export
├── catalogue.jsx                # Orchestrateur (~196 lignes) — import de tout, état global
├── App.jsx                      # Entrée simple (importe Catalogue)
└── main.jsx                     # Point d'entrée Vite
```

## Règles absolues du projet

- **Zéro style inline** (`style={{...}}`) dans les JSX
- **Zéro CSS en template literal** dans les fichiers JS/JSX
- **Zéro dépendance externe** — vanilla React uniquement
- Comportement identique à l'original après toute modification

## Format du panier (panierOrdre)

`panierOrdre` est un tableau mixte d'items :

```js
[
  { type: "activite", id: "A01" },
  { type: "texte", id: "TEXT-1234567890", contenu: "Introduction…" },
  { type: "activite", id: "A02" },
]
```

Migration automatique depuis l'ancien format `string[]` au chargement. Le `Set` `panier` ne contient que des IDs d'activités (pour lookup O(1)).

## Clés localStorage

| Clé | Contenu |
|-----|---------|
| `catalogue_activites_natives` | Tableau des 105 activités natives (modifiables) |
| `catalogue_custom_activites` | Activités ajoutées par l'utilisateur |
| `catalogue_panier_ordre` | Tableau ordonné des IDs dans le panier |

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
  "preparation": "Légère",
  "themes": ["IA déconnecté"],
  "contexte": ["Scolaire"],
  "description_courte": "...",
  "description": "...",
  "apprentissage_cle": "...",
  "_custom": true,      // présent si activité créée par l'utilisateur
  "_modifiee": true     // présent si activité native modifiée
}
```

## Valeurs de référence

- **Phases** : Avant, Demander, Produire, Évaluer, Sécuriser, Piloter, Construire, Contribuer
- **Public** : 7-10, 11-15, 16-20, Post-bac, Adultes
- **Durée** : <30min, 30-60min, 1-2h, 2-4h, Projet
- **Groupe** : Petit, Moyen, Grand
- **Préparation** : Légère, Moyenne, Importante
- **Contexte** : Scolaire, Études sup., Entreprise
- **IDs custom** : format `CUS-001`, `CUS-002`, …

## Commandes

```bash
npm run dev      # Dev server
npm run build    # Build production (doit passer sans erreur)
npm run preview  # Prévisualiser le build
```

## Historique des migrations majeures

- **Migration mono→multi fichiers** : le fichier originel `catalogue.jsx` (~5945 lignes, tout en un) a été découpé en l'architecture ci-dessus. Les 16 styles inline ont été remplacés par des classes CSS. Le bloc `const CSS = \`...\`` a été converti en 5 fichiers CSS séparés.
