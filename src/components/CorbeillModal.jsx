import React from "react";
import "../styles/modal.css";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function CorbeillModal({ corbeille, onRestore, onRestoreTout, onVider, onClose }) {
  const nb = corbeille.length;

  function handleRestoreTout() {
    if (!window.confirm(
      `Restaurer les ${nb} élément${nb > 1 ? "s" : ""} de la corbeille ?\n\nLes activités supprimées seront remises dans le catalogue. Les activités modifiées reprendront leur version précédente.`
    )) return;
    onRestoreTout();
  }

  function handleVider() {
    if (!window.confirm(
      `Vider la corbeille ?\n\nCes ${nb} entrée${nb > 1 ? "s" : ""} seront définitivement perdues.`
    )) return;
    onVider();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-corbeille" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-eyebrow">Corbeille</div>
        <h2 className="modal-title">
          {nb === 0 ? "Corbeille vide" : `${nb} entrée${nb > 1 ? "s" : ""}`}
        </h2>

        {nb === 0 ? (
          <p className="corbeille-empty">
            Les suppressions et modifications d'activités apparaîtront ici.
          </p>
        ) : (
          <>
            <div className="corbeille-list">
              {[...corbeille].reverse().map(entry => (
                <div key={entry.id} className="corbeille-item">
                  <div className="corbeille-item-left">
                    <span className={`corbeille-badge corbeille-badge-${entry.type}`}>
                      {entry.type === "suppression" ? "supprimée" : "modifiée"}
                    </span>
                    <div className="corbeille-item-info">
                      <div className="corbeille-item-titre">{entry.activite.titre}</div>
                      <div className="corbeille-item-meta">
                        {entry.activite.id} · {entry.activite.duree} · {formatDate(entry.date)}
                      </div>
                    </div>
                  </div>
                  <button className="btn-corbeille-restore" onClick={() => onRestore(entry.id)}>
                    Restaurer
                  </button>
                </div>
              ))}
            </div>

            <div className="corbeille-footer">
              <button className="btn" onClick={handleRestoreTout}>
                ↺ Tout restaurer
              </button>
              <button className="btn-reset corbeille-vider" onClick={handleVider}>
                Vider la corbeille
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
