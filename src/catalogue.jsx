import React, { useState, useMemo, useEffect } from "react";

import ACTIVITES_NATIVES from "./data/activites.json";
import { FILTRES_INIT, applyFilters } from "./utils/filters";
import { KEYS, loadJSON, saveJSON } from "./utils/storage";
import { genererIdActivite, ChoixImportModal, ImportFichierModal, ActivityFormModal } from "./components/AddActivityModal";
import Header from "./components/Header";
import FilterPanel from "./components/FilterPanel";
import CartPanel from "./components/CartPanel";
import DetailModal from "./components/DetailModal";
import PrintView from "./components/PrintView";
import CorbeillModal from "./components/CorbeillModal";
import { ActivityCard } from "./components/ActivityCard";

import "./styles/global.css";

export default function Catalogue() {
  const [selected, setSelected] = useState(null);
  const [filtres, setFiltres] = useState(FILTRES_INIT);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(null);
  const [showChoixImport, setShowChoixImport] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCorbeille, setShowCorbeille] = useState(false);
  const [editingActivite, setEditingActivite] = useState(null);

  const [activites, setActivites] = useState(() => {
    const unified = loadJSON(KEYS.activites, null);
    if (Array.isArray(unified)) return unified;
    // Migration depuis l'ancien format split natives/custom
    const natives = loadJSON("catalogue_activites_natives", []);
    const custom = loadJSON("catalogue_custom_activites", []);
    return [
      ...(Array.isArray(natives) ? natives : []),
      ...(Array.isArray(custom) ? custom : []),
    ];
  });

  const [panier, setPanier] = useState(() => {
    const raw = loadJSON(KEYS.panier, []);
    if (!Array.isArray(raw)) return new Set();
    const ids = raw
      .map(item => typeof item === "string" ? item : (item.type === "activite" ? item.id : null))
      .filter(Boolean);
    return new Set(ids);
  });
  const [panierOrdre, setPanierOrdre] = useState(() => {
    const raw = loadJSON(KEYS.panier, []);
    if (!Array.isArray(raw)) return [];
    return raw.map(item => typeof item === "string" ? { type: "activite", id: item } : item);
  });

  const [corbeille, setCorbeille] = useState(() => {
    const data = loadJSON(KEYS.corbeille, []);
    return Array.isArray(data) ? data : [];
  });

  useEffect(() => { saveJSON(KEYS.panier, panierOrdre); }, [panierOrdre]);
  useEffect(() => { saveJSON(KEYS.activites, activites); }, [activites]);
  useEffect(() => { saveJSON(KEYS.corbeille, corbeille); }, [corbeille]);

  const tousThemes = useMemo(() => {
    const set = new Set();
    for (const a of activites) {
      if (Array.isArray(a.themes)) a.themes.forEach(t => set.add(t));
    }
    return [...set];
  }, [activites]);

  const activitesFiltrees = useMemo(
    () => applyFilters(activites, filtres),
    [filtres, activites]
  );

  const panierAffichage = panierOrdre
    .map(item => {
      if (item.type === "activite") {
        const activite = activites.find(a => a.id === item.id);
        return activite ? { ...item, activite } : null;
      }
      return item;
    })
    .filter(Boolean);

  function handleSaveActivite(formData) {
    const id = genererIdActivite(activites);
    const nouvelleActivite = {
      id,
      titre: formData.titre.trim(),
      public: formData.public,
      duree: formData.duree,
      duree_detail: formData.duree_detail.trim() || null,
      groupe: formData.groupe,
      themes: formData.themes,
      contexte: formData.contexte,
      description_courte: formData.description_courte.trim(),
      description: formData.description.trim(),
      apprentissage_cle: formData.apprentissage_cle.trim(),
    };
    setActivites(prev => [...prev, nouvelleActivite]);
    setShowAddModal(false);
  }

  function handleImportActivites(nouvellesActivites) {
    const ids = new Set(activites.map(a => a.id));
    const nums = activites
      .map(a => { const m = a.id.match(/^CUS-(\d+)$/); return m ? parseInt(m[1], 10) : 0; })
      .filter(Boolean);
    let nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;

    const activitesAvecIds = nouvellesActivites.map(a => {
      let id = a.id;
      if (!id || ids.has(id)) {
        id = `CUS-${String(nextNum).padStart(3, "0")}`;
        nextNum++;
      }
      ids.add(id);
      return { ...a, id };
    });

    setActivites(prev => [...prev, ...activitesAvecIds]);
    setShowImportModal(false);
  }

  function pousserEnCorbeille(type, activite) {
    setCorbeille(prev => [
      ...prev,
      {
        id: `TRASH-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        date: new Date().toISOString(),
        activite,
      },
    ]);
  }

  function handleUpdateActivite(formData) {
    const id = editingActivite.id;
    const originale = activites.find(a => a.id === id);
    if (originale) pousserEnCorbeille("modification", originale);
    const activiteMiseAJour = {
      id,
      titre: formData.titre.trim(),
      public: formData.public,
      duree: formData.duree,
      duree_detail: formData.duree_detail.trim() || null,
      groupe: formData.groupe,
      themes: formData.themes,
      contexte: formData.contexte,
      description_courte: formData.description_courte.trim(),
      description: formData.description.trim(),
      apprentissage_cle: formData.apprentissage_cle.trim(),
    };
    setActivites(prev => prev.map(a => a.id === id ? activiteMiseAJour : a));
    setEditingActivite(null);
  }

  function handleDeleteActivite(id) {
    const activite = activites.find(a => a.id === id);
    if (activite) pousserEnCorbeille("suppression", activite);
    setActivites(prev => prev.filter(a => a.id !== id));
    setPanier(prev => { const next = new Set(prev); next.delete(id); return next; });
    setPanierOrdre(prev => prev.filter(item => !(item.type === "activite" && item.id === id)));
  }

  function handleRestoreFromCorbeille(trashId) {
    const entry = corbeille.find(e => e.id === trashId);
    if (!entry) return;
    const { activite } = entry;
    setActivites(prev => {
      const idx = prev.findIndex(a => a.id === activite.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = activite; return next; }
      return [...prev, activite];
    });
    setCorbeille(prev => prev.filter(e => e.id !== trashId));
  }

  function handleRestoreTout() {
    const parId = new Map();
    for (const entry of corbeille) {
      const id = entry.activite.id;
      if (!parId.has(id) || new Date(entry.date) < new Date(parId.get(id).date)) {
        parId.set(id, entry);
      }
    }
    setActivites(prev => {
      let next = [...prev];
      for (const entry of parId.values()) {
        const idx = next.findIndex(a => a.id === entry.activite.id);
        if (idx >= 0) next[idx] = entry.activite;
        else next.push(entry.activite);
      }
      return next;
    });
    setCorbeille([]);
  }

  function handleDeleteFromCorbeille(trashId) {
    setCorbeille(prev => prev.filter(e => e.id !== trashId));
  }

  function handleViderCorbeille() {
    setCorbeille([]);
  }

  function handleViderCatalogue() {
    if (!window.confirm(
      `Vider le catalogue ?\n\nLes ${activites.length} activité${activites.length > 1 ? "s" : ""} seront supprimées. Le panier sera également vidé.`
    )) return;
    setActivites([]);
    setPanier(new Set());
    setPanierOrdre([]);
  }

  function handleChargerCatalogueBase() {
    const existingIds = new Set(activites.map(a => a.id));
    const nouvelles = ACTIVITES_NATIVES.filter(a => !existingIds.has(a.id));
    if (nouvelles.length > 0) {
      setActivites(prev => [...prev, ...nouvelles]);
    }
    setShowChoixImport(false);
  }

  return (
    <div className="app">
      <PrintView panierAffichage={panierAffichage} />
      <Header
        totalActivites={activites.length}
        filteredCount={activitesFiltrees.length}
        onNouvelleActivite={() => setShowChoixImport(true)}
        onViderCatalogue={handleViderCatalogue}
      />
      {mobilePanelOpen && (
        <div className="mobile-backdrop" onClick={() => setMobilePanelOpen(null)} />
      )}
      <div className="layout">
        <FilterPanel
          filtres={filtres}
          setFiltres={setFiltres}
          filteredCount={activitesFiltrees.length}
          totalActivites={activites.length}
          tousThemes={tousThemes}
          mobileOpen={mobilePanelOpen === "filters"}
          onMobileClose={() => setMobilePanelOpen(null)}
        />
        <main className="main">
          {activites.length === 0 ? (
            <div className="empty-catalogue">
              <p className="empty-catalogue-title">Votre catalogue est vide</p>
              <p className="empty-catalogue-hint">Chargez le catalogue de base ou ajoutez vos propres activités.</p>
              <button className="btn empty-catalogue-btn" onClick={() => setShowChoixImport(true)}>+ Ajouter des activités</button>
            </div>
          ) : activitesFiltrees.length === 0 ? (
            <div className="no-results">
              <p className="no-results-title">Aucune activité ne correspond à ces filtres.</p>
              <p className="no-results-hint">Essayez de réduire le nombre de critères sélectionnés.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {activitesFiltrees.map(a => (
                <ActivityCard
                  key={a.id}
                  activite={a}
                  onClick={setSelected}
                  estEpingle={panier.has(a.id)}
                />
              ))}
            </div>
          )}
          <footer className="app-footer">
            <p>Catalogue · {activites.length} activité{activites.length !== 1 ? "s" : ""} · {activitesFiltrees.length} affichées</p>
          </footer>
        </main>
        <CartPanel
          panier={panier}
          setPanier={setPanier}
          panierOrdre={panierOrdre}
          setPanierOrdre={setPanierOrdre}
          toutesActivites={activites}
          mobileOpen={mobilePanelOpen === "cart"}
          onMobileClose={() => setMobilePanelOpen(null)}
          nbCorbeille={corbeille.length}
          onOuvrirCorbeille={() => setShowCorbeille(true)}
        />
      </div>

      <div className="mobile-toolbar">
        <button
          className={`mobile-toolbar-btn${mobilePanelOpen === "filters" ? " mobile-toolbar-btn-active" : ""}`}
          onClick={() => setMobilePanelOpen(mobilePanelOpen === "filters" ? null : "filters")}
        >
          ⚙ Filtres
          {(Object.entries(filtres).filter(([k]) => k !== "search").some(([, a]) => a.length > 0) || filtres.search.trim()) && (
            <span className="mobile-toolbar-badge">
              {Object.entries(filtres).filter(([k]) => k !== "search").reduce((n, [, a]) => n + a.length, 0) + (filtres.search.trim() ? 1 : 0)}
            </span>
          )}
        </button>
        <button
          className={`mobile-toolbar-btn${mobilePanelOpen === "cart" ? " mobile-toolbar-btn-active" : ""}`}
          onClick={() => setMobilePanelOpen(mobilePanelOpen === "cart" ? null : "cart")}
        >
          📋 Panier
          {panier.size > 0 && <span className="mobile-toolbar-badge">{panier.size}</span>}
        </button>
        <button
          className="mobile-toolbar-btn"
          onClick={() => setShowCorbeille(true)}
        >
          🗑 Corbeille
          <span className="mobile-toolbar-badge mobile-toolbar-badge-corbeille">{corbeille.length}</span>
        </button>
      </div>

      {selected && (
        <DetailModal
          activite={selected}
          onClose={() => setSelected(null)}
          panier={panier}
          setPanier={setPanier}
          panierOrdre={panierOrdre}
          setPanierOrdre={setPanierOrdre}
          onEdit={a => { setEditingActivite(a); setShowAddModal(true); }}
          onDelete={handleDeleteActivite}
        />
      )}

      {showChoixImport && (
        <ChoixImportModal
          onClose={() => setShowChoixImport(false)}
          onManuel={() => { setShowChoixImport(false); setShowAddModal(true); }}
          onImport={() => { setShowChoixImport(false); setShowImportModal(true); }}
          onChargerCatalogueBase={handleChargerCatalogueBase}
        />
      )}

      {showImportModal && (
        <ImportFichierModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportActivites}
        />
      )}

      {(showAddModal || editingActivite) && (
        <ActivityFormModal
          onClose={() => { setShowAddModal(false); setEditingActivite(null); }}
          onSave={editingActivite ? handleUpdateActivite : handleSaveActivite}
          tousThemes={tousThemes}
          initialData={editingActivite}
        />
      )}

      {showCorbeille && (
        <CorbeillModal
          corbeille={corbeille}
          onRestore={handleRestoreFromCorbeille}
          onDeleteEntry={handleDeleteFromCorbeille}
          onRestoreTout={handleRestoreTout}
          onVider={handleViderCorbeille}
          onClose={() => setShowCorbeille(false)}
        />
      )}
    </div>
  );
}
