import React from "react";
import "../styles/global.css";
import LogoBrand from "./LogoBrand";
export default function Header({ totalActivites, filteredCount, onNouvelleActivite, onViderCatalogue, onSauvegarderCatalogue, nbCorbeille, onOuvrirCorbeille }) {
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
