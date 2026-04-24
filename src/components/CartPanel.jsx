import React from "react";
import { exportJSON, exportMarkdown, exportCSV } from "../utils/export";
import "../styles/cart.css";

export default function CartPanel({ panier, setPanier, panierOrdre, setPanierOrdre, toutesActivites }) {
  const [exportOuvert, setExportOuvert] = React.useState(false);
  const [dragCartIndex, setDragCartIndex] = React.useState(null);
  const [dragOverCartIndex, setDragOverCartIndex] = React.useState(null);
  const [cartDropActive, setCartDropActive] = React.useState(false);
  const panelRef = React.useRef(null);

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
    setPanierOrdre(prev => [...prev, { type: "texte", id: `TEXT-${Date.now()}`, contenu: "" }]);
  }

  function updateEncart(id, contenu) {
    setPanierOrdre(prev => prev.map(item =>
      item.type === "texte" && item.id === id ? { ...item, contenu } : item
    ));
  }

  function supprimerEncart(id) {
    setPanierOrdre(prev => prev.filter(item => !(item.type === "texte" && item.id === id)));
  }

  // ── Drag depuis le catalogue vers le panier ────────────────────

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

  // ── Drag interne au panier (réordonnancement) ──────────────────

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

  return (
    <aside
      ref={panelRef}
      className={`panel panel-cart ${cartDropActive ? "panel-cart-drop-active" : ""}`}
      onDragOver={handlePanelDragOver}
      onDragLeave={handlePanelDragLeave}
      onDrop={handlePanelDrop}
    >
      <div className="panel-header">
        <h2 className="panel-title">Panier de séance</h2>
        <span className="panel-subtitle">{totalActivites} activité{totalActivites !== 1 ? "s" : ""}</span>
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
          <div className="cart-list">
            {panierItems.map((item, i) => {
              const isDragging = dragCartIndex === i;
              const isDragOver = dragOverCartIndex === i && dragCartIndex !== i;

              if (item.type === "texte") {
                return (
                  <div
                    key={item.id}
                    className={`cart-texte${isDragging ? " cart-item-dragging" : ""}${isDragOver ? " cart-item-drag-over" : ""}`}
                    draggable
                    onDragStart={(e) => handleItemDragStart(e, i)}
                    onDragOver={(e) => handleItemDragOver(e, i)}
                    onDrop={(e) => handleItemDrop(e, i)}
                    onDragEnd={handleItemDragEnd}
                  >
                    <div className="cart-texte-controls">
                      <span className="cart-drag-handle" title="Déplacer">⠿</span>
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
                  </div>
                );
              }

              const a = item.activite;
              return (
                <div
                  key={a.id}
                  className={`cart-item${isDragging ? " cart-item-dragging" : ""}${isDragOver ? " cart-item-drag-over" : ""}`}
                  draggable
                  onDragStart={(e) => handleItemDragStart(e, i)}
                  onDragOver={(e) => handleItemDragOver(e, i)}
                  onDrop={(e) => handleItemDrop(e, i)}
                  onDragEnd={handleItemDragEnd}
                >
                  <div className="cart-item-top">
                    <span className="cart-drag-handle" title="Déplacer">⠿</span>
                    <div className="cart-item-order">
                      <button className="cart-order-btn" onClick={() => monter(i)} disabled={i === 0} title="Monter">↑</button>
                      <span className="cart-item-num">{i + 1}</span>
                      <button className="cart-order-btn" onClick={() => descendre(i)} disabled={i === totalItems - 1} title="Descendre">↓</button>
                    </div>
                    <span className="cart-item-id">{a.id}</span>
                    <button className="cart-item-remove" onClick={() => retirer(a.id)} title="Retirer">×</button>
                  </div>
                  <div className="cart-item-titre">{a.titre}</div>
                  <div className="cart-item-meta">{a.duree} · {a.groupe.join(", ")} · {a.preparation}</div>
                </div>
              );
            })}
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
            <button className="btn btn-print" onClick={() => window.print()}>
              &#128438; Imprimer / PDF
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
