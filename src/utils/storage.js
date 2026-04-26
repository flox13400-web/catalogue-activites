export const KEYS = {
  activites: "catalogue_activites",
  panier: "catalogue_panier_ordre",
  corbeille: "catalogue_corbeille",
  titreSeance: "catalogue_panier_titre",
  favoris: "catalogue_favoris",
};

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
