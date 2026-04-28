export const FILTRES_INIT = {
  age_public: [],
  duree: [],
  taille_groupe: [],
  themes: [],
  materiels: [],
  contexte: [],
  modalite: [],
  favorisOnly: false,
  search: "",
};

export function applyFilters(activites, filtres, favorisIds = new Set()) {
  return activites.filter((a) => {
    if (filtres.favorisOnly && !favorisIds.has(a.id)) return false;
    if (filtres.search.trim()) {
      const q = filtres.search.toLowerCase();
      const haystack = [a.titre, a.description_courte, a.apprentissage_cle, a.id]
        .join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    const agePublic = a.age_public || a.public || [];
    if (filtres.age_public.length > 0 && !filtres.age_public.some((v) => agePublic.includes(v))) return false;
    if (filtres.duree.length > 0 && !filtres.duree.includes(a.duree)) return false;
    const tailleGroupe = a.taille_groupe || a.groupe || [];
    if (filtres.taille_groupe.length > 0 && !filtres.taille_groupe.some((v) => tailleGroupe.includes(v))) return false;
    if (filtres.contexte.length > 0 && !filtres.contexte.some((v) => (a.contexte || []).includes(v))) return false;
    if (filtres.modalite.length > 0 && !filtres.modalite.some((v) => (a.modalite || []).includes(v))) return false;
    if (filtres.themes.length > 0 && !filtres.themes.some((v) => (a.themes || []).includes(v))) return false;
    if (filtres.materiels.length > 0 && !filtres.materiels.some((v) => (a.materiels || []).includes(v))) return false;
    return true;
  });
}
