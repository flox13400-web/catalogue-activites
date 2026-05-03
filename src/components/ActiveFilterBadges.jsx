import React from "react";

const ETIQUETTES = {
  age_public: "Âge",
  duree: "Durée",
  taille_groupe: "Groupe",
  modalite: "Modalité",
  themes: "Thème",
  materiels: "Matériel",
};

export default function ActiveFilterBadges({ filtres, setFiltres }) {
  const badges = [];

  if (filtres.search.trim()) {
    badges.push({
      key: "search",
      label: `Recherche : "${filtres.search.trim()}"`,
      onRemove: () => setFiltres(prev => ({ ...prev, search: "" })),
    });
  }

  if (filtres.favorisOnly) {
    badges.push({
      key: "favorisOnly",
      label: "♥ Favoris",
      onRemove: () => setFiltres(prev => ({ ...prev, favorisOnly: false })),
    });
  }

  for (const [key, etiquette] of Object.entries(ETIQUETTES)) {
    for (const val of filtres[key] ?? []) {
      badges.push({
        key: `${key}-${val}`,
        label: `${etiquette} : ${val}`,
        onRemove: () =>
          setFiltres(prev => ({
            ...prev,
            [key]: prev[key].filter(v => v !== val),
          })),
      });
    }
  }

  if (badges.length === 0) return null;

  return (
    <div className="active-filter-badges">
      {badges.map(badge => (
        <span key={badge.key} className="active-filter-badge">
          {badge.label}
          <button
            className="active-filter-badge-remove"
            onClick={badge.onRemove}
            title="Retirer ce filtre"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
