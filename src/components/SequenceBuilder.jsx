import React, { useState, useMemo } from "react";
import { verifierAlignementPedagogique } from "../utils/alignmentChecker.js";
import "../styles/cart.css";

const VERBES_BLOOM_GROUPED = [
  { niveau: "Mémoriser",  verbes: ["Définir", "Lister", "Nommer", "Rappeler", "Reconnaître", "Reproduire"] },
  { niveau: "Comprendre", verbes: ["Expliquer", "Résumer", "Interpréter", "Classer", "Comparer", "Décrire"] },
  { niveau: "Appliquer",  verbes: ["Utiliser", "Exécuter", "Résoudre", "Illustrer", "Calculer", "Mettre en œuvre"] },
  { niveau: "Analyser",   verbes: ["Distinguer", "Organiser", "Décomposer", "Différencier", "Examiner", "Attribuer"] },
  { niveau: "Évaluer",    verbes: ["Vérifier", "Critiquer", "Juger", "Argumenter", "Justifier", "Apprécier"] },
  { niveau: "Créer",      verbes: ["Concevoir", "Construire", "Planifier", "Produire", "Générer", "Inventer"] },
];

const DUREE_PLAGES = {
  "0-15min":  { min: 0,  max: 15 },
  "15-30min": { min: 15, max: 30 },
  "30-45min": { min: 30, max: 45 },
  "45-60min": { min: 45, max: 60 },
  ">60min":   null,
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

export const PROGRAMME_INIT = {
  id: "prog-1",
  titre: "Mon programme",
  objectif_final: "",
  sequences: [],
};

export default function SequenceBuilder({
  programme,
  setProgramme,
  toutesActivites,
  mobileOpen,
  onMobileClose,
  nbCorbeille,
  onOuvrirCorbeille,
}) {
  const [collapsed, setCollapsed] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const totalActivites = programme.sequences.reduce(
    (acc, seq) => acc + seq.seances.reduce((a, sea) => a + sea.fiches.length, 0),
    0
  );

  const dureeTotal = useMemo(() => {
    let min = 0, max = 0, hasProjet = false;
    for (const seq of programme.sequences) {
      for (const sea of seq.seances) {
        for (const fiche of sea.fiches) {
          const activite = toutesActivites.find(a => a.id === fiche.activite_id);
          if (!activite) continue;
          const { min: dMin, max: dMax, hasProjet: hp } = parseDureeActivite(activite);
          min += dMin; max += dMax;
          if (hp) hasProjet = true;
        }
      }
    }
    return { min, max, hasProjet };
  }, [programme, toutesActivites]);

  const dureeStr = (dureeTotal.min > 0 || dureeTotal.max > 0 || dureeTotal.hasProjet)
    ? (dureeTotal.min === dureeTotal.max
        ? formatMinutes(dureeTotal.min)
        : `${formatMinutes(dureeTotal.min)} – ${formatMinutes(dureeTotal.max)}`)
      + (dureeTotal.hasProjet ? " + projet" : "")
    : null;

  // ── Collapse ──────────────────────────────────────────────────

  function toggleCollapse(id) {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Édition inline des titres ──────────────────────────────────

  function startEdit(id, value) {
    setEditingId(id);
    setEditingValue(value);
  }

  function commitEdit() {
    if (!editingId) return;
    const val = editingValue.trim() || "Sans titre";
    setProgramme(prev => ({
      ...prev,
      titre: prev.id === editingId ? val : prev.titre,
      sequences: prev.sequences.map(seq => {
        if (seq.id === editingId) return { ...seq, titre: val };
        return {
          ...seq,
          seances: seq.seances.map(sea =>
            sea.id === editingId ? { ...sea, titre: val } : sea
          ),
        };
      }),
    }));
    setEditingId(null);
    setEditingValue("");
  }

  function handleEditKey(e) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") { setEditingId(null); setEditingValue(""); }
  }

  // ── Ajout ─────────────────────────────────────────────────────

  function addSequence() {
    const id = `seq-${Date.now()}`;
    setProgramme(prev => ({
      ...prev,
      sequences: [
        ...prev.sequences,
        { id, titre: "Nouvelle séquence", objectif_competence: "", parent_id: prev.id, seances: [] },
      ],
    }));
    setCollapsed(prev => { const next = new Set(prev); next.delete(id); return next; });
    startEdit(id, "Nouvelle séquence");
  }

  function addSeance(seqId) {
    const id = `sea-${Date.now()}`;
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq =>
        seq.id !== seqId ? seq : {
          ...seq,
          seances: [
            ...seq.seances,
            { id, titre: "Nouvelle séance", opo_verbe: "", opo_bloom: "", opo_type: "Savoir", parent_id: seqId, fiches: [] },
          ],
        }
      ),
    }));
    setCollapsed(prev => { const next = new Set(prev); next.delete(id); return next; });
    startEdit(id, "Nouvelle séance");
  }

  // ── Suppression ───────────────────────────────────────────────

  function removeSequence(seqId) {
    setProgramme(prev => ({ ...prev, sequences: prev.sequences.filter(s => s.id !== seqId) }));
  }

  function removeSeance(seqId, seaId) {
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq =>
        seq.id !== seqId ? seq : { ...seq, seances: seq.seances.filter(s => s.id !== seaId) }
      ),
    }));
  }

  function removeFiche(seqId, seaId, ficheId) {
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq =>
        seq.id !== seqId ? seq : {
          ...seq,
          seances: seq.seances.map(sea =>
            sea.id !== seaId ? sea : { ...sea, fiches: sea.fiches.filter(f => f.id !== ficheId) }
          ),
        }
      ),
    }));
  }

  // ── Objectifs pédagogiques ────────────────────────────────────

  function updateObjectifProgramme(value) {
    setProgramme(prev => ({ ...prev, objectif_final: value }));
  }

  function updateObjectifSequence(seqId, value) {
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq =>
        seq.id !== seqId ? seq : { ...seq, objectif_competence: value }
      ),
    }));
  }

  function updateOpoSeance(seqId, seaId, field, value) {
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq =>
        seq.id !== seqId ? seq : {
          ...seq,
          seances: seq.seances.map(sea =>
            sea.id !== seaId ? sea : { ...sea, [field]: value }
          ),
        }
      ),
    }));
  }

  // ── Export avec validation pédagogique ───────────────────────

  function handleExport() {
    const { valide, erreurs } = verifierAlignementPedagogique(programme);
    if (valide) {
      window.print();
      return;
    }
    const message =
      "L'alignement pédagogique présente des failles :\n" +
      erreurs.map(e => `- ${e}`).join("\n") +
      "\n\nVoulez-vous imprimer quand même ?";
    if (window.confirm(message)) window.print();
  }

  // ── Titre éditable ────────────────────────────────────────────

  function renderTitre(id, titre, className) {
    if (editingId === id) {
      return (
        <input
          className="seq-edit-input"
          value={editingValue}
          onChange={e => setEditingValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleEditKey}
          autoFocus
        />
      );
    }
    return (
      <span className={className} onClick={() => startEdit(id, titre)} title="Cliquer pour renommer">
        {titre}
      </span>
    );
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <aside className={`panel panel-cart${mobileOpen ? " panel-open" : ""}`}>
      <div className="panel-header">
        <button className="panel-mobile-close" onClick={onMobileClose}>×</button>
        <h2 className="panel-title">Constructeur</h2>
        <div className="panel-header-end">
          <div className="panel-header-stats">
            <span className="panel-subtitle">
              {totalActivites} activité{totalActivites !== 1 ? "s" : ""}
            </span>
            {dureeStr && <span className="seq-duree-header">{dureeStr}</span>}
          </div>
          <button className="cart-panel-corbeille-btn" onClick={onOuvrirCorbeille} title="Corbeille">
            🗑 <span className="cart-panel-corbeille-count">{nbCorbeille}</span>
          </button>
        </div>
      </div>

      <div className="panel-body seq-builder-body">
        <div className="seq-programme-header">
          {renderTitre(programme.id, programme.titre, "seq-programme-titre")}
          <div className="seq-madlibs-simple">
            <span className="seq-madlibs-prefix">La compétence sera acquise si :</span>
            <textarea
              className="seq-objectif-input"
              defaultValue={programme.objectif_final}
              placeholder="Décrire les critères d'acquisition..."
              onBlur={e => updateObjectifProgramme(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="seq-tree">
          {programme.sequences.length === 0 && (
            <div className="seq-empty">
              <p className="seq-empty-text">Commencez par créer une séquence.</p>
            </div>
          )}

          {programme.sequences.map(seq => {
            const seqCollapsed = collapsed.has(seq.id);
            return (
              <div key={seq.id} className="seq-sequence">
                <div className="seq-row seq-sequence-row">
                  <button className="seq-collapse-btn" onClick={() => toggleCollapse(seq.id)}>
                    {seqCollapsed ? "▶" : "▼"}
                  </button>
                  {renderTitre(seq.id, seq.titre, "seq-sequence-titre")}
                  <button className="seq-remove-btn" onClick={() => removeSequence(seq.id)} title="Supprimer la séquence">×</button>
                </div>

                {!seqCollapsed && (
                  <div className="seq-sequence-body">
                    <div className="seq-madlibs-simple">
                      <span className="seq-madlibs-prefix">La compétence sera acquise si :</span>
                      <input
                        className="seq-objectif-input"
                        defaultValue={seq.objectif_competence}
                        placeholder="Décrire les critères..."
                        onBlur={e => updateObjectifSequence(seq.id, e.target.value)}
                      />
                    </div>
                    {seq.seances.map(sea => {
                      const seaCollapsed = collapsed.has(sea.id);
                      const ficheAvecActivite = sea.fiches.map(f => ({
                        fiche: f,
                        activite: toutesActivites.find(a => a.id === f.activite_id),
                      })).filter(x => x.activite);

                      return (
                        <div key={sea.id} className="seq-seance">
                          <div className="seq-row seq-seance-row">
                            <button className="seq-collapse-btn seq-collapse-btn-sm" onClick={() => toggleCollapse(sea.id)}>
                              {seaCollapsed ? "▶" : "▼"}
                            </button>
                            {renderTitre(sea.id, sea.titre, "seq-seance-titre")}
                            <button className="seq-remove-btn" onClick={() => removeSeance(seq.id, sea.id)} title="Supprimer la séance">×</button>
                          </div>

                          {!seaCollapsed && (
                            <div className="seq-fiches">
                              <div className="seq-opo-row">
                                <span className="seq-opo-type-label">Type :</span>
                                <select
                                  className="seq-opo-select"
                                  value={sea.opo_type}
                                  onChange={e => updateOpoSeance(seq.id, sea.id, "opo_type", e.target.value)}
                                >
                                  <option value="Savoir">Savoir</option>
                                  <option value="Savoir-faire">Savoir-faire</option>
                                  <option value="Savoir-être">Savoir-être</option>
                                </select>
                              </div>
                              <div className="seq-madlibs">
                                <span className="seq-madlibs-prefix">À l'issue de cette séance, l'apprenant sera capable de :</span>
                                <div className="seq-madlibs-inputs">
                                  <select
                                    className="seq-opo-select"
                                    value={sea.opo_bloom || ""}
                                    onChange={e => updateOpoSeance(seq.id, sea.id, "opo_bloom", e.target.value)}
                                  >
                                    <option value="">— Bloom —</option>
                                    {VERBES_BLOOM_GROUPED.map(g => (
                                      <optgroup key={g.niveau} label={g.niveau}>
                                        {g.verbes.map(v => <option key={v} value={v}>{v}</option>)}
                                      </optgroup>
                                    ))}
                                  </select>
                                  <input
                                    className="seq-objectif-input"
                                    defaultValue={sea.opo_verbe}
                                    placeholder="…"
                                    onBlur={e => updateOpoSeance(seq.id, sea.id, "opo_verbe", e.target.value)}
                                  />
                                </div>
                              </div>
                              {ficheAvecActivite.length === 0 ? (
                                <p className="seq-fiche-empty">Aucune activité assignée</p>
                              ) : (
                                ficheAvecActivite.map(({ fiche, activite }) => (
                                  <div key={fiche.id} className="seq-fiche">
                                    <span className="seq-fiche-id">{activite.id}</span>
                                    <span className="seq-fiche-titre">{activite.titre}</span>
                                    <button
                                      className="seq-remove-btn"
                                      onClick={() => removeFiche(seq.id, sea.id, fiche.id)}
                                      title="Retirer"
                                    >×</button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <button className="seq-add-btn" onClick={() => addSeance(seq.id)}>
                      + Séance
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button className="seq-add-btn seq-add-sequence-btn" onClick={addSequence}>
          + Séquence
        </button>
      </div>

      <div className="panel-footer">
        {totalActivites === 0 ? (
          <span className="panel-footnote">Créez des séquences, puis assignez des activités</span>
        ) : (
          <button className="btn btn-print" onClick={handleExport}>
            &#128438; Imprimer / PDF
          </button>
        )}
      </div>
    </aside>
  );
}
