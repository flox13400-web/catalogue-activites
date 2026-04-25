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

function ThemeFilterGroup({ active, tousThemes, onToggle, onClear }) {
  const themesTriés = [...tousThemes].sort((a, b) => {
    if (a === "IA déconnecté") return -1;
    if (b === "IA déconnecté") return 1;
    return a.localeCompare(b, "fr");
  });

  return (
    <div className="filter-group">
      <div className="filter-label filter-label-row">
        <span>Thèmes</span>
        {active.length > 0 && (
          <button className="theme-filter-clear" onClick={onClear}>× effacer</button>
        )}
      </div>

      <select
        className="theme-filter-select"
        value=""
        onChange={(e) => { if (e.target.value) onToggle(e.target.value); }}
      >
        <option value="">— Sélectionner un thème —</option>
        {themesTriés.map((t) => (
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

export default function FilterPanel({ filtres, setFiltres, filteredCount, totalActivites, tousThemes, mobileOpen, onMobileClose }) {
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
      .filter(([k]) => k !== "search")
      .some(([, arr]) => arr.length > 0) || filtres.search.trim() !== "";

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

        <FilterGroup
          label="Public"
          values={["7-10", "11-15", "16-20", "Post-bac", "Adultes"]}
          active={filtres.public}
          onToggle={(v) => toggle("public", v)}
        />
        <FilterGroup
          label="Durée"
          values={["<30min", "30-60min", "1-2h", "2-4h", "Projet"]}
          active={filtres.duree}
          onToggle={(v) => toggle("duree", v)}
        />
        <FilterGroup
          label="Taille du groupe"
          values={["Petit", "Moyen", "Grand"]}
          active={filtres.groupe}
          onToggle={(v) => toggle("groupe", v)}
        />
        <FilterGroup
          label="Préparation"
          values={["Légère", "Moyenne", "Importante"]}
          active={filtres.preparation}
          onToggle={(v) => toggle("preparation", v)}
        />

        <ThemeFilterGroup
          active={filtres.themes}
          tousThemes={tousThemes}
          onToggle={(v) => toggle("themes", v)}
          onClear={() => setFiltres((prev) => ({ ...prev, themes: [] }))}
        />

        <FilterGroup
          label="Contexte"
          values={["Scolaire", "Études sup.", "Entreprise"]}
          active={filtres.contexte}
          onToggle={(v) => toggle("contexte", v)}
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
