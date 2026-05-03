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

import { calculerDureeTotalProgramme, formatDureeGlobale } from "../utils/duree";

export const PROGRAMME_INIT = {
  id: "prog-1",
  titre: "Mon programme",
  duree_objectif: 0,
  objectif_bloom: "",
  objectif_action: "",
  objectif_final: "",
  sequences: [],
};

export default function SequenceBuilder({
  programme,
  setProgramme,
  toutesActivites,
  mobileOpen,
  onMobileClose,
}) {
  const [collapsed, setCollapsed] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const totalActivites = programme.sequences.reduce(
    (acc, seq) => acc + seq.seances.reduce((a, sea) => a + sea.fiches.length, 0),
    0
  );

  const dureeTotal = useMemo(() => calculerDureeTotalProgramme(programme, toutesActivites), [programme, toutesActivites]);
  const dureeStr = formatDureeGlobale(dureeTotal);

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
        { id, titre: "Nouvelle séquence", objectif_bloom: "", objectif_action: "", objectif_competence: "", parent_id: prev.id, seances: [] },
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

  function updateProgrammeField(field, value) {
    setProgramme(prev => ({ ...prev, [field]: value }));
  }

  function updateObjectifSequence(seqId, value) {
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq =>
        seq.id !== seqId ? seq : { ...seq, objectif_competence: value }
      ),
    }));
  }

  function updateSeqField(seqId, field, value) {
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq =>
        seq.id !== seqId ? seq : { ...seq, [field]: value }
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
    <main className={`panel panel-cart builder-main${mobileOpen ? " panel-open" : ""}`}>
      <div className="panel-header seq-panel-header">
        <button className="panel-mobile-close" onClick={onMobileClose}>×</button>
        <h2 className="panel-title">Constructeur</h2>
        <div className="panel-header-end">
          <div className="panel-header-stats">
            <span className="panel-subtitle">
              {totalActivites} activité{totalActivites !== 1 ? "s" : ""}
            </span>
            {dureeStr && <span className="seq-duree-header">{dureeStr}</span>}
          </div>
        </div>
        {programme.duree_objectif > 0 && (
          <div className="seq-jauge-wrapper">
            <div className="seq-jauge-meta">
              <span className="seq-jauge-label">{dureeStr || "0min"} / {programme.duree_objectif}h</span>
              <span className="seq-jauge-pct">
                {Math.round(Math.min((dureeTotal.max / (programme.duree_objectif * 60)) * 100, 100))}%
              </span>
            </div>
            <progress
              className="seq-jauge"
              value={Math.min(dureeTotal.max, programme.duree_objectif * 60)}
              max={programme.duree_objectif * 60}
            />
          </div>
        )}
      </div>

      <div className="panel-body seq-builder-body">
        <div className="seq-programme-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', flexShrink: 0}}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          {renderTitre(programme.id, programme.titre, "seq-programme-titre")}
          <div className="seq-madlibs">
            <span className="seq-madlibs-prefix">À l'issue de cette formation, l'apprenant sera capable de :</span>
            <div className="seq-madlibs-inputs">
              <select
                className="seq-opo-select"
                value={programme.objectif_bloom || ""}
                onChange={e => updateProgrammeField("objectif_bloom", e.target.value)}
              >
                <option value="">— Verbe d'action —</option>
                {VERBES_BLOOM_GROUPED.map(g => (
                  <optgroup key={g.niveau} label={g.niveau}>
                    {g.verbes.map(v => <option key={v} value={v}>{v}</option>)}
                  </optgroup>
                ))}
              </select>
              <input
                className="seq-objectif-input"
                value={programme.objectif_action || ""}
                placeholder="…"
                onChange={e => updateProgrammeField("objectif_action", e.target.value)}
              />
            </div>
          </div>
          <div className="seq-duree-cible-row">
            <span className="seq-madlibs-prefix">Durée cible :</span>
            <input
              className="seq-duree-cible-input"
              type="number"
              min="0"
              step="0.5"
              defaultValue={programme.duree_objectif > 0 ? programme.duree_objectif : ""}
              placeholder="0"
              onBlur={e => updateProgrammeField("duree_objectif", parseFloat(e.target.value) || 0)}
            />
            <span className="seq-duree-cible-unit">h</span>
          </div>
          <div className="seq-madlibs-simple">
            <span className="seq-madlibs-prefix">La compétence sera acquise si :</span>
            <textarea
              className="seq-objectif-input"
              value={programme.objectif_final || ""}
              placeholder="Décrire les critères d'acquisition..."
              onChange={e => updateObjectifProgramme(e.target.value)}
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', flexShrink: 0}}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  {renderTitre(seq.id, seq.titre, "seq-sequence-titre")}
                  <button className="seq-remove-btn" onClick={() => removeSequence(seq.id)} title="Supprimer la séquence">×</button>
                </div>

                {!seqCollapsed && (
                  <div className="seq-sequence-body">
                    <div className="seq-madlibs">
                      <span className="seq-madlibs-prefix">À l'issue de cette séquence, l'apprenant sera capable de :</span>
                      <div className="seq-madlibs-inputs">
                        <select
                          className="seq-opo-select"
                          value={seq.objectif_bloom || ""}
                          onChange={e => updateSeqField(seq.id, "objectif_bloom", e.target.value)}
                        >
                          <option value="">— Verbe d'action —</option>
                          {VERBES_BLOOM_GROUPED.map(g => (
                            <optgroup key={g.niveau} label={g.niveau}>
                              {g.verbes.map(v => <option key={v} value={v}>{v}</option>)}
                            </optgroup>
                          ))}
                        </select>
                        <input
                          className="seq-objectif-input"
                          value={seq.objectif_action || ""}
                          placeholder="…"
                          onChange={e => updateSeqField(seq.id, "objectif_action", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="seq-madlibs-simple">
                      <span className="seq-madlibs-prefix">La compétence sera acquise si :</span>
                      <input
                        className="seq-objectif-input"
                        value={seq.objectif_competence || ""}
                        placeholder="Décrire les critères..."
                        onChange={e => updateObjectifSequence(seq.id, e.target.value)}
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
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', flexShrink: 0}}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {renderTitre(sea.id, sea.titre, "seq-seance-titre")}
                            <button className="seq-remove-btn" onClick={() => removeSeance(seq.id, sea.id)} title="Supprimer la séance">×</button>
                          </div>

                          {!seaCollapsed && (
                            <div className="seq-fiches">
                              <div className="seq-opo-row">
                                <span className="seq-opo-type-label">Type :</span>
                                <select
                                  className="seq-opo-select"
                                  value={sea.opo_type || "Savoir"}
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
                                    <option value="">— Verbe d'action —</option>
                                    {VERBES_BLOOM_GROUPED.map(g => (
                                      <optgroup key={g.niveau} label={g.niveau}>
                                        {g.verbes.map(v => <option key={v} value={v}>{v}</option>)}
                                      </optgroup>
                                    ))}
                                  </select>
                                  <input
                                    className="seq-objectif-input"
                                    value={sea.opo_verbe || ""}
                                    placeholder="…"
                                    onChange={e => updateOpoSeance(seq.id, sea.id, "opo_verbe", e.target.value)}
                                  />
                                </div>
                              </div>
                              {ficheAvecActivite.length === 0 ? (
                                <p className="seq-fiche-empty">Aucune activité assignée</p>
                              ) : (
                                ficheAvecActivite.map(({ fiche, activite }) => {
                                  const isEval = activite.type_fiche === "Activite_Evaluation" || activite.type_fiche === "Évaluation" || activite.type_fiche === "Evaluation";
                                  const modalites = activite.modalite || [];
                                  return (
                                    <div key={fiche.id} className={`seq-fiche ${isEval ? "seq-fiche-eval" : "seq-fiche-apprentissage"}`}>
                                      <div className="seq-fiche-content">
                                        <span className="seq-fiche-titre">{activite.titre}</span>
                                        {activite.description_courte && (
                                          <span className="seq-fiche-desc">{activite.description_courte}</span>
                                        )}
                                        <div className="seq-fiche-meta-row">
                                          <span className="seq-fiche-duree">
                                            <svg className="seq-fiche-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            {activite.duree}
                                          </span>
                                          {modalites.length > 0 && (
                                            <span className="seq-fiche-modalites">
                                              {modalites.includes("Présentielle") && (
                                                <span className="seq-fiche-modalite-badge" title="Présentielle">
                                                  <svg className="seq-fiche-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                                </span>
                                              )}
                                              {modalites.includes("Distanciel") && (
                                                <span className="seq-fiche-modalite-badge" title="Distanciel">
                                                  <svg className="seq-fiche-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                                                </span>
                                              )}
                                              {modalites.includes("Synchrone") && (
                                                <span className="seq-fiche-modalite-badge" title="Synchrone">
                                                  <svg className="seq-fiche-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                                </span>
                                              )}
                                              {modalites.includes("Asynchrone") && (
                                                <span className="seq-fiche-modalite-badge" title="Asynchrone">
                                                  <svg className="seq-fiche-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                                </span>
                                              )}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <button
                                        className="seq-remove-btn"
                                        onClick={() => removeFiche(seq.id, sea.id, fiche.id)}
                                        title="Retirer"
                                      >×</button>
                                    </div>
                                  );
                                })
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
    </main>
  );
}
