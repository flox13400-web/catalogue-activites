/**
 * @file sqaManager.js
 * @description Gestionnaire d'entrée/sortie pour le format de fichier personnalisé .sqa.
 * Un fichier .sqa est structurellement un JSON contenant l'état complet du programme_encours.
 */

/**
 * Exporte l'objet programme courant vers un fichier .sqa téléchargeable.
 * Crée un lien <a> temporaire pour déclencher le téléchargement sans redirection.
 *
 * @param {Object} programmeData - L'objet d'état du programme (séquences, titre, objectifs...).
 * @returns {void}
 */
export function exportToSQA(programmeData) {
  const json = JSON.stringify(programmeData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const nomFichier = (programmeData.titre || "mon-programme")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_àâäéèêëîïôùûüç]/gi, "-")
    .replace(/-+/g, "-");

  const a = document.createElement("a");
  a.href = url;
  a.download = `${nomFichier}.sqa`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Importe un fichier .sqa depuis le disque local et renvoie les données parsées via une Promesse.
 * Effectue une validation de structure minimale avant de résoudre la promesse.
 *
 * @param {File} file - L'objet File issu d'un <input type="file">.
 * @returns {Promise<Object>} Résout avec l'objet programme parsé, ou rejette si le fichier est invalide.
 */
export function importFromSQA(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Validation de structure minimale : doit contenir un tableau sequences
        if (!data || !Array.isArray(data.sequences)) {
          throw new Error("Structure de fichier invalide : clé 'sequences' manquante.");
        }

        resolve(data);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.readAsText(file, "UTF-8");
  });
}
