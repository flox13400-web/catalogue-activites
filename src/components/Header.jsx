import React, { useRef, useState } from "react";
import "../styles/global.css";
import LogoBrand from "./LogoBrand";

/**
 * Composant d'en-tête de l'application.
 */
export default function Header({ onNouvelleActivite, onViderCatalogue, onSauvegarderCatalogue, nbCorbeille, onOuvrirCorbeille, onExportSQA, onImportSQA }) {
  const fileInputRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      onImportSQA(file);
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
          <div className="header-actions">
            <button className="btn-header btn-creer" onClick={onNouvelleActivite}>
              Créer +
            </button>
            <div className="dropdown-container">
              <button className="btn-header" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                Mémoire ▼
              </button>
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={() => { onSauvegarderCatalogue(); setIsMenuOpen(false); }}>
                    Sauvegarder JSON
                  </button>
                  <button className="dropdown-item" onClick={() => { onExportSQA(); setIsMenuOpen(false); }}>
                    Exporter (.sqa)
                  </button>
                  <button className="dropdown-item" onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }}>
                    Importer (.sqa)
                  </button>
                  <button className="dropdown-item" onClick={() => { onViderCatalogue(); setIsMenuOpen(false); }} style={{ color: "#c0392b" }}>
                    Vider catalogue
                  </button>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="sqa-file-input"
              type="file"
              accept=".sqa"
              className="sqa-file-input-hidden"
              onChange={(e) => { handleFileChange(e); setIsMenuOpen(false); }}
            />
            <button className="btn-header" onClick={onOuvrirCorbeille} title="Corbeille">
              🗑 {nbCorbeille}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
