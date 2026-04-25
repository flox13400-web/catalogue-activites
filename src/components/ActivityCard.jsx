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

export function ActivityCard({ activite, onClick, estEpingle }) {
  function handleDragStart(e) {
    e.dataTransfer.setData("text/activity-id", activite.id);
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <article
      className={`card ${estEpingle ? "card-epingle" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(activite)}
    >
      <div className="card-top">
        <span className="card-id">{activite.id}</span>
        {estEpingle && <span className="card-epingle-badge" title="Dans le panier">📌</span>}
        {activite._custom && <span className="card-custom-badge">✎ perso</span>}
        {activite._modifiee && !activite._custom && <span className="card-modifiee-badge">✎ modifiée</span>}
      </div>
      <h3 className="card-title">{activite.titre}</h3>
      <p className="card-desc">{activite.description_courte}</p>
      <div className="card-meta">
        <MetaItem label="Durée" value={activite.duree_detail || activite.duree} />
        <MetaItem label="Groupe" value={activite.groupe.join(" · ")} />
        <MetaItem label="Préparation" value={activite.preparation} />
      </div>
      <div className="card-tags">
        <div className="card-tags-row">
          {activite.public.map((p) => (
            <span key={p} className="tag tag-public">{p}</span>
          ))}
        </div>
        <div className="card-tags-row">
          {activite.themes.map((c) => (
            <span key={c} className="tag tag-theme">{c}</span>
          ))}
          {activite.contexte.map((c) => (
            <span key={c} className="tag tag-contexte">{c}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
