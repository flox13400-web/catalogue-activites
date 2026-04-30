import React from "react";
import "../styles/modal.css";

export default function DetailModal({ activite, onClose, estEpingle, onAssigner, onEdit, onDelete }) {
  React.useEffect(() => {
    function handleKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!activite) return null;

  const agePublic = activite.age_public || activite.public || [];
  const tailleGroupe = activite.taille_groupe || activite.groupe || [];

  function handleDelete() {
    if (window.confirm(`Supprimer définitivement "${activite.titre}" ?\n\nCette action est irréversible.`)) {
      onDelete(activite.id);
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-eyebrow">{activite.id}</div>
        <h2 className="modal-title">{activite.titre}</h2>
        <div className="modal-meta-row">
          <span className="modal-meta"><strong>Durée</strong> · {activite.duree_detail || activite.duree}</span>
          {tailleGroupe.length > 0 && (
            <span className="modal-meta"><strong>Groupe</strong> · {tailleGroupe.join(", ")}</span>
          )}
        </div>

        {agePublic.length > 0 && (
          <div className="modal-section">
            <h3 className="modal-section-title">Âge du public</h3>
            <div className="modal-tags">
              {agePublic.map((p) => (
                <span key={p} className="tag tag-public tag-large">{p}</span>
              ))}
            </div>
          </div>
        )}

        {(activite.modalite || []).length > 0 && (
          <div className="modal-section">
            <h3 className="modal-section-title">Modalité</h3>
            <div className="modal-tags">
              {(activite.modalite || []).map((m) => (
                <span key={m} className="tag tag-contexte tag-large">{m}</span>
              ))}
            </div>
          </div>
        )}

        {(activite.contexte || []).length > 0 && (
          <div className="modal-section">
            <h3 className="modal-section-title">Contexte</h3>
            <div className="modal-tags">
              {(activite.contexte || []).map((c) => (
                <span key={c} className="tag tag-contexte tag-large">{c}</span>
              ))}
            </div>
          </div>
        )}

        {(activite.themes || []).length > 0 && (
          <div className="modal-section">
            <h3 className="modal-section-title">Thèmes</h3>
            <div className="modal-tags">
              {(activite.themes || []).map((t) => (
                <span key={t} className="tag tag-theme tag-large">{t}</span>
              ))}
            </div>
          </div>
        )}

        {(activite.materiels || []).length > 0 && (
          <div className="modal-section">
            <h3 className="modal-section-title">Matériels nécessaires</h3>
            <div className="modal-tags">
              {(activite.materiels || []).map((m) => (
                <span key={m} className="tag tag-theme tag-large">{m}</span>
              ))}
            </div>
          </div>
        )}

        {activite.description_courte && (
          <div className="modal-section">
            <h3 className="modal-section-title">Résumé</h3>
            <p className="modal-text">{activite.description_courte}</p>
          </div>
        )}

        <div className="modal-section">
          <h3 className="modal-section-title">Description</h3>
          <p className="modal-text">{activite.description}</p>
        </div>

        {activite.apprentissage_cle && (
          <div className="modal-section modal-apprentissage">
            <h3 className="modal-section-title">Apprentissage clé</h3>
            <p className="modal-text modal-text-italic">« {activite.apprentissage_cle} »</p>
          </div>
        )}

        {activite.problematique && (
          <div className="modal-section">
            <h3 className="modal-section-title">Problématique possible</h3>
            <p className="modal-text">{activite.problematique}</p>
          </div>
        )}

        {activite.remediation && (
          <div className="modal-section">
            <h3 className="modal-section-title">Remédiation</h3>
            <p className="modal-text">{activite.remediation}</p>
          </div>
        )}

        <div className="modal-footer">
          {onAssigner && (
            <button className={`btn ${estEpingle ? "btn-retirer" : ""}`} onClick={() => onAssigner(activite.id)}>
              {estEpingle ? "📌 Déjà assignée — réassigner" : "+ Assigner à une séance"}
            </button>
          )}
          <div className="modal-custom-actions">
            <button className="btn-custom-edit" onClick={() => { onClose(); onEdit(activite); }}>
              ✎ Modifier
            </button>
            <button className="btn-custom-delete" onClick={handleDelete}>
              🗑 Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
