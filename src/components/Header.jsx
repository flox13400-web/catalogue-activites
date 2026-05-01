import React, { useRef, useState } from "react";
import "../styles/global.css";
import LogoBrand from "./LogoBrand";
import { formatDureeGlobale } from "../utils/duree";

/**
 * Composant d'en-tête de l'application.
 */
export default function Header({ programme, dureeTotal, totalActivites, filteredCount, onNouvelleActivite, onViderCatalogue, onSauvegarderCatalogue, nbCorbeille, onOuvrirCorbeille, onExportSQA, onImportSQA }) {
  const fileInputRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      onImportSQA(file);
      e.target.value = "";
    }
  }

  const dureeStr = formatDureeGlobale(dureeTotal) || "0min";
  const dureeCible = (programme?.duree_objectif || 0) * 60;
  const ratio = dureeCible > 0 ? Math.min((dureeTotal?.max || 0) / dureeCible, 1) * 100 : 0;

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <img src={`${import.meta.env.BASE_URL}logo-sequencia.png`} alt="" className="header-mark" />
          <div className="header-text">
            <LogoBrand className="header-nom" />
            <span className="header-tagline">TICE ton architecture pédagogique</span>
          </div>
          {dureeCible > 0 && (
            <div className="header-jauge">
              <span className="header-jauge-text">{dureeStr} / {programme.duree_objectif}h</span>
              <div className="header-jauge-bar">
                <div className="header-jauge-fill" style={{ width: `${ratio}%` }}></div>
              </div>
            </div>
          )}
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
