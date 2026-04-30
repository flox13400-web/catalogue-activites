import React from "react";
import "../styles/card.css";

function MetaItem({ label, value }) {
  return (
    <div className="meta-item">
      <div className="meta-label">{label}</div>
      <div className="meta-value">{value}</div>
    </div>
  );
}

export function ActivityCard({ activite, onClick, estEpingle, estFavori, onToggleFavori, onAssigner }) {
  const agePublic = activite.age_public || activite.public || [];
  const tailleGroupe = activite.taille_groupe || activite.groupe || [];

  return (
    <article
      className={`card ${estEpingle ? "card-epingle" : ""}`}
      onClick={() => onClick(activite)}
    >
      <div className="card-top">
        <span className="card-id">{activite.id}</span>
        <div className="card-top-actions">
          {estEpingle && <span className="card-epingle-badge" title="Dans le constructeur">📌</span>}
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
        <MetaItem label="Durée" value={activite.duree_detail || activite.duree} />
        {tailleGroupe.length > 0 && (
          <MetaItem label="Groupe" value={tailleGroupe.join(" · ")} />
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
