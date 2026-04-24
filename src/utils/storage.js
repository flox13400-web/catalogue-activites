export const KEYS = {
  natives: "catalogue_activites_natives",
  custom: "catalogue_custom_activites",
  panier: "catalogue_panier_ordre",
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
