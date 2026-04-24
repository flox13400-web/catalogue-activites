import React from "react";
import "../styles/card.css";

export default function PrintView({ panierAffichage }) {
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const activites = panierAffichage.filter(i => i.type === "activite");
  if (activites.length === 0) return null;

  // Pré-numérotation : les encarts n'ont pas de numéro
  let actNum = 0;
  const itemsNumerotes = panierAffichage.map(item => {
    if (item.type === "activite") return { ...item, num: ++actNum };
    return item;
  });

  return (
    <div className="print-view">
      <div className="print-doc-header">
        <div className="print-doc-eyebrow">Ressources pédagogiques · IA générative</div>
        <h1 className="print-doc-title">Fiche de séance</h1>
        <div className="print-doc-meta">
          <span>Exporté le {date}</span>
          <span className="print-doc-meta-sep">·</span>
          <span>{activites.length} activité{activites.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      {activites.length > 1 && (
        <div className="print-toc">
          <div className="print-toc-title">Sommaire</div>
          <ol className="print-toc-list">
            {activites.map((item, i) => (
              <li key={item.id} className="print-toc-item">
                <span className="print-toc-num">{i + 1}.</span>
                <span className="print-toc-name">{item.activite.titre}</span>
                <span className="print-toc-id">{item.activite.id}</span>
                <span className="print-toc-phase">{item.activite.phase}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {itemsNumerotes.map(item => {
        if (item.type === "texte") {
          if (!item.contenu.trim()) return null;
          return (
            <div key={item.id} className="print-texte-libre">
              <p>{item.contenu}</p>
            </div>
          );
        }

        const a = item.activite;
        return (
          <div key={item.id} className="print-fiche">
            <div className="print-fiche-header">
              <div className="print-fiche-header-left">
                <span className="print-fiche-num">{item.num}</span>
                <div>
                  <h2 className="print-fiche-titre">{a.titre}</h2>
                  <div className="print-fiche-id-phase">
                    <span className="print-fiche-id">{a.id}</span>
                    <span className="print-fiche-phase">{a.phase}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="print-fiche-meta-grid">
              <div className="print-fiche-meta-item">
                <div className="print-fiche-meta-label">Durée</div>
                <div className="print-fiche-meta-value">{a.duree_detail || a.duree}</div>
              </div>
              <div className="print-fiche-meta-item">
                <div className="print-fiche-meta-label">Public</div>
                <div className="print-fiche-meta-value">{a.public.join(", ")}</div>
              </div>
              <div className="print-fiche-meta-item">
                <div className="print-fiche-meta-label">Taille groupe</div>
                <div className="print-fiche-meta-value">{a.groupe.join(", ")}</div>
              </div>
              <div className="print-fiche-meta-item">
                <div className="print-fiche-meta-label">Préparation</div>
                <div className="print-fiche-meta-value">{a.preparation}</div>
              </div>
              <div className="print-fiche-meta-item">
                <div className="print-fiche-meta-label">Thèmes</div>
                <div className="print-fiche-meta-value">{a.themes.join(", ")}</div>
              </div>
              <div className="print-fiche-meta-item">
                <div className="print-fiche-meta-label">Contexte</div>
                <div className="print-fiche-meta-value">{a.contexte.join(", ")}</div>
              </div>
            </div>

            <div className="print-fiche-section">
              <div className="print-fiche-section-label">Description</div>
              <p className="print-fiche-body">{a.description}</p>
            </div>

            <div className="print-fiche-apprentissage">
              <div className="print-fiche-section-label">Apprentissage clé</div>
              <p className="print-fiche-apprentissage-text">« {a.apprentissage_cle} »</p>
            </div>
          </div>
        );
      })}

      <div className="print-doc-footer">
        Catalogue d'activités pédagogiques · IA générative — {activites.length} activité{activites.length > 1 ? "s" : ""}
      </div>
    </div>
  );
}
