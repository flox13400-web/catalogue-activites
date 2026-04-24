export const PHASE_ORDER = [
  "Avant",
  "Demander",
  "Produire",
  "Évaluer",
  "Sécuriser",
  "Piloter",
  "Construire",
  "Contribuer",
];

export const PHASE_DESCRIPTIONS = {
  Avant: "Comprendre ce qu'est l'IA",
  Demander: "Formuler des prompts",
  Produire: "Comprendre et utiliser le traitement",
  Évaluer: "Exercer son esprit critique",
  Sécuriser: "Risques et conformité",
  Piloter: "Managers et dirigeants",
  Construire: "Se positionner professionnellement",
  Contribuer: "Soutenir dans la durée et partager",
};

export const FILTRES_INIT = {
  public: [],
  duree: [],
  groupe: [],
  preparation: [],
  themes: [],
  contexte: [],
  search: "",
};

export function applyFilters(activites, filtres) {
  return activites.filter((a) => {
    if (filtres.search.trim()) {
      const q = filtres.search.toLowerCase();
      const haystack = [a.titre, a.description_courte, a.apprentissage_cle, a.id]
        .join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filtres.public.length > 0 && !filtres.public.some((v) => a.public.includes(v))) return false;
    if (filtres.duree.length > 0 && !filtres.duree.includes(a.duree)) return false;
    if (filtres.groupe.length > 0 && !filtres.groupe.some((v) => a.groupe.includes(v))) return false;
    if (filtres.preparation.length > 0 && !filtres.preparation.includes(a.preparation)) return false;
    if (filtres.themes.length > 0 && !filtres.themes.some((v) => a.themes.includes(v))) return false;
    if (filtres.contexte.length > 0 && !filtres.contexte.some((v) => a.contexte.includes(v))) return false;
    return true;
  });
}
