import React, { useState, useMemo, useEffect } from "react";

import ACTIVITES_NATIVES from "./data/activites.json";
import { PHASE_ORDER, FILTRES_INIT, applyFilters } from "./utils/filters";
import { KEYS, loadJSON, saveJSON } from "./utils/storage";
import { genererIdCustom, ChoixImportModal, ImportFichierModal, ActivityFormModal } from "./components/AddActivityModal";
import Header from "./components/Header";
import FilterPanel from "./components/FilterPanel";
import CartPanel from "./components/CartPanel";
import DetailModal from "./components/DetailModal";
import PrintView from "./components/PrintView";
import { ActivityCard, PhaseSection } from "./components/ActivityCard";

import "./styles/global.css";

export default function Catalogue() {
  const [selected, setSelected] = useState(null);
  const [filtres, setFiltres] = useState(FILTRES_INIT);
  const [showChoixImport, setShowChoixImport] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingActivite, setEditingActivite] = useState(null);

  const [activitesNatives, setActivitesNatives] = useState(() => {
    const data = loadJSON(KEYS.natives, null);
    if (Array.isArray(data) && data.length > 0) return data;
    saveJSON(KEYS.natives, ACTIVITES_NATIVES);
    return ACTIVITES_NATIVES;
  });

  const [activitesCustom, setActivitesCustom] = useState(() => {
    const data = loadJSON(KEYS.custom, []);
    return Array.isArray(data) ? data : [];
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

  useEffect(() => { saveJSON(KEYS.panier, panierOrdre); }, [panierOrdre]);
  useEffect(() => { saveJSON(KEYS.natives, activitesNatives); }, [activitesNatives]);
  useEffect(() => { saveJSON(KEYS.custom, activitesCustom); }, [activitesCustom]);

  const toutesActivites = useMemo(
    () => [...activitesNatives, ...activitesCustom],
    [activitesNatives, activitesCustom]
  );

  const tousThemes = useMemo(() => {
    const set = new Set();
    for (const a of toutesActivites) {
      if (Array.isArray(a.themes)) a.themes.forEach((t) => set.add(t));
    }
    return [...set];
  }, [toutesActivites]);

  const activitesFiltrees = useMemo(
    () => applyFilters(toutesActivites, filtres),
    [filtres, toutesActivites]
  );

  const groupedByPhase = useMemo(() => {
    const groups = {};
    for (const phase of PHASE_ORDER) groups[phase] = [];
    for (const a of activitesFiltrees) {
      if (groups[a.phase]) groups[a.phase].push(a);
    }
    return groups;
  }, [activitesFiltrees]);

  const panierAffichage = panierOrdre
    .map(item => {
      if (item.type === "activite") {
        const activite = toutesActivites.find(a => a.id === item.id);
        return activite ? { ...item, activite } : null;
      }
      return item;
    })
    .filter(Boolean);

  function handleSaveActivite(formData) {
    const id = genererIdCustom(activitesCustom);
    const nouvelleActivite = {
      id,
      titre: formData.titre.trim(),
      phase: formData.phase,
      public: formData.public,
      duree: formData.duree,
      duree_detail: formData.duree_detail.trim() || null,
      groupe: formData.groupe,
      preparation: formData.preparation,
      themes: formData.themes,
      contexte: formData.contexte,
      description_courte: formData.description_courte.trim(),
      description: formData.description.trim(),
      apprentissage_cle: formData.apprentissage_cle.trim(),
      _custom: true,
    };
    setActivitesCustom((prev) => [...prev, nouvelleActivite]);
    setShowAddModal(false);
  }

  function handleImportActivites(nouvellesActivites) {
    const ids = new Set([...activitesNatives.map((a) => a.id), ...activitesCustom.map((a) => a.id)]);
    const nums = activitesCustom
      .map((a) => { const m = a.id.match(/^CUS-(\d+)$/); return m ? parseInt(m[1], 10) : 0; })
      .filter(Boolean);
    let nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;

    const activitesAvecIds = nouvellesActivites.map((a) => {
      let id = a.id;
      if (!id || ids.has(id)) {
        id = `CUS-${String(nextNum).padStart(3, "0")}`;
        nextNum++;
      }
      ids.add(id);
      return { ...a, id, _custom: true };
    });

    setActivitesCustom((prev) => [...prev, ...activitesAvecIds]);
    setShowImportModal(false);
  }

  function handleUpdateActivite(formData) {
    const id = editingActivite.id;
    const estNative = activitesNatives.some((a) => a.id === id);
    const activiteMiseAJour = {
      id,
      titre: formData.titre.trim(),
      phase: formData.phase,
      public: formData.public,
      duree: formData.duree,
      duree_detail: formData.duree_detail.trim() || null,
      groupe: formData.groupe,
      preparation: formData.preparation,
      themes: formData.themes,
      contexte: formData.contexte,
      description_courte: formData.description_courte.trim(),
      description: formData.description.trim(),
      apprentissage_cle: formData.apprentissage_cle.trim(),
      ...(editingActivite._custom ? { _custom: true } : {}),
      ...(editingActivite._modifiee ? { _modifiee: true } : {}),
      ...(!estNative ? {} : { _modifiee: true }),
    };
    if (estNative) {
      setActivitesNatives((prev) => prev.map((a) => (a.id === id ? activiteMiseAJour : a)));
    } else {
      setActivitesCustom((prev) => prev.map((a) => (a.id === id ? activiteMiseAJour : a)));
    }
    setEditingActivite(null);
  }

  function handleDeleteActivite(id) {
    const estNative = activitesNatives.some((a) => a.id === id);
    if (estNative) {
      setActivitesNatives((prev) => prev.filter((a) => a.id !== id));
    } else {
      setActivitesCustom((prev) => prev.filter((a) => a.id !== id));
    }
    setPanier((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setPanierOrdre((prev) => prev.filter(item => !(item.type === "activite" && item.id === id)));
  }

  function handleReinitialiser() {
    if (!window.confirm(
      "Réinitialiser les 105 activités natives ?\n\nToutes vos modifications sur les activités natives seront perdues. Vos activités personnalisées seront conservées."
    )) return;
    setActivitesNatives(ACTIVITES_NATIVES);
    const idsNatifs = new Set(ACTIVITES_NATIVES.map((a) => a.id));
    setPanierOrdre((prev) => prev.filter(item =>
      item.type === "texte" || idsNatifs.has(item.id) || activitesCustom.some((a) => a.id === item.id)
    ));
    setPanier((prev) => {
      const next = new Set();
      for (const id of prev) {
        if (idsNatifs.has(id) || activitesCustom.some((a) => a.id === id)) next.add(id);
      }
      return next;
    });
  }

  const nbNativesModifiees = activitesNatives.filter((a) => a._modifiee).length;
  const nbNativesSupprimees = ACTIVITES_NATIVES.length - activitesNatives.length;

  return (
    <div className="app">
      <PrintView panierAffichage={panierAffichage} />
      <Header
        totalActivites={toutesActivites.length}
        filteredCount={activitesFiltrees.length}
        onNouvelleActivite={() => setShowChoixImport(true)}
        onReinitialiser={handleReinitialiser}
        nbNativesModifiees={nbNativesModifiees}
        nbNativesSupprimees={nbNativesSupprimees}
      />
      <div className="layout">
        <FilterPanel
          filtres={filtres}
          setFiltres={setFiltres}
          filteredCount={activitesFiltrees.length}
          totalActivites={toutesActivites.length}
          tousThemes={tousThemes}
        />
        <main className="main">
          {activitesFiltrees.length === 0 ? (
            <div className="no-results">
              <p className="no-results-title">Aucune activité ne correspond à ces filtres.</p>
              <p className="no-results-hint">Essayez de réduire le nombre de critères sélectionnés.</p>
            </div>
          ) : (
            PHASE_ORDER.map((phase) =>
              groupedByPhase[phase].length > 0 ? (
                <PhaseSection
                  key={phase}
                  phase={phase}
                  activites={groupedByPhase[phase]}
                  onCardClick={setSelected}
                  panier={panier}
                />
              ) : null
            )
          )}
          <footer className="app-footer">
            <p>
              Catalogue · {toutesActivites.length} activités
              {activitesCustom.length > 0 && (
                <span className="footer-custom-count">
                  (dont {activitesCustom.length} personnalisée{activitesCustom.length > 1 ? "s" : ""})
                </span>
              )}
              {" "}· {activitesFiltrees.length} affichées
            </p>
          </footer>
        </main>
        <CartPanel
          panier={panier}
          setPanier={setPanier}
          panierOrdre={panierOrdre}
          setPanierOrdre={setPanierOrdre}
          toutesActivites={toutesActivites}
        />
      </div>

      {selected && (
        <DetailModal
          activite={selected}
          onClose={() => setSelected(null)}
          panier={panier}
          setPanier={setPanier}
          panierOrdre={panierOrdre}
          setPanierOrdre={setPanierOrdre}
          onEdit={(a) => { setEditingActivite(a); setShowAddModal(true); }}
          onDelete={handleDeleteActivite}
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
          activitesCustom={activitesCustom}
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
    </div>
  );
}
