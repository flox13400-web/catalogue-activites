import React, { useState, useMemo, useEffect } from "react";

import { FILTRES_INIT, applyFilters } from "./utils/filters";
import { KEYS, loadJSON, saveJSON } from "./utils/storage";
import { exportCatalogue } from "./utils/export";
import { exportToSQA, importFromSQA } from "./utils/sqaManager";
import { genererIdActivite, ChoixImportModal, ImportFichierModal, ActivityFormModal } from "./components/AddActivityModal";
import Header from "./components/Header";
import FilterPanel from "./components/FilterPanel";
import SequenceBuilder, { PROGRAMME_INIT } from "./components/SequenceBuilder";
import DetailModal from "./components/DetailModal";
import PrintView from "./components/PrintView";
import CorbeillModal from "./components/CorbeillModal";
import { ActivityCard } from "./components/ActivityCard";
import ActiveFilterBadges from "./components/ActiveFilterBadges";
import AssignModal from "./components/AssignModal";

import "./styles/global.css";

export default function Catalogue() {
  const [selected, setSelected] = useState(null);
  const [filtres, setFiltres] = useState(FILTRES_INIT);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showChoixImport, setShowChoixImport] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCorbeille, setShowCorbeille] = useState(false);
  const [editingActivite, setEditingActivite] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);

  const [activites, setActivites] = useState(() => {
    const unified = loadJSON(KEYS.activites, null);
    if (Array.isArray(unified)) return unified;
    const natives = loadJSON("catalogue_activites_natives", []);
    const custom = loadJSON("catalogue_custom_activites", []);
    return [
      ...(Array.isArray(natives) ? natives : []),
      ...(Array.isArray(custom) ? custom : []),
    ];
  });

  const [programme, setProgramme] = useState(() => {
    const saved = loadJSON(KEYS.programme, null);
    if (saved && Array.isArray(saved.sequences)) return saved;
    return PROGRAMME_INIT;
  });

  const [corbeille, setCorbeille] = useState(() => {
    const data = loadJSON(KEYS.corbeille, []);
    return Array.isArray(data) ? data : [];
  });

  const [favoris, setFavoris] = useState(() => {
    const data = loadJSON(KEYS.favoris, []);
    return new Set(Array.isArray(data) ? data : []);
  });

  useEffect(() => { saveJSON(KEYS.activites, activites); }, [activites]);
  useEffect(() => { saveJSON(KEYS.corbeille, corbeille); }, [corbeille]);
  useEffect(() => { saveJSON(KEYS.favoris, [...favoris]); }, [favoris]);
  useEffect(() => { saveJSON(KEYS.programme, programme); }, [programme]);

  // IDs des activités présentes dans le programme (pour badge 📌 sur les cartes)
  const panier = useMemo(() => {
    const ids = new Set();
    for (const seq of programme.sequences ?? []) {
      for (const sea of seq.seances ?? []) {
        for (const fiche of sea.fiches ?? []) {
          if (fiche.activite_id) ids.add(fiche.activite_id);
        }
      }
    }
    return ids;
  }, [programme]);

  // Liste plate pour PrintView
  const panierAffichage = useMemo(() => {
    const items = [];
    for (const seq of programme.sequences ?? []) {
      for (const sea of seq.seances ?? []) {
        for (const fiche of sea.fiches ?? []) {
          const activite = activites.find(a => a.id === fiche.activite_id);
          if (activite) items.push({ type: "activite", id: fiche.activite_id, activite });
        }
      }
    }
    return items;
  }, [programme, activites]);

  const tousThemes = useMemo(() => {
    const set = new Set();
    for (const a of activites) {
      if (Array.isArray(a.themes)) a.themes.forEach(t => set.add(t));
    }
    return [...set];
  }, [activites]);

  const tousMaterialels = useMemo(() => {
    const set = new Set();
    for (const a of activites) {
      if (Array.isArray(a.materiels)) a.materiels.forEach(m => set.add(m));
    }
    return [...set];
  }, [activites]);

  const activitesFiltrees = useMemo(
    () => applyFilters(activites, filtres, favoris),
    [filtres, activites, favoris]
  );

  function toggleFavori(id) {
    setFavoris((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSaveActivite(formData) {
    const id = genererIdActivite(activites);
    const nouvelleActivite = {
      id,
      titre: formData.titre.trim(),
      age_public: formData.age_public,
      duree: formData.duree,
      duree_detail: formData.duree_detail.trim() || null,
      taille_groupe: formData.taille_groupe,
      themes: formData.themes,
      materiels: formData.materiels,
      contexte: formData.contexte,
      modalite: formData.modalite,
      description_courte: formData.description_courte.trim(),
      description: formData.description.trim(),
      apprentissage_cle: formData.apprentissage_cle.trim(),
      problematique: formData.problematique.trim() || null,
      remediation: formData.remediation.trim() || null,
      type_fiche: formData.type_fiche || "Activite_Apprentissage",
      verbe_action_bloom: formData.verbe_action_bloom || "",
      opo_activite: formData.opo_activite || "",
      eval_type: formData.eval_type || "",
      eval_modalite: formData.eval_modalite || "",
      eval_conditions: formData.eval_conditions || "",
      eval_criteres: formData.eval_criteres || "",
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
      age_public: formData.age_public,
      duree: formData.duree,
      duree_detail: formData.duree_detail.trim() || null,
      taille_groupe: formData.taille_groupe,
      themes: formData.themes,
      materiels: formData.materiels,
      contexte: formData.contexte,
      modalite: formData.modalite,
      description_courte: formData.description_courte.trim(),
      description: formData.description.trim(),
      apprentissage_cle: formData.apprentissage_cle.trim(),
      problematique: formData.problematique.trim() || null,
      remediation: formData.remediation.trim() || null,
      type_fiche: formData.type_fiche || "Activite_Apprentissage",
      verbe_action_bloom: formData.verbe_action_bloom || "",
      opo_activite: formData.opo_activite || "",
      eval_type: formData.eval_type || "",
      eval_modalite: formData.eval_modalite || "",
      eval_conditions: formData.eval_conditions || "",
      eval_criteres: formData.eval_criteres || "",
    };
    setActivites(prev => prev.map(a => a.id === id ? activiteMiseAJour : a));
    setEditingActivite(null);
  }

  function handleDeleteActivite(id) {
    const activite = activites.find(a => a.id === id);
    if (activite) pousserEnCorbeille("suppression", activite);
    setActivites(prev => prev.filter(a => a.id !== id));
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq => ({
        ...seq,
        seances: seq.seances.map(sea => ({
          ...sea,
          fiches: sea.fiches.filter(f => f.activite_id !== id),
        })),
      })),
    }));
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

  function handleSauvegarderCatalogue() {
    exportCatalogue(activites);
  }

  /**
   * Exporte l'état courant de programme vers un fichier .sqa sur le disque local.
   * Le dictionnaireActivites embarque les objets complets de toutes les activités
   * référencées dans le programme pour rendre l'archive autonome.
   */
  function handleExportSQA() {
    exportToSQA(programme, activites);
  }

  /**
   * Importe un fichier .sqa et déclenche DEUX mises à jour d'état immutables :
   * 1. Rechargement du programme dans SequenceBuilder (setProgramme).
   * 2. Ajout des activités manquantes dans le catalogue (setActivites).
   * Bloque l'import et affiche une alerte si le fichier est corrompu ou invalide.
   * @param {File} file - Fichier .sqa sélectionné par l'utilisateur.
   */
  function handleImportSQA(file) {
    importFromSQA(file)
      .then(({ programme: nouveauProgramme, nouvellesActivites }) => {
        // Mise à jour 1 : rechargement du constructeur de séquence
        setProgramme(nouveauProgramme);
        // Mise à jour 2 : ajout immutable des nouvelles activités dans le catalogue
        if (nouvellesActivites.length > 0) {
          setActivites((prev) => [...prev, ...nouvellesActivites]);
        }
      })
      .catch(() => {
        alert("Fichier .sqa corrompu ou invalide");
      });
  }

  function handleAssign(seaId) {
    if (!assignTarget) return;
    const ficheId = `fiche-${Date.now()}`;
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq => ({
        ...seq,
        seances: seq.seances.map(sea => {
          if (sea.id !== seaId) return sea;
          return {
            ...sea,
            fiches: [...sea.fiches, {
              id: ficheId,
              type_fiche: "Activite_Apprentissage",
              verbe_action_bloom: "",
              parent_id: seaId,
              activite_id: assignTarget,
            }],
          };
        }),
      })),
    }));
    setAssignTarget(null);
  }

  function handleViderCatalogue() {
    if (!window.confirm(
      `Vider le catalogue ?\n\nLes ${activites.length} activité${activites.length > 1 ? "s" : ""} seront supprimées. Le constructeur de séquence sera également vidé.`
    )) return;
    setActivites([]);
    setProgramme(prev => ({ ...prev, sequences: [] }));
  }

  return (
    <div className="app-layout">
      <PrintView programme={programme} activites={activites} />
      <Header
        totalActivites={activites.length}
        filteredCount={activitesFiltrees.length}
        onNouvelleActivite={() => setShowChoixImport(true)}
        onSauvegarderCatalogue={handleSauvegarderCatalogue}
        onViderCatalogue={handleViderCatalogue}
        nbCorbeille={corbeille.length}
        onOuvrirCorbeille={() => setShowCorbeille(true)}
        onExportSQA={handleExportSQA}
        onImportSQA={handleImportSQA}
      />
      {mobilePanelOpen && (
        <div className="mobile-backdrop" onClick={() => setMobilePanelOpen(null)} />
      )}
      <div className="app-body">
        <aside className={`app-filters ${isFilterOpen ? 'open' : 'closed'}`}>
          <FilterPanel
            filtres={filtres}
            setFiltres={setFiltres}
            filteredCount={activitesFiltrees.length}
            totalActivites={activites.length}
            tousThemes={tousThemes}
            tousMaterialels={tousMaterialels}
            mobileOpen={mobilePanelOpen === "filters"}
            onMobileClose={() => setMobilePanelOpen(null)}
          />
        </aside>
        <section className="app-catalogue">
          <div className="main-topbar">
              <button
                className="sidebar-toggle-btn"
                onClick={() => setIsFilterOpen(o => !o)}
                title={isFilterOpen ? "Masquer le panneau filtres" : "Afficher le panneau filtres"}
              >
                {isFilterOpen ? "« Filtres" : "Filtres »"}
              </button>
              <ActiveFilterBadges filtres={filtres} setFiltres={setFiltres} />
            </div>
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
                    estFavori={favoris.has(a.id)}
                    onToggleFavori={toggleFavori}
                    onAssigner={setAssignTarget}
                  />
                ))}
              </div>
            )}
            <footer className="app-footer">
              <p>Catalogue · {activites.length} activité{activites.length !== 1 ? "s" : ""} · {activitesFiltrees.length} affichées</p>
            </footer>
          </section>
        <main className="app-main">
          <SequenceBuilder
            programme={programme}
            setProgramme={setProgramme}
            toutesActivites={activites}
            mobileOpen={mobilePanelOpen === "cart"}
            onMobileClose={() => setMobilePanelOpen(null)}
          />
        </main>
      </div>

      <div className="mobile-toolbar">
        <button
          className={`mobile-toolbar-btn${mobilePanelOpen === "filters" ? " mobile-toolbar-btn-active" : ""}`}
          onClick={() => setMobilePanelOpen(mobilePanelOpen === "filters" ? null : "filters")}
        >
          ⚙ Filtres
          {(Object.entries(filtres).filter(([k]) => k !== "search" && k !== "favorisOnly").some(([, a]) => a.length > 0) || filtres.search.trim() || filtres.favorisOnly) && (
            <span className="mobile-toolbar-badge">
              {Object.entries(filtres).filter(([k]) => k !== "search" && k !== "favorisOnly").reduce((n, [, a]) => n + a.length, 0) + (filtres.search.trim() ? 1 : 0) + (filtres.favorisOnly ? 1 : 0)}
            </span>
          )}
        </button>
        <button
          className={`mobile-toolbar-btn${mobilePanelOpen === "cart" ? " mobile-toolbar-btn-active" : ""}`}
          onClick={() => setMobilePanelOpen(mobilePanelOpen === "cart" ? null : "cart")}
        >
          📋 Séquence
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
          estEpingle={panier.has(selected.id)}
          onAssigner={setAssignTarget}
          onEdit={a => { setEditingActivite(a); setShowAddModal(true); }}
          onDelete={handleDeleteActivite}
        />
      )}

      {assignTarget && (
        <AssignModal
          programme={programme}
          activiteId={assignTarget}
          toutesActivites={activites}
          onAssign={handleAssign}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {showChoixImport && (
        <ChoixImportModal
          onClose={() => setShowChoixImport(false)}
          onManuel={() => { setShowChoixImport(false); setShowAddModal(true); }}
          onImport={() => { setShowChoixImport(false); setShowImportModal(true); }}
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
          activites={activites}
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
