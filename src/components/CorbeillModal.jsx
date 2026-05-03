import React from "react";
import "../styles/modal.css";

/**
 * Formate une date ISO en "3 mai 2026 à 18:05".
 * @param {string} iso - Date au format ISO 8601.
 * @returns {string}
 */
function formatDateHeure(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const heure = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${date} à ${heure}`;
}

export default function CorbeillModal({ corbeille, onRestore, onDeleteEntry, onRestoreTout, onVider, onClose }) {
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
                  <div className="corbeille-item-info">
                    <div className="corbeille-item-titre">
                      <span className={`corbeille-badge corbeille-badge-${entry.type}`}>
                        {entry.type === "suppression" ? "Suppression" : "Modification"}
                      </span>
                      <span className="corbeille-item-titre-text">{entry.activite.titre}</span>
                    </div>
                    <div className="corbeille-item-meta">
                      {entry.type === "suppression" ? "Supprimée" : "Modifiée"} le {formatDateHeure(entry.date)}
                    </div>
                    {entry.details?.length > 0 && (
                      <div className="corbeille-item-details">
                        Champs modifiés : {entry.details.join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="corbeille-item-actions">
                    <button className="btn-corbeille-restore" onClick={() => onRestore(entry.id)}>
                      Restaurer
                    </button>
                    <button className="btn-corbeille-delete" onClick={() => onDeleteEntry(entry.id)} title="Supprimer définitivement">
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="corbeille-footer">
              <button className="btn" onClick={handleRestoreTout}>
                ↺ Tout restaurer
              </button>
              <button className="btn-reset corbeille-vider" onClick={handleVider}>
                Tout supprimer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
