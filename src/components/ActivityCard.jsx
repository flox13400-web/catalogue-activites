import React from "react";
import "../styles/card.css";

/**
 * Détermine si une activité est de type évaluation en se basant sur le champ type_fiche.
 * @param {Object} activite - L'objet activité.
 * @returns {boolean} True si l'activité est une évaluation.
 */
function cardMethodeClass(activite) {
  if (activite.methode === "evaluation" || activite.type_fiche === "Activite_Evaluation" || activite.type_fiche === "Évaluation" || activite.type_fiche === "Evaluation")
    return "card-eval";
  if (activite.methode === "expositive") return "card-expositive";
  return "card-apprentissage";
}

const MODALITE_ICONS = {
  "Présentielle": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  "Distanciel":   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
  "Synchrone":    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
  "Asynchrone":   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
};

export function ActivityCard({ activite, onClick, estEpingle, estFavori, onToggleFavori, onAssigner, selectionMode = false, isSelected = false, onToggleSelect }) {
  const agePublic = activite.age_public || activite.public || [];
  const tailleGroupe = activite.taille_groupe || activite.groupe || [];
  const modalites = activite.modalite || [];

  function handleClick() {
    if (selectionMode) onToggleSelect?.(activite.id);
    else onClick(activite);
  }

  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', activite.id);
    e.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <article
      className={`card ${estEpingle ? "card-epingle" : ""} ${cardMethodeClass(activite)}${selectionMode ? " card-selection-mode" : ""}${isSelected ? " card-selected" : ""}`}
      onClick={handleClick}
      draggable={!!onAssigner && !selectionMode}
      onDragStart={onAssigner && !selectionMode ? handleDragStart : undefined}
    >
      <div className="card-type-indicator"></div>
      {selectionMode && (
        <div className="card-select-overlay">
          <span className="card-select-check">{isSelected ? "✓" : ""}</span>
        </div>
      )}
      <div className="card-top">
        {estEpingle && <span className="card-epingle-badge" title="Dans le constructeur">📌</span>}
        {!selectionMode && (
          <div className="card-top-actions">
            <button
              className="btn-assigner"
              onClick={(e) => { e.stopPropagation(); onAssigner(activite.id); }}
              title="Assigner à une séance"
            >
              +
            </button>
            <button
              className={`btn-favori${estFavori ? " btn-favori-active" : ""}`}
              onClick={(e) => { e.stopPropagation(); onToggleFavori(activite.id); }}
              title={estFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {estFavori ? "♥" : "♡"}
            </button>
          </div>
        )}
      </div>
      <h3 className="card-title">{activite.titre}</h3>
      <div className="card-meta">
        <div className="card-meta-item">
          <svg className="card-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span className="card-meta-value card-meta-value-duree" title={activite.duree}>{activite.duree}</span>
        </div>
        {tailleGroupe.length > 0 && (
          <div className="card-meta-item">
            <svg className="card-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span className="card-meta-value">{tailleGroupe.join(" · ")}</span>
          </div>
        )}
        {modalites.length > 0 && (
          <div className="card-modalites">
            {modalites.map(m => MODALITE_ICONS[m] ? (
              <span key={m} className="card-modalite-badge" title={m}>
                {MODALITE_ICONS[m]}
              </span>
            ) : null)}
          </div>
        )}
      </div>
      <div className="card-tags">
        {agePublic.length > 0 && (
          <div className="card-tags-row">
            {agePublic.map((p) => (
              <span key={p} className="tag tag-public">{p}</span>
            ))}
          </div>
        )}
        {(activite.themes || []).length > 0 && (
          <div className="card-tags-row">
            {(activite.themes || []).map((t) => (
              <span key={t} className="tag tag-theme">{t}</span>
            ))}
          </div>
        )}
        {activite.adaptation_psh && (
          <div className="card-tags-row">
            <span className="tag tag-psh">♿ PSH</span>
          </div>
        )}
      </div>
    </article>
  );
}

