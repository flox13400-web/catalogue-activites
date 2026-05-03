import React from "react";
import { exportJSON, exportMarkdown, exportCSV } from "../utils/export";
import "../styles/cart.css";

const DUREE_PLAGES = {
  "<30min":   { min: 10, max: 30 },
  "30-60min": { min: 30, max: 60 },
  "1-2h":     { min: 60, max: 120 },
  "2-4h":     { min: 120, max: 240 },
  "Projet":   null,
};

function parseDureeString(str) {
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

function parseDureeActivite(activite) {
  const plage = DUREE_PLAGES[activite.duree];
  if (plage === null) return { min: 0, max: 0, hasProjet: true };
  if (plage) return { min: plage.min, max: plage.max, hasProjet: false };
  const minutes = parseDureeString(activite.duree);
  if (minutes !== null) return { min: minutes, max: minutes, hasProjet: false };
  return { min: 0, max: 0, hasProjet: false };
}

function formatMinutes(m) {
  if (m === 0) return "0min";
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h${String(min).padStart(2, "0")}`;
}

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function qrSrc(url, size = 160) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}

function isUrlHttps(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch { return false; }
}

function getDureeStr(panierItems) {
  let min = 0, max = 0, hasProjet = false;
  for (const item of panierItems) {
    if (item.type === "activite" && item.activite) {
      const a = item.activite;
      const plage = DUREE_PLAGES[a.duree];
      if (plage === null) { hasProjet = true; continue; }
      if (plage) { min += plage.min; max += plage.max; continue; }
      const mn = parseDureeString(a.duree);
      if (mn !== null) { min += mn; max += mn; }
    } else if ((item.duree ?? 0) > 0) {
      min += item.duree;
      max += item.duree;
    }
  }
  if (min === 0 && max === 0 && !hasProjet) return null;
  const range = min === max ? formatMinutes(min) : `${formatMinutes(min)} – ${formatMinutes(max)}`;
  return hasProjet ? `${range} + projet` : range;
}

function generatePrintHTML(panierItems, titre = "") {
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const titreDoc = titre.trim() || "Fiche de séance";
  const dureeStr = getDureeStr(panierItems);
  const activites = panierItems.filter(i => i.type === "activite");
  if (activites.length === 0) return null;

  let actNum = 0;
  const itemsNumerotes = panierItems.map(item =>
    item.type === "activite" ? { ...item, num: ++actNum } : item
  );

  const tocRows = activites.length > 1
    ? activites.map((item, i) =>
        `<li class="print-toc-item"><span class="print-toc-num">${i + 1}.</span><span class="print-toc-name">${esc(item.activite.titre)}</span><span class="print-toc-id">${esc(item.activite.id)}</span></li>`
      ).join("")
    : "";

  const toc = activites.length > 1
    ? `<div class="print-toc"><div class="print-toc-title">Sommaire</div><ol class="print-toc-list">${tocRows}</ol></div>`
    : "";

  const items = itemsNumerotes.map(item => {
    if (item.type === "texte") {
      if (!item.contenu.trim()) return "";
      return `<div class="print-texte-libre"><p>${esc(item.contenu)}</p></div>`;
    }
    if (item.type === "qrcode") {
      if (!item.url?.trim() && !item.legende?.trim()) return "";
      const urlValide = item.url?.trim() && isUrlHttps(item.url.trim());
      const imgTag = urlValide
        ? `<img src="${qrSrc(item.url.trim(), 160)}" alt="QR Code" class="print-qrcode-img" width="160" height="160" />`
        : "";
      const legendeTag = item.legende?.trim()
        ? `<p class="print-qrcode-legende">${esc(item.legende)}</p>`
        : "";
      return `<div class="print-qrcode">${imgTag}${legendeTag}</div>`;
    }
    if (item.type === "objectif") {
      const blank = `<span class="print-objectif-blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`;
      const c1 = item.champ1?.trim() ? `<strong>${esc(item.champ1)}</strong>` : blank;
      const c2 = item.champ2?.trim() ? `<strong>${esc(item.champ2)}</strong>` : blank;
      const c3 = item.champ3?.trim() ? `<strong>${esc(item.champ3)}</strong>` : blank;
      return `<div class="print-objectif"><p>A l'issue de ${c1}, l'apprenant sera capable de ${c2}. La compétence sera acquise si ${c3}.</p></div>`;
    }
    const a = item.activite;
    return `<div class="print-fiche">
<div class="print-fiche-header"><div class="print-fiche-header-left"><span class="print-fiche-num">${item.num}</span><div><h2 class="print-fiche-titre">${esc(a.titre)}</h2><span class="print-fiche-id">${esc(a.id)}</span></div></div></div>
<div class="print-fiche-meta-grid">
<div class="print-fiche-meta-item"><div class="print-fiche-meta-label">Durée</div><div class="print-fiche-meta-value">${esc(a.duree)}</div></div>
<div class="print-fiche-meta-item"><div class="print-fiche-meta-label">Public</div><div class="print-fiche-meta-value">${esc(a.public.join(", "))}</div></div>
<div class="print-fiche-meta-item"><div class="print-fiche-meta-label">Taille groupe</div><div class="print-fiche-meta-value">${esc(a.groupe.join(", "))}</div></div>
<div class="print-fiche-meta-item"><div class="print-fiche-meta-label">Thèmes</div><div class="print-fiche-meta-value">${esc(a.themes.join(", "))}</div></div>
</div>
<div class="print-fiche-section"><div class="print-fiche-section-label">Description</div><p class="print-fiche-body">${esc(a.description)}</p></div>
<div class="print-fiche-apprentissage"><div class="print-fiche-section-label">Apprentissage clé</div><p class="print-fiche-apprentissage-text">« ${esc(a.apprentissage_cle)} »</p></div>
</div>`;
  }).join("");

  const nbAct = activites.length;
  const plural = nbAct > 1 ? "s" : "";

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titreDoc)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Georgia,'Times New Roman',serif;font-size:10.5pt;line-height:1.6;color:#111;background:#fff;padding:18mm 20mm}
@media print{@page{margin:18mm 20mm;size:A4}}
.print-doc-header{text-align:center;border-bottom:2px solid #1a1a1a;padding-bottom:14pt;margin-bottom:20pt}
.print-doc-eyebrow{font-size:9pt;text-transform:uppercase;letter-spacing:.25em;color:#D46A54;margin-bottom:6pt;font-weight:700;font-family:Arial,sans-serif}
.print-doc-title{font-family:Georgia,serif;font-size:26pt;font-weight:normal;font-style:italic;letter-spacing:-.01em;margin-bottom:8pt}
.print-doc-meta{font-size:8.5pt;color:#555;display:flex;justify-content:center;gap:8pt;align-items:center}
.print-doc-meta-sep{color:#bbb}
.print-toc{background:#f7f5f0;border:1pt solid #ddd;border-radius:4pt;padding:12pt 16pt;margin-bottom:24pt;page-break-inside:avoid}
.print-toc-title{font-size:8pt;text-transform:uppercase;letter-spacing:.16em;color:#888;font-family:Arial,sans-serif;margin-bottom:8pt;font-weight:bold}
.print-toc-list{list-style:none;padding:0;margin:0}
.print-toc-item{display:flex;align-items:baseline;gap:6pt;padding:2.5pt 0;border-bottom:.5pt dotted #ccc;font-size:9.5pt}
.print-toc-item:last-child{border-bottom:none}
.print-toc-num{color:#999;min-width:14pt;font-size:8.5pt}
.print-toc-name{flex:1;font-weight:normal}
.print-toc-id{font-size:7.5pt;color:#888;font-family:'Courier New',monospace;background:#ede9e0;padding:.5pt 3pt;border-radius:2pt}
.print-fiche{break-inside:avoid;page-break-inside:avoid;border:1pt solid #ccc;border-radius:4pt;padding:14pt 16pt;margin-bottom:16pt}
.print-fiche-header{display:flex;align-items:flex-start;gap:10pt;margin-bottom:10pt;padding-bottom:10pt;border-bottom:1pt solid #e0ddd6}
.print-fiche-header-left{display:flex;align-items:flex-start;gap:10pt;flex:1}
.print-fiche-num{font-family:Georgia,serif;font-size:22pt;font-weight:normal;color:#bbb;line-height:1;min-width:22pt;text-align:center}
.print-fiche-titre{font-family:Georgia,serif;font-size:14pt;font-weight:normal;line-height:1.3;margin:0 0 3pt 0}
.print-fiche-id{font-family:'Courier New',monospace;font-size:7.5pt;color:#888;background:#f0ede6;padding:.5pt 3pt;border-radius:2pt}
.print-fiche-meta-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6pt 12pt;margin-bottom:10pt;background:#faf8f4;padding:8pt 10pt;border-radius:3pt}
.print-fiche-meta-item{}
.print-fiche-meta-label{font-size:6.5pt;text-transform:uppercase;letter-spacing:.14em;color:#999;font-family:Arial,sans-serif;margin-bottom:1.5pt}
.print-fiche-meta-value{font-size:9pt;font-weight:bold;color:#222}
.print-fiche-section{margin-bottom:8pt}
.print-fiche-section-label{font-size:6.5pt;text-transform:uppercase;letter-spacing:.14em;color:#999;font-family:Arial,sans-serif;margin-bottom:3pt}
.print-fiche-body{font-size:9.5pt;line-height:1.55;color:#222;margin:0}
.print-fiche-apprentissage{background:#FAEAE7;border-left:3pt solid #D46A54;padding:7pt 10pt;border-radius:0 3pt 3pt 0;margin-top:8pt}
.print-fiche-apprentissage-text{font-size:9.5pt;font-style:italic;color:#333;margin:0;line-height:1.5}
.print-texte-libre{border-left:3pt solid #D46A54;padding:8pt 12pt;margin-bottom:14pt;background:#faf8f4;border-radius:0 3pt 3pt 0;font-style:italic;font-size:10.5pt;color:#444;line-height:1.6;page-break-inside:avoid}
.print-texte-libre p{margin:0}
.print-qrcode{display:flex;flex-direction:column;align-items:center;gap:8pt;padding:10pt 0 14pt;margin-bottom:14pt;border-bottom:.5pt solid #e0ddd6;page-break-inside:avoid}
.print-qrcode-img{border:1pt solid #ddd;border-radius:3pt}
.print-qrcode-legende{font-size:9.5pt;color:#444;text-align:center;font-style:italic;margin:0}
.print-objectif{background:#f0f4fb;border-left:3pt solid #5b7ec8;padding:10pt 14pt;margin-bottom:14pt;border-radius:0 3pt 3pt 0;page-break-inside:avoid}
.print-objectif p{font-size:10.5pt;line-height:1.8;margin:0;color:#222}
.print-objectif-blank{border-bottom:1pt solid #aaa;min-width:50pt;display:inline-block;vertical-align:bottom}
.print-doc-footer{margin-top:20pt;padding-top:8pt;border-top:1pt solid #ddd;text-align:center;font-size:7.5pt;color:#aaa;font-family:Arial,sans-serif}
</style></head><body>
<div class="print-doc-header">
  <div class="print-doc-eyebrow">SEQUENCIA</div>
  <h1 class="print-doc-title">${esc(titreDoc)}</h1>
  <div class="print-doc-meta"><span>Exporté le ${esc(date)}</span>${dureeStr ? `<span class="print-doc-meta-sep">·</span><span>${esc(dureeStr)}</span>` : ""}</div>
</div>
${toc}${items}
<div class="print-doc-footer">${esc(titreDoc)}${dureeStr ? ` · ${esc(dureeStr)}` : ""}</div>
<script>window.addEventListener('load',function(){window.print();})</script>
</body></html>`;
}

const ENCART_TYPES = [
  { type: "texte",    icon: "✏",  label: "Texte libre",             desc: "Encart de texte personnalisé" },
  { type: "qrcode",  icon: "⬛", label: "QR code",                 desc: "Lien transformé en QR code imprimable" },
  { type: "objectif",icon: "◎",  label: "Objectif pédagogique",    desc: "À l'issue de… l'apprenant sera capable de…" },
];

export default function CartPanel({ panier, setPanier, panierOrdre, setPanierOrdre, toutesActivites, mobileOpen, onMobileClose, nbCorbeille, onOuvrirCorbeille, titreSeance, setTitreSeance }) {
  const [exportOuvert, setExportOuvert] = React.useState(false);
  const [encartMenuOuvert, setEncartMenuOuvert] = React.useState(false);

  const panierItems = panierOrdre
    .map(item => {
      if (item.type === "activite") {
        const activite = toutesActivites.find(a => a.id === item.id);
        return activite ? { ...item, activite } : null;
      }
      return item;
    })
    .filter(Boolean);

  const totalItems = panierItems.length;
  const totalActivites = panierItems.filter(i => i.type === "activite").length;
  const activitesPourExport = panierItems.filter(i => i.type === "activite").map(i => i.activite);

  // ── Durée totale ──────────────────────────────────────────────
  const dureeTotal = (() => {
    let min = 0, max = 0, hasProjet = false;
    for (const item of panierItems) {
      if (item.type === "activite") {
        const { min: dMin, max: dMax, hasProjet: hp } = parseDureeActivite(item.activite);
        min += dMin; max += dMax;
        if (hp) hasProjet = true;
      } else if ((item.duree ?? 0) > 0) {
        min += item.duree;
        max += item.duree;
      }
    }
    return { min, max, hasProjet };
  })();

  const afficherDuree = dureeTotal.min > 0 || dureeTotal.max > 0 || dureeTotal.hasProjet;

  // ── Actions panier ─────────────────────────────────────────────

  function retirer(id) {
    setPanier(prev => { const next = new Set(prev); next.delete(id); return next; });
    setPanierOrdre(prev => prev.filter(item => !(item.type === "activite" && item.id === id)));
  }

  function viderPanier() {
    setPanier(new Set());
    setPanierOrdre([]);
  }

  function monter(index) {
    if (index === 0) return;
    setPanierOrdre(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function descendre(index) {
    if (index === totalItems - 1) return;
    setPanierOrdre(prev => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function ajouterEncartDeType(type) {
    const id = `${type.toUpperCase()}-${Date.now()}`;
    let item;
    if (type === "texte")    item = { type, id, contenu: "", duree: 0 };
    if (type === "qrcode")   item = { type, id, url: "", legende: "", duree: 0 };
    if (type === "objectif") item = { type, id, champ1: "", champ2: "", champ3: "", duree: 0 };
    setPanierOrdre(prev => [...prev, item]);
    setEncartMenuOuvert(false);
  }

  function updateEncartField(id, field, value) {
    setPanierOrdre(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }

  function supprimerEncart(id) {
    setPanierOrdre(prev => prev.filter(item => item.type === "activite" || item.id !== id));
  }

  // ── Impression ──────────────────────────────────────────────────

  function handlePrint() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      const html = generatePrintHTML(panierItems, titreSeance);
      if (!html) return;
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (win) {
        setTimeout(() => URL.revokeObjectURL(url), 15000);
      } else {
        URL.revokeObjectURL(url);
        window.print();
      }
    } else {
      window.print();
    }
  }

  // ── Render d'un encart (non-activité) ─────────────────────────

  function renderEncart(item, i) {
    const dureeVal = item.duree ?? 0;

    const controls = (typeLabel) => (
      <div className="cart-texte-controls">
        <div className="cart-item-order">
          <button className="cart-order-btn" onClick={() => monter(i)} disabled={i === 0} title="Monter">↑</button>
          <button className="cart-order-btn" onClick={() => descendre(i)} disabled={i === totalItems - 1} title="Descendre">↓</button>
        </div>
        <span className="cart-encart-type-label">{typeLabel}</span>
        <button className="cart-item-remove" onClick={() => supprimerEncart(item.id)} title="Supprimer">×</button>
      </div>
    );

    const dureeField = (
      <div className="cart-texte-duree">
        <span className="cart-texte-duree-label">Durée</span>
        <div className="cart-texte-duree-row">
          <input
            type="number"
            className="cart-texte-duree-input"
            min="0"
            max="999"
            placeholder="0"
            value={dureeVal > 0 ? dureeVal : ""}
            onChange={e => {
              const v = parseInt(e.target.value, 10);
              updateEncartField(item.id, "duree", isNaN(v) || v < 0 ? 0 : v);
            }}
          />
          <span className="cart-texte-duree-unit">min</span>
        </div>
      </div>
    );

    if (item.type === "texte") {
      return (
        <div key={item.id} data-cart-idx={i} className="cart-texte">
          {controls("Texte")}
          <textarea
            className="cart-texte-input"
            placeholder="Encart de texte libre…"
            value={item.contenu}
            onChange={e => updateEncartField(item.id, "contenu", e.target.value)}
            rows={3}
          />
          {dureeField}
        </div>
      );
    }

    if (item.type === "qrcode") {
      return (
        <div key={item.id} data-cart-idx={i} className="cart-texte">
          {controls("QR code")}
          <input
            type="url"
            className="cart-qrcode-url"
            placeholder="https://…"
            value={item.url}
            onChange={e => updateEncartField(item.id, "url", e.target.value)}
          />
          {item.url.trim() && (
            isUrlHttps(item.url.trim()) ? (
              <div className="cart-qrcode-preview">
                <img
                  src={qrSrc(item.url.trim(), 140)}
                  alt="QR Code"
                  className="cart-qrcode-img"
                  width="140"
                  height="140"
                />
              </div>
            ) : (
              <div className="cart-qrcode-warning">⚠ L'URL doit commencer par https://</div>
            )
          )}
          <textarea
            className="cart-texte-input"
            placeholder="Légende (optionnel)…"
            value={item.legende}
            onChange={e => updateEncartField(item.id, "legende", e.target.value)}
            rows={2}
          />
          {dureeField}
        </div>
      );
    }

    if (item.type === "objectif") {
      return (
        <div key={item.id} data-cart-idx={i} className="cart-texte">
          {controls("Objectif")}
          <div className="cart-objectif-template">
            <span className="cart-objectif-sep">A l'issue de</span>
            <input
              className="cart-objectif-input"
              value={item.champ1}
              onChange={e => updateEncartField(item.id, "champ1", e.target.value)}
              placeholder="la formation…"
            />
            <span className="cart-objectif-sep">, l'apprenant sera capable de</span>
            <input
              className="cart-objectif-input"
              value={item.champ2}
              onChange={e => updateEncartField(item.id, "champ2", e.target.value)}
              placeholder="réaliser…"
            />
            <span className="cart-objectif-sep">. La compétence sera acquise si</span>
            <input
              className="cart-objectif-input"
              value={item.champ3}
              onChange={e => updateEncartField(item.id, "champ3", e.target.value)}
              placeholder="il/elle peut démontrer…"
            />
            <span className="cart-objectif-sep">.</span>
          </div>
          {dureeField}
        </div>
      );
    }

    return null;
  }

  return (
    <aside className={`panel panel-cart${mobileOpen ? " panel-open" : ""}`}>
      <div className="panel-header">
        <button className="panel-mobile-close" onClick={onMobileClose}>×</button>
        <h2 className="panel-title">Panier de séance</h2>
        <div className="panel-header-end">
          <span className="panel-subtitle">{totalActivites} activité{totalActivites !== 1 ? "s" : ""}</span>
          <button className="cart-panel-corbeille-btn" onClick={onOuvrirCorbeille} title="Corbeille">
            🗑 <span className="cart-panel-corbeille-count">{nbCorbeille}</span>
          </button>
        </div>
      </div>
      <div className="cart-titre-zone">
        <input
          type="text"
          className="cart-titre-input"
          placeholder="Titre de la séance…"
          value={titreSeance}
          onChange={e => setTitreSeance(e.target.value)}
          maxLength={100}
        />
      </div>
      <div className={`panel-body ${panierOrdre.length === 0 ? "panel-body-empty" : ""}`}>
        {panierOrdre.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⊕</div>
            <p className="empty-state-text">
              Épinglez des activités depuis le catalogue pour composer votre séance.
            </p>
            <p className="empty-state-hint">Cliquez sur une carte puis "Épingler" — ou glissez-la ici</p>
          </div>
        ) : (
          <>
          <div className="cart-list">
            {panierItems.map((item, i) => {
              if (item.type !== "activite") return renderEncart(item, i);
              const a = item.activite;
              return (
                <div key={a.id} data-cart-idx={i} className="cart-item">
                  <div className="cart-item-top">
                    <div className="cart-item-order">
                      <button className="cart-order-btn" onClick={() => monter(i)} disabled={i === 0} title="Monter">↑</button>
                      <span className="cart-item-num">{i + 1}</span>
                      <button className="cart-order-btn" onClick={() => descendre(i)} disabled={i === totalItems - 1} title="Descendre">↓</button>
                    </div>
                    <span className="cart-item-id">{a.id}</span>
                    <button className="cart-item-remove" onClick={() => retirer(a.id)} title="Retirer">×</button>
                  </div>
                  <div className="cart-item-titre">{a.titre}</div>
                  <div className="cart-item-meta">{a.duree}</div>
                </div>
              );
            })}

            {afficherDuree && (
              <div className="cart-duree-total">
                <span className="cart-duree-label">Durée estimée</span>
                <span className="cart-duree-value">
                  {dureeTotal.min === dureeTotal.max
                    ? formatMinutes(dureeTotal.min)
                    : `${formatMinutes(dureeTotal.min)} – ${formatMinutes(dureeTotal.max)}`}
                  {dureeTotal.hasProjet && <span className="cart-duree-projet"> + projet</span>}
                </span>
              </div>
            )}

            <div className="cart-encart-add">
              {encartMenuOuvert && (
                <div className="cart-encart-menu">
                  {ENCART_TYPES.map(({ type, icon, label, desc }) => (
                    <button
                      key={type}
                      className="cart-encart-menu-item"
                      onClick={() => ajouterEncartDeType(type)}
                    >
                      <span className="cart-encart-menu-icon">{icon}</span>
                      <div>
                        <div className="cart-encart-menu-label">{label}</div>
                        <div className="cart-encart-menu-desc">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button
                className={`btn-reset cart-encart-btn${encartMenuOuvert ? " cart-encart-btn-open" : ""}`}
                onClick={() => setEncartMenuOuvert(v => !v)}
              >
                ＋ Ajouter un encart {encartMenuOuvert ? "▲" : "▼"}
              </button>
            </div>

            {totalItems > 1 && (
              <button className="btn-reset cart-vider" onClick={viderPanier}>
                Vider le panier
              </button>
            )}
          </div>
          </>
        )}
      </div>
      <div className="panel-footer">
        {totalActivites === 0 ? (
          <div className="panel-footer-actions">
            <button className="btn btn-disabled" disabled>Exporter</button>
            <button className="btn btn-disabled" disabled>Imprimer / PDF</button>
          </div>
        ) : (
          <div className="panel-footer-actions">
            <div className="export-wrapper">
              <button className="btn" onClick={() => setExportOuvert(v => !v)}>
                {exportOuvert ? "Fermer ▲" : "Exporter ▼"}
              </button>
              {exportOuvert && (
                <div className="export-menu">
                  <button className="export-option" onClick={() => { exportJSON(activitesPourExport, titreSeance); setExportOuvert(false); }}>
                    <span className="export-option-icon">&#123;&#125;</span>
                    <div>
                      <div className="export-option-label">JSON</div>
                      <div className="export-option-desc">Toutes les données · seance-ia.json</div>
                    </div>
                  </button>
                  <button className="export-option" onClick={() => { exportMarkdown(activitesPourExport, titreSeance); setExportOuvert(false); }}>
                    <span className="export-option-icon">&#9776;</span>
                    <div>
                      <div className="export-option-label">Markdown</div>
                      <div className="export-option-desc">Fiche lisible · seance-ia.md</div>
                    </div>
                  </button>
                  <button className="export-option" onClick={() => { exportCSV(activitesPourExport, titreSeance); setExportOuvert(false); }}>
                    <span className="export-option-icon">&#9783;</span>
                    <div>
                      <div className="export-option-label">CSV</div>
                      <div className="export-option-desc">Tableau Excel · seance-ia.csv</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
            <button className="btn btn-print" onClick={handlePrint}>
              &#128438; Imprimer / PDF
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
