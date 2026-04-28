import React from "react";
import "../styles/card.css";

function qrSrc(url, size = 160) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}

const DUREE_PLAGES = {
  "0-15min":  { min: 0,  max: 15  },
  "15-30min": { min: 15, max: 30  },
  "30-45min": { min: 30, max: 45  },
  "45-60min": { min: 45, max: 60  },
  ">60min":   null,
};

function parseDureeStr(str) {
  if (!str) return null;
  str = str.trim();
  let m = str.match(/^(\d+)\s*min$/i);
  if (m) return parseInt(m[1], 10);
  m = str.match(/^(\d+)\s*h\s*(\d+)\s*(?:min)?$/i);
  if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  m = str.match(/^(\d+)\s*h$/i);
  if (m) return parseInt(m[1], 10) * 60;
  m = str.match(/^(\d+)$/);
  if (m) return parseInt(m[1], 10);
  return null;
}

function fmtMin(m) {
  if (m === 0) return "0min";
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h${String(min).padStart(2, "0")}`;
}

function getDureeStr(items) {
  let min = 0, max = 0, hasVarible = false;
  for (const item of items) {
    if (item.type === "activite" && item.activite) {
      const a = item.activite;
      const plage = DUREE_PLAGES[a.duree];
      if (plage === null) { hasVarible = true; continue; }
      if (plage) { min += plage.min; max += plage.max; continue; }
      const mn = parseDureeStr(a.duree_detail || a.duree);
      if (mn !== null) { min += mn; max += mn; }
    } else if ((item.duree ?? 0) > 0) {
      min += item.duree;
      max += item.duree;
    }
  }
  if (min === 0 && max === 0 && !hasVarible) return null;
  const range = min === max ? fmtMin(min) : `${fmtMin(min)} – ${fmtMin(max)}`;
  return hasVarible ? `${range} + variable` : range;
}

export default function PrintView({ panierAffichage, titreSeance = "" }) {
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const titreDoc = titreSeance.trim() || "Fiche de séance";
  const dureeStr = getDureeStr(panierAffichage);

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
        <div className="print-doc-eyebrow">SEQUENCIA</div>
        <h1 className="print-doc-title">{titreDoc}</h1>
        <div className="print-doc-meta">
          <span>Exporté le {date}</span>
          {dureeStr && (
            <>
              <span className="print-doc-meta-sep">·</span>
              <span>{dureeStr}</span>
            </>
          )}
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
        const agePublic = a.age_public || a.public || [];
        const tailleGroupe = a.taille_groupe || a.groupe || [];

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
              {agePublic.length > 0 && (
                <div className="print-fiche-meta-item">
                  <div className="print-fiche-meta-label">Âge du public</div>
                  <div className="print-fiche-meta-value">{agePublic.join(", ")}</div>
                </div>
              )}
              {tailleGroupe.length > 0 && (
                <div className="print-fiche-meta-item">
                  <div className="print-fiche-meta-label">Taille groupe</div>
                  <div className="print-fiche-meta-value">{tailleGroupe.join(", ")}</div>
                </div>
              )}
              {(a.themes || []).length > 0 && (
                <div className="print-fiche-meta-item">
                  <div className="print-fiche-meta-label">Thèmes</div>
                  <div className="print-fiche-meta-value">{(a.themes || []).join(", ")}</div>
                </div>
              )}
              {(a.materiels || []).length > 0 && (
                <div className="print-fiche-meta-item">
                  <div className="print-fiche-meta-label">Matériels</div>
                  <div className="print-fiche-meta-value">{(a.materiels || []).join(", ")}</div>
                </div>
              )}
              {(a.modalite || []).length > 0 && (
                <div className="print-fiche-meta-item">
                  <div className="print-fiche-meta-label">Modalité</div>
                  <div className="print-fiche-meta-value">{(a.modalite || []).join(", ")}</div>
                </div>
              )}
            </div>

            {a.description && (
              <div className="print-fiche-section">
                <div className="print-fiche-section-label">Description</div>
                <p className="print-fiche-body">{a.description}</p>
              </div>
            )}

            {a.apprentissage_cle && (
              <div className="print-fiche-apprentissage">
                <div className="print-fiche-section-label">Apprentissage clé</div>
                <p className="print-fiche-apprentissage-text">« {a.apprentissage_cle} »</p>
              </div>
            )}

            {a.problematique && (
              <div className="print-fiche-section">
                <div className="print-fiche-section-label">Problématique possible</div>
                <p className="print-fiche-body">{a.problematique}</p>
              </div>
            )}

            {a.remediation && (
              <div className="print-fiche-section">
                <div className="print-fiche-section-label">Remédiation</div>
                <p className="print-fiche-body">{a.remediation}</p>
              </div>
            )}
          </div>
        );
      })}

      <div className="print-doc-footer">
        {titreDoc}{dureeStr ? ` · ${dureeStr}` : ""}
      </div>
    </div>
  );
}
