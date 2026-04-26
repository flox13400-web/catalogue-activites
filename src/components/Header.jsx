import React from "react";
import "../styles/global.css";

export default function Header({ totalActivites, filteredCount, onNouvelleActivite, onViderCatalogue }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <div className="header-brand">
            <img
              src="/logo-sequencia.svg"
              alt="SEQUENCIA"
              className="header-logo"
              onError={e => { e.currentTarget.hidden = true; }}
            />
            <h1 className="header-title">SEQUENCIA</h1>
          </div>
          <p className="header-subtitle">
            TICE ton architecture pédagogique
          </p>
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
