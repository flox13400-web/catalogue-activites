import React, { useRef, useState } from "react";
import "../styles/global.css";
import LogoBrand from "./LogoBrand";

/**
 * Composant d'en-tête de l'application.
 * Contient uniquement le logo et le menu Mémoire (Exporter / Importer un programme .sqa).
 * Les actions catalogue (Créer, 💾, Corbeille) sont dans le panneau catalogue.
 * @param {Function} onExportSQA
 * @param {Function} onImportSQA
 */
export default function Header({ onExportSQA, onImportSQA }) {
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
            <div className="dropdown-container">
              <button className="btn-header" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                Mémoire ▼
              </button>
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={() => { onExportSQA(); setIsMenuOpen(false); }}>
                    Exporter un programme
                  </button>
                  <button className="dropdown-item" onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }}>
                    Importer un programme
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
          </div>
        </div>
      </div>
    </header>
  );
}
