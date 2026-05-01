/**
 * @file sqaManager.js
 * @description Gestionnaire d'entrée/sortie pour le format de fichier personnalisé .sqa.
 * Un fichier .sqa est une archive JSON autonome contenant le programme ET le dictionnaire
 * complet des activités référencées, ce qui le rend portable entre machines.
 *
 * Structure du payload .sqa :
 * {
 *   version: "1.0",
 *   programme: { titre, sequences, objectif_bloom, ... },
 *   dictionnaireActivites: [ { id, titre, type_fiche, eval_type, ... }, ... ]
 * }
 */

import { KEYS, loadJSON, saveJSON } from "./storage";

/**
 * Construit un slug de nom de fichier à partir du titre du programme.
 * @param {string} titre - Titre brut du programme.
 * @returns {string} Slug kebab-case sûr pour un nom de fichier.
 */
function slugify(titre) {
  return (titre || "mon-programme")
    .trim()
    .toLowerCase()
    .replace(/[àâä]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[îï]/g, "i")
    .replace(/[ôö]/g, "o")
    .replace(/[ùûü]/g, "u")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Exporte le programme courant vers un fichier .sqa téléchargeable.
 * Le payload inclut un dictionnaire complet des activités référencées
 * afin que le fichier soit autonome et portable.
 *
 * @param {Object} programmeData - L'objet d'état du programme (séquences, titre, objectifs...).
 * @param {Array<Object>} toutesActivites - Tableau complet des activités du catalogue local,
 *   utilisé pour extraire les objets complets référencés dans le programme.
 * @returns {void}
 */
export function exportToSQA(programmeData, toutesActivites) {
  // Collecter les IDs de toutes les activités référencées dans le programme
  const idsReferences = new Set();
  for (const seq of programmeData.sequences ?? []) {
    for (const sea of seq.seances ?? []) {
      for (const fiche of sea.fiches ?? []) {
        if (fiche.activite_id) idsReferences.add(fiche.activite_id);
      }
    }
  }

  // Construire le dictionnaire avec les objets complets des activités référencées
  const dictionnaireActivites = (toutesActivites ?? []).filter(
    (a) => idsReferences.has(a.id)
  );

  const payload = {
    version: "1.0",
    programme: programmeData,
    dictionnaireActivites,
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(programmeData.titre)}.sqa`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Importe un fichier .sqa depuis le disque local.
 * Retourne une Promesse résolvant avec :
 *   - `programme` : l'objet programme à injecter dans le state React
 *   - `nouvellesActivites` : les activités du dictionnaire absentes du catalogue local,
 *     prêtes à être pushées dans le state activites.
 *
 * Effectue aussi la synchronisation du localStorage (catalogue_activites) en amont
 * afin que le catalogue soit cohérent même avant le prochain re-rendu React.
 *
 * @param {File} file - L'objet File issu d'un <input type="file">.
 * @returns {Promise<{ programme: Object, nouvellesActivites: Array<Object> }>}
 */
export function importFromSQA(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target.result);

        // Validation de la structure du payload .sqa
        if (
          !payload ||
          typeof payload !== "object" ||
          !payload.programme ||
          !Array.isArray(payload.programme.sequences) ||
          !Array.isArray(payload.dictionnaireActivites)
        ) {
          throw new Error(
            "Structure .sqa non reconnue : clés 'programme' ou 'dictionnaireActivites' manquantes."
          );
        }

        const { programme, dictionnaireActivites } = payload;

        // --- Synchronisation du catalogue localStorage ---
        // Récupère le catalogue courant du localStorage
        const catalogueLocal = loadJSON(KEYS.activites, []);
        const idsLocaux = new Set((catalogueLocal ?? []).map((a) => a.id));

        // Filtre les activités absentes du catalogue local
        const nouvellesActivites = dictionnaireActivites.filter(
          (a) => !idsLocaux.has(a.id)
        );

        // Si de nouvelles activités sont trouvées, les pousser dans le localStorage
        if (nouvellesActivites.length > 0) {
          const catalogueMisAJour = [...catalogueLocal, ...nouvellesActivites];
          saveJSON(KEYS.activites, catalogueMisAJour);
        }

        resolve({ programme, nouvellesActivites });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.readAsText(file, "UTF-8");
  });
}
