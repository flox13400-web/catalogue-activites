import React from "react";
import "../styles/global.css";
import LogoBrand from "./LogoBrand";
export default function Header({ totalActivites, filteredCount, onNouvelleActivite, onViderCatalogue }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <img src="/logo-sequencia.png" alt="" className="header-mark" />
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
          <button className="btn-nouvelle-activite" onClick={onNouvelleActivite}>
            ✚ Nouvelle activité
          </button>
          {totalActivites > 0 && (
            <button className="btn-vider-catalogue" onClick={onViderCatalogue}>
              Vider le catalogue
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
