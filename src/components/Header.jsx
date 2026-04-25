import React from "react";
import "../styles/global.css";

export default function Header({ totalActivites, filteredCount, onNouvelleActivite, onReinitialiser, onOuvrirCorbeille, nbNativesModifiees, nbNativesSupprimees, nbCorbeille }) {
  const aDesModifs = nbNativesModifiees > 0 || nbNativesSupprimees > 0;
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <div className="header-eyebrow">Interacthèque</div>
          <h1 className="header-title">
            La bibliothèque <em> interactive</em>
          </h1>
          <p className="header-subtitle">
            Concevoir des scénarios
            n'a jamais été aussi facile.
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
          {nbCorbeille > 0 && (
            <button className="btn-corbeille" onClick={onOuvrirCorbeille} title="Voir les éléments supprimés ou modifiés">
              🗑 Corbeille
              <span className="btn-corbeille-badge">{nbCorbeille}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
