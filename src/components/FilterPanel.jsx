import React from "react";
import { FILTRES_INIT } from "../utils/filters";
import "../styles/filters.css";

function FilterGroup({ label, values, active, onToggle }) {
  return (
    <div className="filter-group">
      <div className="filter-label">{label}</div>
      <div className="filter-values">
        {values.map((v) => (
          <button
            key={v}
            className={`filter-chip ${active.includes(v) ? "filter-chip-active" : ""}`}
            onClick={() => onToggle(v)}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function KeywordFilterGroup({ label, active, tousMotsCles, onToggle, onClear }) {
  const tries = [...tousMotsCles].sort((a, b) => a.localeCompare(b, "fr"));
  return (
    <div className="filter-group">
      <div className="filter-label filter-label-row">
        <span>{label}</span>
        {active.length > 0 && (
          <button className="theme-filter-clear" onClick={onClear}>× effacer</button>
        )}
      </div>
      <select
        className="theme-filter-select"
        value=""
        onChange={(e) => { if (e.target.value) onToggle(e.target.value); }}
      >
        <option value="">— Sélectionner —</option>
        {tries.map((t) => (
          <option key={t} value={t} disabled={active.includes(t)}>
            {active.includes(t) ? `✓ ${t}` : t}
          </option>
        ))}
      </select>
      {active.length > 0 && (
        <div className="theme-filter-active">
          {active.map((t) => (
            <button
              key={t}
              className="theme-filter-chip"
              onClick={() => onToggle(t)}
              title="Retirer ce filtre"
            >
              {t} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterPanel({ filtres, setFiltres, filteredCount, totalActivites, tousThemes, tousMaterialels, mobileOpen, onMobileClose }) {
  function toggle(key, value) {
    setFiltres((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  function resetAll() {
    setFiltres(FILTRES_INIT);
  }

  const hasActive =
    Object.entries(filtres)
      .filter(([k]) => k !== "search" && k !== "favorisOnly")
      .some(([, arr]) => arr.length > 0) ||
    filtres.search.trim() !== "" ||
    filtres.favorisOnly;

  return (
    <aside className={`panel panel-filters${mobileOpen ? " panel-open" : ""}`}>
      <div className="panel-header">
        <h2 className="panel-title">Filtres</h2>
        <span className="panel-subtitle">{filteredCount} / {totalActivites}</span>
        <button className="panel-mobile-close" onClick={onMobileClose}>×</button>
      </div>
      <div className="panel-body">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            type="text"
            placeholder="Recherche libre…"
            value={filtres.search}
            onChange={(e) => setFiltres((prev) => ({ ...prev, search: e.target.value }))}
          />
          {filtres.search && (
            <button className="search-clear" onClick={() => setFiltres((prev) => ({ ...prev, search: "" }))}>×</button>
          )}
        </div>

        <div className="filter-group">
          <button
            className={`filter-chip filter-chip-favoris${filtres.favorisOnly ? " filter-chip-active" : ""}`}
            onClick={() => setFiltres((prev) => ({ ...prev, favorisOnly: !prev.favorisOnly }))}
          >
            {filtres.favorisOnly ? "♥" : "♡"} Favoris uniquement
          </button>
        </div>

        <FilterGroup
          label="Âge du public"
          values={["Primaire", "Collège", "Lycée", "Post-bac", "Adultes"]}
          active={filtres.age_public}
          onToggle={(v) => toggle("age_public", v)}
        />
        <FilterGroup
          label="Durée"
          values={["0-15min", "15-30min", "30-45min", "45-60min", ">60min"]}
          active={filtres.duree}
          onToggle={(v) => toggle("duree", v)}
        />
        <FilterGroup
          label="Taille de groupe"
          values={["1", "2-6", "7-12", ">12"]}
          active={filtres.taille_groupe}
          onToggle={(v) => toggle("taille_groupe", v)}
        />
        <FilterGroup
          label="Contexte"
          values={["Scolaire", "Entreprise", "Montée en compétence", "Diplomant"]}
          active={filtres.contexte}
          onToggle={(v) => toggle("contexte", v)}
        />
        <FilterGroup
          label="Modalité"
          values={["Présentielle", "Distanciel", "Synchrone", "Asynchrone"]}
          active={filtres.modalite}
          onToggle={(v) => toggle("modalite", v)}
        />
        <KeywordFilterGroup
          label="Thèmes"
          active={filtres.themes}
          tousMotsCles={tousThemes}
          onToggle={(v) => toggle("themes", v)}
          onClear={() => setFiltres((prev) => ({ ...prev, themes: [] }))}
        />
        <KeywordFilterGroup
          label="Matériels"
          active={filtres.materiels}
          tousMotsCles={tousMaterialels}
          onToggle={(v) => toggle("materiels", v)}
          onClear={() => setFiltres((prev) => ({ ...prev, materiels: [] }))}
        />
      </div>
      <div className="panel-footer">
        {hasActive ? (
          <button className="btn-reset" onClick={resetAll}>Réinitialiser les filtres</button>
        ) : (
          <span className="panel-footnote">Sélectionnez des filtres ci-dessus</span>
        )}
      </div>
    </aside>
  );
}
