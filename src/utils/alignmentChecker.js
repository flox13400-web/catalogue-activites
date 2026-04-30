/**
 * Vérificateur d'alignement pédagogique.
 * Fonction pure : ne modifie aucun état, ne produit aucun effet de bord.
 *
 * Structure attendue en entrée (arbre imbriqué) :
 *   Programme
 *     └── sequences[]
 *           └── seances[]
 *                 └── fiches[]
 *
 * @typedef {import('./types.js').Fiche}    Fiche
 * @typedef {import('./types.js').Seance}   Seance
 * @typedef {import('./types.js').Sequence} Sequence
 * @typedef {import('./types.js').Programme} Programme
 *
 * @typedef {Fiche    & { titre?: string }}                                      FicheArbre
 * @typedef {Seance   & { fiches:    FicheArbre[] }}                             SeanceArbre
 * @typedef {Sequence & { seances:   SeanceArbre[] }}                            SequenceArbre
 * @typedef {Programme & { sequences: SequenceArbre[] }}                         ProgrammeArbre
 *
 * @typedef {{ valide: boolean, erreurs: string[] }} ResultatAlignement
 */

/**
 * Vérifie l'alignement pédagogique d'un programme complet.
 *
 * Règle Micro (Évaluation) :
 *   Chaque séance doit contenir au moins une fiche "Activite_Evaluation".
 *
 * Règle de Bruit (Action) :
 *   Chaque fiche doit posséder un verbe_action_bloom non nul.
 *
 * @param {ProgrammeArbre} programme
 * @returns {ResultatAlignement}
 */
export function verifierAlignementPedagogique(programme) {
  const erreurs = [];

  for (const sequence of programme.sequences ?? []) {
    for (const seance of sequence.seances ?? []) {
      const fiches = seance.fiches ?? [];

      // Règle Micro — au moins une fiche d'évaluation par séance
      const aEvaluation = fiches.some(f => f.type_fiche === "Activite_Evaluation");
      if (!aEvaluation) {
        erreurs.push(`Évaluation manquante pour la séance : ${seance.titre}`);
      }

      // Règle de Bruit — chaque fiche doit avoir un verbe Bloom
      for (const fiche of fiches) {
        if (!fiche.verbe_action_bloom) {
          erreurs.push(`Verbe d'action manquant pour la fiche : ${fiche.titre ?? fiche.id}`);
        }
      }
    }
  }

  return { valide: erreurs.length === 0, erreurs };
}
