import React, { useRef } from "react";
import "../styles/global.css";
import LogoBrand from "./LogoBrand";

/**
 * Composant d'en-tête de l'application.
 * @param {Function} onExportSQA - Déclenche l'export du programme courant en fichier .sqa.
 * @param {Function} onImportSQA - Reçoit un objet File .sqa et déclenche le chargement de l'état.
 */
export default function Header({ totalActivites, filteredCount, onNouvelleActivite, onViderCatalogue, onSauvegarderCatalogue, nbCorbeille, onOuvrirCorbeille, onExportSQA, onImportSQA }) {
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      onImportSQA(file);
      // Réinitialise l'input pour permettre le rechargement du même fichier
      e.target.value = "";
    }
  }
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <img src={`${import.meta.env.BASE_URL}logo-sequencia.png`} alt="" className="header-mark" />
          <div className="header-text">
            <LogoBrand className="header-nom" />
            <span className="header-tagline">TICE ton architecture pédagogique</span>
          </div>
        </div>
        <div className="header-right">
          <div className="header-stat">
            <div className="header-stat-num">{filteredCount}</div>
            <div className="header-stat-label">affichées</div>
          </div>
          <div className="header-stat">
            <div className="header-stat-num">{totalActivites}</div>
            <div className="header-stat-label">activités</div>
          </div>
          <div className="header-actions">
            <button className="btn-nouvelle-activite" onClick={onNouvelleActivite}>
              ✚ Nouvelle activité
            </button>
            <button className="btn-sauvegarder-catalogue" onClick={onSauvegarderCatalogue} title="Télécharger tout le catalogue en JSON">
              Sauvegarder
            </button>
            <button className="btn-sauvegarder-catalogue" onClick={onExportSQA} title="Exporter le parcours en cours au format .sqa">
              ↓ Exporter (.sqa)
            </button>
            <button className="btn-sauvegarder-catalogue" onClick={() => fileInputRef.current?.click()} title="Charger un fichier de parcours .sqa">
              ↑ Importer (.sqa)
            </button>
            <input
              ref={fileInputRef}
              id="sqa-file-input"
              type="file"
              accept=".sqa"
              className="sqa-file-input-hidden"
              onChange={handleFileChange}
            />
            <button className="btn-vider-catalogue" onClick={onViderCatalogue}>
              Vider le catalogue
            </button>
            <button className="btn-corbeille-header" onClick={onOuvrirCorbeille} title="Corbeille">
              🗑 <span className="btn-corbeille-header-count">{nbCorbeille}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
