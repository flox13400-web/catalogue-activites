import React from "react";
import { PHASE_ORDER } from "../utils/filters";
import "../styles/global.css";

export default function Header({ totalActivites, filteredCount, onNouvelleActivite, onReinitialiser, nbNativesModifiees, nbNativesSupprimees }) {
  const aDesModifs = nbNativesModifiees > 0 || nbNativesSupprimees > 0;
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <div className="header-eyebrow">Ressources pédagogiques · IA générative</div>
          <h1 className="header-title">
            Catalogue des <em>activités</em> sans écran
          </h1>
          <p className="header-subtitle">
            Une bibliothèque éditoriale de {totalActivites} activités pour enseigner
            le fonctionnement, les usages et les limites des IA génératives.
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
          <div className="header-stat">
            <div className="header-stat-num">{PHASE_ORDER.length}</div>
            <div className="header-stat-label">phases</div>
          </div>
          <button className="btn-nouvelle-activite" onClick={onNouvelleActivite}>
            ✚ Nouvelle activité
          </button>
          {aDesModifs && (
            <button className="btn-reinitialiser" onClick={onReinitialiser} title="Remettre les 105 activités d'origine">
              ↺ Réinitialiser
              <span className="btn-reinitialiser-badge">
                {nbNativesModifiees > 0 && `${nbNativesModifiees} modif.`}
                {nbNativesModifiees > 0 && nbNativesSupprimees > 0 && " · "}
                {nbNativesSupprimees > 0 && `${nbNativesSupprimees} supprimée${nbNativesSupprimees > 1 ? "s" : ""}`}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
