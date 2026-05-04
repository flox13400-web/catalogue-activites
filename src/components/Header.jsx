import React from "react";
import "../styles/global.css";
import LogoBrand from "./LogoBrand";
import QualiopiBadges from "./QualiopiBadges";

export default function Header({ programme, activites }) {
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
        {programme && activites && (
          <div className="header-right">
            <QualiopiBadges programme={programme} activites={activites} />
          </div>
        )}
      </div>
    </header>
  );
}
