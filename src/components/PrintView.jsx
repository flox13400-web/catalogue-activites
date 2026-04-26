import React from "react";
import "../styles/card.css";

function qrSrc(url, size = 160) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}

export default function PrintView({ panierAffichage, titreSeance = "" }) {
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const titreDoc = titreSeance.trim() || "Fiche de séance";

  const activites = panierAffichage.filter(i => i.type === "activite");
  if (activites.length === 0) return null;

  let actNum = 0;
  const itemsNumerotes = panierAffichage.map(item => {
    if (item.type === "activite") return { ...item, num: ++actNum };
    return item;
  });

  return (
    <div className="print-view">
      <div className="print-doc-header">
        <div className="print-doc-eyebrow">Ressources pédagogiques · IA générative</div>
        <h1 className="print-doc-title">{titreDoc}</h1>
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

        if (item.type === "qrcode") {
          if (!item.url?.trim() && !item.legende?.trim()) return null;
          return (
            <div key={item.id} className="print-qrcode">
              {item.url?.trim() && (
                <img
                  src={qrSrc(item.url.trim(), 160)}
                  alt="QR Code"
                  className="print-qrcode-img"
                  width="160"
                  height="160"
                />
              )}
              {item.legende?.trim() && (
                <p className="print-qrcode-legende">{item.legende}</p>
              )}
            </div>
          );
        }

        if (item.type === "objectif") {
          const blank = <span className="print-objectif-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>;
          const c1 = item.champ1?.trim() ? <strong>{item.champ1}</strong> : blank;
          const c2 = item.champ2?.trim() ? <strong>{item.champ2}</strong> : blank;
          const c3 = item.champ3?.trim() ? <strong>{item.champ3}</strong> : blank;
          return (
            <div key={item.id} className="print-objectif">
              <p>A l'issue de {c1}, l'apprenant sera capable de {c2}. La compétence sera acquise si {c3}.</p>
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
                  <span className="print-fiche-id">{a.id}</span>
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
                <div className="print-fiche-meta-label">Thèmes</div>
                <div className="print-fiche-meta-value">{a.themes.join(", ")}</div>
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
        {titreDoc} · {activites.length} activité{activites.length > 1 ? "s" : ""}
      </div>
    </div>
  );
}
