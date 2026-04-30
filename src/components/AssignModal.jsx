import React from "react";
import "../styles/modal.css";

export default function AssignModal({ programme, activiteId, toutesActivites, onAssign, onClose }) {
  React.useEffect(() => {
    function handleKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const activite = toutesActivites.find(a => a.id === activiteId);
  const totalSeances = programme.sequences.reduce((n, seq) => n + seq.seances.length, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal assign-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-eyebrow">Assigner à une séance</div>
        <h2 className="assign-modal-titre">{activite?.titre ?? activiteId}</h2>

        {totalSeances === 0 ? (
          <div className="assign-empty-state">
            <p className="assign-empty-text">Aucune séance disponible.</p>
            <p className="assign-empty-hint">
              Créez d'abord une séquence et une séance dans le panneau droit.
            </p>
          </div>
        ) : (
          <div className="assign-tree">
            {programme.sequences.map(seq => (
              <div key={seq.id} className="assign-sequence">
                <div className="assign-sequence-titre">{seq.titre}</div>
                {seq.seances.length === 0 ? (
                  <p className="assign-seance-empty">Aucune séance dans cette séquence</p>
                ) : (
                  seq.seances.map(sea => (
                    <button
                      key={sea.id}
                      className="assign-seance-btn"
                      onClick={() => onAssign(sea.id)}
                    >
                      {sea.titre}
                    </button>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
