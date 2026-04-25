import React from "react";
import "../styles/modal.css";

export default function DetailModal({ activite, onClose, panier, setPanier, panierOrdre, setPanierOrdre, onEdit, onDelete }) {
  React.useEffect(() => {
    function handleKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!activite) return null;

  const estEpingle = panier.has(activite.id);

  function togglePanier() {
    if (panier.has(activite.id)) {
      setPanier((prev) => {
        const next = new Set(prev);
        next.delete(activite.id);
        return next;
      });
      setPanierOrdre((prev) => prev.filter((x) => !(x.type === "activite" && x.id === activite.id)));
    } else {
      setPanier((prev) => {
        const next = new Set(prev);
        next.add(activite.id);
        return next;
      });
      setPanierOrdre((prev) => [...prev, { type: "activite", id: activite.id }]);
    }
  }

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
          <span className="modal-meta"><strong>Groupe</strong> · {activite.groupe.join(", ")}</span>
        </div>
        <div className="modal-section">
          <h3 className="modal-section-title">Public</h3>
          <div className="modal-tags">
            {activite.public.map((p) => (
              <span key={p} className="tag tag-public tag-large">{p}</span>
            ))}
          </div>
        </div>
        <div className="modal-section">
          <h3 className="modal-section-title">Description</h3>
          <p className="modal-text">{activite.description}</p>
        </div>
        <div className="modal-section modal-apprentissage">
          <h3 className="modal-section-title">Apprentissage clé</h3>
          <p className="modal-text modal-text-italic">« {activite.apprentissage_cle} »</p>
        </div>
        <div className="modal-section">
          <h3 className="modal-section-title">Mots-clés</h3>
          <div className="modal-tags">
            {activite.themes.map((c) => (
              <span key={c} className="tag tag-theme tag-large">{c}</span>
            ))}
            {activite.contexte.map((c) => (
              <span key={c} className="tag tag-contexte tag-large">{c}</span>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className={`btn ${estEpingle ? "btn-retirer" : ""}`} onClick={togglePanier}>
            {estEpingle ? "✓ Retirer du panier" : "📌 Épingler au panier de séance"}
          </button>
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
