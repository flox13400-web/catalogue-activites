import React from "react";
import "../styles/card.css";

/**
 * Détermine si une activité est de type évaluation en se basant sur le champ type_fiche.
 * @param {Object} activite - L'objet activité.
 * @returns {boolean} True si l'activité est une évaluation.
 */
function isEvaluation(activite) {
  const t = activite.type_fiche || "";
  return t === "Activite_Evaluation" || t === "Évaluation" || t === "Evaluation";
}

export function ActivityCard({ activite, onClick, estEpingle, estFavori, onToggleFavori, onAssigner }) {
  const agePublic = activite.age_public || activite.public || [];
  const tailleGroupe = activite.taille_groupe || activite.groupe || [];
  const isEval = isEvaluation(activite);

  return (
    <article
      className={`card ${estEpingle ? "card-epingle" : ""} ${isEval ? "card-eval" : "card-apprentissage"}`}
      onClick={() => onClick(activite)}
    >
      <div className="card-type-indicator"></div>
      <div className="card-top">
        {estEpingle && <span className="card-epingle-badge" title="Dans le constructeur">📌</span>}
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
      </div>
      <h3 className="card-title">{activite.titre}</h3>
      <p className="card-desc">{activite.description_courte}</p>
      <div className="card-meta">
        <div className="card-meta-item">
          <svg className="card-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span className="card-meta-value">{activite.duree}</span>
        </div>
        {tailleGroupe.length > 0 && (
          <div className="card-meta-item">
            <svg className="card-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span className="card-meta-value">{tailleGroupe.join(" · ")}</span>
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
      </div>
    </article>
  );
}

