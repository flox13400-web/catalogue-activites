import React from "react";
import "../styles/global.css";
import LogoBrand from "./LogoBrand";

/**
 * Composant d'en-tête — logo uniquement.
 * Les actions programme (Export/Import .sqa) sont dans le panneau Constructeur.
 */
export default function Header() {
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
      </div>
    </header>
  );
}
