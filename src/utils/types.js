/**
 * Modèles de données pour l'arborescence pédagogique.
 * Ces types définissent la future structure du panier (refonte).
 * Fichier de référence uniquement — aucune logique applicative ici.
 */

/**
 * Niveau racine : un programme pédagogique complet.
 *
 * @typedef {Object} Programme
 * @property {string} id
 * @property {string} titre
 * @property {string} objectif_final
 */

/**
 * Regroupement de séances au sein d'un programme.
 *
 * @typedef {Object} Sequence
 * @property {string} id
 * @property {string} titre
 * @property {string} objectif_competence
 * @property {string} parent_id - ID du Programme parent
 */

/**
 * Unité d'enseignement au sein d'une séquence.
 * L'OPO (Objectif Pédagogique Opérationnel) est défini par un verbe et un type.
 *
 * @typedef {Object} Seance
 * @property {string} id
 * @property {string} titre
 * @property {string} opo_verbe
 * @property {"Savoir"|"Savoir-faire"|"Savoir-être"} opo_type
 * @property {string} parent_id - ID de la Sequence parente
 */

/**
 * Fiche d'activité rattachée à une séance.
 *
 * @typedef {Object} Fiche
 * @property {string} id
 * @property {"active"|"expositive"|"evaluation"} methode
 * @property {string} parent_id - ID de la Seance parente
 */
