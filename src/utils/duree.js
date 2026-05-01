export const DUREE_PLAGES = {
  "0-15min":  { min: 0,  max: 15 },
  "15-30min": { min: 15, max: 30 },
  "30-45min": { min: 30, max: 45 },
  "45-60min": { min: 45, max: 60 },
  ">60min":   null,
};

/**
 * Parse une chaîne de caractères représentant une durée pour en extraire un nombre de minutes.
 * @param {string} str - La chaîne de caractères à parser (ex: "45min", "1h30", "2h").
 * @returns {number|null} Le nombre de minutes, ou null si le format n'est pas reconnu.
 */
export function parseDureeString(str) {
  if (!str) return null;
  const s = String(str).trim();
  let m = s.match(/^(\d+)\s*min$/i);
  if (m) return parseInt(m[1], 10);
  m = s.match(/^(\d+)\s*h\s*(\d+)\s*(?:min)?$/i);
  if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  m = s.match(/^(\d+)\s*h$/i);
  if (m) return parseInt(m[1], 10) * 60;
  m = s.match(/^(\d+)$/);
  if (m) return parseInt(m[1], 10);
  return null;
}

/**
 * Calcule la plage de durée (min et max en minutes) pour une activité spécifique.
 * @param {Object} activite - L'objet activité contenant les propriétés `duree` et `duree_detail`.
 * @returns {{min: number, max: number, hasProjet: boolean}} Un objet représentant la plage de durée.
 */
export function parseDureeActivite(activite) {
  const plage = DUREE_PLAGES[activite.duree];
  if (plage === null) return { min: 0, max: 0, hasProjet: true };
  if (plage) return { min: plage.min, max: plage.max, hasProjet: false };
  const minutes = parseDureeString(activite.duree_detail || activite.duree);
  if (minutes !== null) return { min: minutes, max: minutes, hasProjet: false };
  return { min: 0, max: 0, hasProjet: false };
}

/**
 * Formate un nombre de minutes en une chaîne lisible (ex: "1h30", "45min").
 * @param {number} m - Le nombre total de minutes.
 * @returns {string} La chaîne formatée.
 */
export function formatMinutes(m) {
  if (m === 0) return "0min";
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h${String(min).padStart(2, "0")}`;
}

/**
 * Calcule la durée totale d'une liste d'activités en sommant leurs valeurs minimales et maximales.
 * @param {Array<Object>} activites - Tableau des activités à sommer.
 * @returns {{min: number, max: number, hasProjet: boolean}} La somme des durées.
 */
export function sumDureeActivites(activites) {
  let min = 0, max = 0, hasProjet = false;
  for (const a of activites) {
    const d = parseDureeActivite(a);
    min += d.min; max += d.max;
    if (d.hasProjet) hasProjet = true;
  }
  return { min, max, hasProjet };
}

/**
 * Calcule la durée totale de l'ensemble d'un programme en parcourant ses séquences, séances et fiches.
 * @param {Object} programme - L'objet programme courant.
 * @param {Array<Object>} toutesActivites - La liste globale des activités pour résoudre les références des fiches.
 * @returns {{min: number, max: number, hasProjet: boolean}} La durée totale calculée.
 */
export function calculerDureeTotalProgramme(programme, toutesActivites) {
  let min = 0, max = 0, hasProjet = false;
  for (const seq of programme.sequences || []) {
    for (const sea of seq.seances || []) {
      for (const fiche of sea.fiches || []) {
        const activite = toutesActivites.find(a => a.id === fiche.activite_id);
        if (!activite) continue;
        const d = parseDureeActivite(activite);
        min += d.min; max += d.max;
        if (d.hasProjet) hasProjet = true;
      }
    }
  }
  return { min, max, hasProjet };
}

/**
 * Génère la chaîne d'affichage pour une durée totale calculée.
 * @param {{min: number, max: number, hasProjet: boolean}} dureeTotal - L'objet de durée totale.
 * @returns {string|null} La chaîne formatée prête à être affichée (ex: "1h30 – 2h"), ou null si la durée est de 0.
 */
export function formatDureeGlobale(dureeTotal) {
  if (!dureeTotal || (dureeTotal.min === 0 && dureeTotal.max === 0 && !dureeTotal.hasProjet)) return null;
  return (dureeTotal.min === dureeTotal.max
      ? formatMinutes(dureeTotal.min)
      : `${formatMinutes(dureeTotal.min)} – ${formatMinutes(dureeTotal.max)}`)
    + (dureeTotal.hasProjet ? " + projet" : "");
}
