import { useRef } from "react";
import LogoMark from "./LogoMark";
import "../styles/home.css";

/**
 * Écran d'accueil affiché au lancement de l'application.
 * Permet de choisir l'action initiale avant d'entrer dans le catalogue.
 */
export default function HomeScreen({
  activitesCount,
  onBrowse,
  onCreateActivity,
  onBuildSequence,
  onImportSQA,
}) {
  const sqaInputRef = useRef(null);

  function handleImportClick() {
    sqaInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) onImportSQA(file);
    e.target.value = "";
  }

  const heure = new Date().getHours();
  const salut =
    heure < 12 ? "Bonjour" : heure < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="home-screen">
      <header className="home-topbar">
        <div className="home-brand">
          <LogoMark style={{ width: 28, height: 28 }} />
          SEQUENCIA
        </div>
      </header>

      <div className="home-body">
        <div className="home-container">
          <h1 className="home-greeting">{salut}&nbsp;! 👋</h1>
          <p className="home-subtitle">Que souhaitez-vous faire aujourd'hui&nbsp;?</p>

          {activitesCount > 0 && (
            <div className="home-stats">
              <span className="home-stats-dot" />
              {activitesCount} activité{activitesCount > 1 ? "s" : ""} dans votre catalogue
            </div>
          )}

          <div className="home-bento">

            {/* Carte principale : parcourir le catalogue */}
            <div className="home-card home-card-primary" onClick={onBrowse}>
              <div className="home-card-icon home-card-icon-primary" style={{ color: "white" }}>
                🗂
              </div>
              <div>
                <h2 className="home-card-title">Parcourir le catalogue</h2>
                <p className="home-card-desc">
                  Retrouvez, filtrez et organisez toutes vos activités pédagogiques.
                  Construisez votre séquence depuis le panneau de droite.
                </p>
              </div>
              <span className="home-card-arrow">→</span>
            </div>

            {/* Carte : créer une activité */}
            <div
              className="home-card home-card-teal"
              onClick={onCreateActivity}
              style={{ "--hover-color": "#0D9488" }}
            >
              <div className="home-card-icon home-card-icon-teal" style={{ fontSize: "1.3rem" }}>
                ✏️
              </div>
              <div>
                <h2 className="home-card-title" style={{ color: "#0D9488" }}>Créer une activité</h2>
                <p className="home-card-desc">
                  Ajoutez une nouvelle fiche à votre bibliothèque locale.
                </p>
              </div>
            </div>

            {/* Carte : importer un fichier .sqa */}
            <div className="home-card home-card-purple" onClick={handleImportClick}>
              <div className="home-card-icon home-card-icon-purple" style={{ fontSize: "1.3rem" }}>
                📥
              </div>
              <div>
                <h2 className="home-card-title" style={{ color: "#7C3AED" }}>Importer (.sqa)</h2>
                <p className="home-card-desc">
                  Chargez une formation complète avec son programme et ses activités.
                </p>
              </div>
              <input
                ref={sqaInputRef}
                type="file"
                accept=".sqa,.json"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            {/* Carte : concevoir un parcours */}
            <div className="home-card home-card-amber" onClick={onBuildSequence}>
              <div className="home-card-icon home-card-icon-amber" style={{ fontSize: "1.3rem" }}>
                🗺
              </div>
              <div>
                <h2 className="home-card-title" style={{ color: "#D97706" }}>Concevoir un parcours</h2>
                <p className="home-card-desc">
                  Structurez vos séquences et séances pédagogiques dans le constructeur.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
