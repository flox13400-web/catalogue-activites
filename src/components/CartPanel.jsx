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
  const minutes = parseDureeString(activite.duree_detail || activite.duree);
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

function generatePrintHTML(panierItems) {
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
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
    const a = item.activite;
    return `<div class="print-fiche">
<div class="print-fiche-header"><div class="print-fiche-header-left"><span class="print-fiche-num">${item.num}</span><div><h2 class="print-fiche-titre">${esc(a.titre)}</h2><span class="print-fiche-id">${esc(a.id)}</span></div></div></div>
<div class="print-fiche-meta-grid">
<div class="print-fiche-meta-item"><div class="print-fiche-meta-label">Durée</div><div class="print-fiche-meta-value">${esc(a.duree_detail || a.duree)}</div></div>
<div class="print-fiche-meta-item"><div class="print-fiche-meta-label">Public</div><div class="print-fiche-meta-value">${esc(a.public.join(", "))}</div></div>
<div class="print-fiche-meta-item"><div class="print-fiche-meta-label">Taille groupe</div><div class="print-fiche-meta-value">${esc(a.groupe.join(", "))}</div></div>
<div class="print-fiche-meta-item"><div class="print-fiche-meta-label">Thèmes</div><div class="print-fiche-meta-value">${esc(a.themes.join(", "))}</div></div>
<div class="print-fiche-meta-item"><div class="print-fiche-meta-label">Contexte</div><div class="print-fiche-meta-value">${esc(a.contexte.join(", "))}</div></div>
</div>
<div class="print-fiche-section"><div class="print-fiche-section-label">Description</div><p class="print-fiche-body">${esc(a.description)}</p></div>
<div class="print-fiche-apprentissage"><div class="print-fiche-section-label">Apprentissage clé</div><p class="print-fiche-apprentissage-text">« ${esc(a.apprentissage_cle)} »</p></div>
</div>`;
  }).join("");

  const nbAct = activites.length;
  const plural = nbAct > 1 ? "s" : "";

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fiche de séance</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Georgia,'Times New Roman',serif;font-size:10.5pt;line-height:1.6;color:#111;background:#fff;padding:18mm 20mm}
@media print{@page{margin:18mm 20mm;size:A4}}
.print-doc-header{text-align:center;border-bottom:2px solid #1a1a1a;padding-bottom:14pt;margin-bottom:20pt}
.print-doc-eyebrow{font-size:7.5pt;text-transform:uppercase;letter-spacing:.2em;color:#666;margin-bottom:6pt}
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
.print-fiche-apprentissage{background:#f0ede6;border-left:3pt solid #a87a3f;padding:7pt 10pt;border-radius:0 3pt 3pt 0;margin-top:8pt}
.print-fiche-apprentissage-text{font-size:9.5pt;font-style:italic;color:#333;margin:0;line-height:1.5}
.print-texte-libre{border-left:3pt solid #d4a574;padding:8pt 12pt;margin-bottom:14pt;background:#faf8f4;border-radius:0 3pt 3pt 0;font-style:italic;font-size:10.5pt;color:#444;line-height:1.6;page-break-inside:avoid}
.print-texte-libre p{margin:0}
.print-doc-footer{margin-top:20pt;padding-top:8pt;border-top:1pt solid #ddd;text-align:center;font-size:7.5pt;color:#aaa;font-family:Arial,sans-serif}
</style></head><body>
<div class="print-doc-header">
  <div class="print-doc-eyebrow">Ressources pédagogiques · IA générative</div>
  <h1 class="print-doc-title">Fiche de séance</h1>
  <div class="print-doc-meta"><span>Exporté le ${esc(date)}</span><span class="print-doc-meta-sep">·</span><span>${nbAct} activité${plural}</span></div>
</div>
${toc}${items}
<div class="print-doc-footer">Catalogue d'activités pédagogiques · IA générative — ${nbAct} activité${plural}</div>
<script>window.addEventListener('load',function(){window.print();})</script>
</body></html>`;
}

export default function CartPanel({ panier, setPanier, panierOrdre, setPanierOrdre, toutesActivites, mobileOpen, onMobileClose, nbCorbeille, onOuvrirCorbeille }) {
  const [exportOuvert, setExportOuvert] = React.useState(false);
  const [dragCartIndex, setDragCartIndex] = React.useState(null);
  const [dragOverCartIndex, setDragOverCartIndex] = React.useState(null);
  const [cartDropActive, setCartDropActive] = React.useState(false);
  const panelRef = React.useRef(null);
  const cartListRef = React.useRef(null);
  const touchDragRef = React.useRef({ fromIndex: null });

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
      } else if (item.type === "texte" && (item.duree ?? 0) > 0) {
        min += item.duree;
        max += item.duree;
      }
    }
    return { min, max, hasProjet };
  })();

  const afficherDuree = dureeTotal.min > 0 || dureeTotal.max > 0 || dureeTotal.hasProjet;

  // ── Listener touchmove non-passif (pour preventDefault pendant drag) ──
  React.useEffect(() => {
    const list = cartListRef.current;
    if (!list) return;
    const handleTouchMove = (e) => {
      if (touchDragRef.current.fromIndex === null) return;
      e.preventDefault();
      const touch = e.touches[0];
      const itemEls = list.querySelectorAll("[data-cart-idx]");
      for (const el of itemEls) {
        const rect = el.getBoundingClientRect();
        if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          const idx = parseInt(el.dataset.cartIdx, 10);
          setDragOverCartIndex(idx);
          break;
        }
      }
    };
    list.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => list.removeEventListener("touchmove", handleTouchMove);
  }, [panierOrdre.length]);

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

  function ajouterEncart() {
    setPanierOrdre(prev => [...prev, { type: "texte", id: `TEXT-${Date.now()}`, contenu: "", duree: 0 }]);
  }

  function updateEncart(id, contenu) {
    setPanierOrdre(prev => prev.map(item =>
      item.type === "texte" && item.id === id ? { ...item, contenu } : item
    ));
  }

  function updateEncartDuree(id, duree) {
    setPanierOrdre(prev => prev.map(item =>
      item.type === "texte" && item.id === id ? { ...item, duree } : item
    ));
  }

  function supprimerEncart(id) {
    setPanierOrdre(prev => prev.filter(item => !(item.type === "texte" && item.id === id)));
  }

  // ── Impression ─────────────────────────────────────────────────

  function handlePrint() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      const html = generatePrintHTML(panierItems);
      if (!html) return;
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
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

  // ── Drag depuis le catalogue ───────────────────────────────────

  function handlePanelDragOver(e) {
    if (e.dataTransfer.types.includes("text/activity-id")) {
      e.preventDefault();
      setCartDropActive(true);
    }
  }

  function handlePanelDragLeave(e) {
    if (!panelRef.current?.contains(e.relatedTarget)) {
      setCartDropActive(false);
    }
  }

  function handlePanelDrop(e) {
    const activityId = e.dataTransfer.getData("text/activity-id");
    if (activityId && !panier.has(activityId)) {
      setPanier(prev => new Set([...prev, activityId]));
      setPanierOrdre(prev => [...prev, { type: "activite", id: activityId }]);
    }
    setCartDropActive(false);
  }

  // ── Drag interne souris (réordonnancement) ────────────────────

  function handleItemDragStart(e, i) {
    setDragCartIndex(i);
    e.dataTransfer.setData("text/cart-index", String(i));
    e.dataTransfer.effectAllowed = "move";
  }

  function handleItemDragOver(e, i) {
    e.preventDefault();
    if (dragOverCartIndex !== i) setDragOverCartIndex(i);
  }

  function handleItemDrop(e, i) {
    e.preventDefault();
    e.stopPropagation();
    const cartIndexStr = e.dataTransfer.getData("text/cart-index");
    const activityId = e.dataTransfer.getData("text/activity-id");

    if (cartIndexStr !== "") {
      const fromIndex = parseInt(cartIndexStr, 10);
      if (fromIndex !== i) {
        setPanierOrdre(prev => {
          const next = [...prev];
          const [removed] = next.splice(fromIndex, 1);
          next.splice(i, 0, removed);
          return next;
        });
      }
    } else if (activityId && !panier.has(activityId)) {
      setPanier(prev => new Set([...prev, activityId]));
      setPanierOrdre(prev => {
        const next = [...prev];
        next.splice(i, 0, { type: "activite", id: activityId });
        return next;
      });
    }

    setDragCartIndex(null);
    setDragOverCartIndex(null);
    setCartDropActive(false);
  }

  function handleItemDragEnd() {
    setDragCartIndex(null);
    setDragOverCartIndex(null);
  }

  // ── Drag interne tactile (réordonnancement) ───────────────────

  function handleDragHandleTouchStart(e, i) {
    touchDragRef.current.fromIndex = i;
    setDragCartIndex(i);
  }

  function handleCartListTouchEnd(e) {
    const fromIndex = touchDragRef.current.fromIndex;
    touchDragRef.current.fromIndex = null;
    if (fromIndex === null) return;

    const touch = e.changedTouches[0];
    let toIndex = fromIndex;

    if (cartListRef.current) {
      const itemEls = cartListRef.current.querySelectorAll("[data-cart-idx]");
      for (const el of itemEls) {
        const rect = el.getBoundingClientRect();
        if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          toIndex = parseInt(el.dataset.cartIdx, 10);
          break;
        }
      }
    }

    if (fromIndex !== toIndex) {
      setPanierOrdre(prev => {
        const next = [...prev];
        const [removed] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, removed);
        return next;
      });
    }

    setDragCartIndex(null);
    setDragOverCartIndex(null);
  }

  return (
    <aside
      ref={panelRef}
      className={`panel panel-cart${mobileOpen ? " panel-open" : ""}${cartDropActive ? " panel-cart-drop-active" : ""}`}
      onDragOver={handlePanelDragOver}
      onDragLeave={handlePanelDragLeave}
      onDrop={handlePanelDrop}
    >
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
          <div
            className="cart-list"
            ref={cartListRef}
            onTouchEnd={handleCartListTouchEnd}
          >
            {panierItems.map((item, i) => {
              const isDragging = dragCartIndex === i;
              const isDragOver = dragOverCartIndex === i && dragCartIndex !== i;

              if (item.type === "texte") {
                const dureeVal = item.duree ?? 0;
                return (
                  <div
                    key={item.id}
                    data-cart-idx={i}
                    className={`cart-texte${isDragging ? " cart-item-dragging" : ""}${isDragOver ? " cart-item-drag-over" : ""}`}
                    draggable
                    onDragStart={(e) => handleItemDragStart(e, i)}
                    onDragOver={(e) => handleItemDragOver(e, i)}
                    onDrop={(e) => handleItemDrop(e, i)}
                    onDragEnd={handleItemDragEnd}
                  >
                    <div className="cart-texte-controls">
                      <span
                        className="cart-drag-handle"
                        title="Déplacer"
                        onTouchStart={(e) => handleDragHandleTouchStart(e, i)}
                      >⠿</span>
                      <div className="cart-item-order">
                        <button className="cart-order-btn" onClick={() => monter(i)} disabled={i === 0} title="Monter">↑</button>
                        <button className="cart-order-btn" onClick={() => descendre(i)} disabled={i === totalItems - 1} title="Descendre">↓</button>
                      </div>
                      <button className="cart-item-remove" onClick={() => supprimerEncart(item.id)} title="Supprimer">×</button>
                    </div>
                    <textarea
                      className="cart-texte-input"
                      placeholder="Encart de texte libre…"
                      value={item.contenu}
                      onChange={e => updateEncart(item.id, e.target.value)}
                      rows={3}
                    />
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
                            updateEncartDuree(item.id, isNaN(v) || v < 0 ? 0 : v);
                          }}
                        />
                        <span className="cart-texte-duree-unit">min</span>
                      </div>
                    </div>
                  </div>
                );
              }

              const a = item.activite;
              return (
                <div
                  key={a.id}
                  data-cart-idx={i}
                  className={`cart-item${isDragging ? " cart-item-dragging" : ""}${isDragOver ? " cart-item-drag-over" : ""}`}
                  draggable
                  onDragStart={(e) => handleItemDragStart(e, i)}
                  onDragOver={(e) => handleItemDragOver(e, i)}
                  onDrop={(e) => handleItemDrop(e, i)}
                  onDragEnd={handleItemDragEnd}
                >
                  <div className="cart-item-top">
                    <span
                      className="cart-drag-handle"
                      title="Déplacer"
                      onTouchStart={(e) => handleDragHandleTouchStart(e, i)}
                    >⠿</span>
                    <div className="cart-item-order">
                      <button className="cart-order-btn" onClick={() => monter(i)} disabled={i === 0} title="Monter">↑</button>
                      <span className="cart-item-num">{i + 1}</span>
                      <button className="cart-order-btn" onClick={() => descendre(i)} disabled={i === totalItems - 1} title="Descendre">↓</button>
                    </div>
                    <span className="cart-item-id">{a.id}</span>
                    <button className="cart-item-remove" onClick={() => retirer(a.id)} title="Retirer">×</button>
                  </div>
                  <div className="cart-item-titre">{a.titre}</div>
                  <div className="cart-item-meta">{a.duree_detail || a.duree} · {a.groupe.join(", ")}</div>
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

            <button className="btn-reset cart-encart-btn" onClick={ajouterEncart}>
              ＋ Ajouter un encart
            </button>
            {totalItems > 1 && (
              <button className="btn-reset cart-vider" onClick={viderPanier}>
                Vider le panier
              </button>
            )}
          </div>
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
                  <button className="export-option" onClick={() => { exportJSON(activitesPourExport); setExportOuvert(false); }}>
                    <span className="export-option-icon">&#123;&#125;</span>
                    <div>
                      <div className="export-option-label">JSON</div>
                      <div className="export-option-desc">Toutes les données · seance-ia.json</div>
                    </div>
                  </button>
                  <button className="export-option" onClick={() => { exportMarkdown(activitesPourExport); setExportOuvert(false); }}>
                    <span className="export-option-icon">&#9776;</span>
                    <div>
                      <div className="export-option-label">Markdown</div>
                      <div className="export-option-desc">Fiche lisible · seance-ia.md</div>
                    </div>
                  </button>
                  <button className="export-option" onClick={() => { exportCSV(activitesPourExport); setExportOuvert(false); }}>
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
