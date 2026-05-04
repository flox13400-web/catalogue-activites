import { useState, useMemo, useRef } from "react";
import { verifierAlignementPedagogique } from "../utils/alignmentChecker.js";
import "../styles/cart.css";
import bloomTaxonomyData from "../data/bloomTaxonomy.json";

const VERBES_BLOOM_GROUPED = bloomTaxonomyData.map(n => ({ niveau: n.nom, verbes: n.verbes }));

import { calculerDureeTotalProgramme, formatDureeGlobale, parseDureeActivite } from "../utils/duree";

const getBloomLevel = (verb) => {
  if (!verb) return 0;
  const group = bloomTaxonomyData.find(g => g.verbes.includes(verb));
  return group ? group.niveau : 0;
};

function methodeClass(a) {
  if (a.methode === "evaluation" || a.type_fiche === "Activite_Evaluation" || a.type_fiche === "Évaluation" || a.type_fiche === "Evaluation")
    return "seq-fiche-eval";
  if (a.methode === "expositive") return "seq-fiche-expositive";
  return "seq-fiche-apprentissage";
}

function methodeGaugeKey(a) {
  if (a.methode === "evaluation" || a.type_fiche === "Activite_Evaluation" || a.type_fiche === "Évaluation" || a.type_fiche === "Evaluation")
    return "evaluation";
  if (a.methode === "expositive") return "expositive";
  return "active";
}

export const PROGRAMME_INIT = {
  id: "prog-1",
  titre: "Mon programme",
  duree_objectif: 0,
  objectif_bloom: "",
  objectif_action: "",
  objectif_final: "",
  prerequis: "",
  sequences: [],
};

export default function SequenceBuilder({
  programme,
  setProgramme,
  toutesActivites,
  mobileOpen,
  onMobileClose,
  onExportSQA,
  onImportSQA,
  onLancerImpression,
}) {
  const fileInputRef = useRef(null);
  const [isProgrammeMenuOpen, setIsProgrammeMenuOpen] = useState(false);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [pendingPrintMode, setPendingPrintMode] = useState(null);
  const [collapsed, setCollapsed] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [validationErreurs, setValidationErreurs] = useState({});
  const [prerequisWarning, setPrerequisWarning] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const dragRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const totalFiches = programme.sequences.reduce(
    (acc, seq) => acc + seq.seances.reduce((a, sea) => a + sea.fiches.length, 0),
    0
  );

  const dureeTotal = useMemo(() => calculerDureeTotalProgramme(programme, toutesActivites), [programme, toutesActivites]);
  const dureeStr = formatDureeGlobale(dureeTotal);

  const jaugeSegments = useMemo(() => {
    if (programme.duree_objectif <= 0) return [];
    const maxMin = programme.duree_objectif * 60;
    const allFiches = (programme.sequences || []).flatMap(seq =>
      (seq.seances || []).flatMap(sea => sea.fiches || [])
    );
    let cumul = 0;
    const segs = [];
    for (const fiche of allFiches) {
      if (cumul >= maxMin) break;
      let minutes, key, label, dureeLabel;
      if (fiche.type === "texte") {
        minutes = fiche.duree_min || 0;
        key = "texte";
        label = fiche.titre || "Encart";
        dureeLabel = minutes > 0 ? `${minutes} min` : "";
      } else {
        const activite = toutesActivites.find(a => a.id === fiche.activite_id);
        if (!activite) continue;
        const d = parseDureeActivite(activite);
        minutes = d.max > 0 ? d.max : (d.hasProjet ? 75 : 0);
        key = methodeGaugeKey(activite);
        label = activite.titre;
        dureeLabel = activite.duree || "";
      }
      // Les encarts texte apparaissent même à 0 min (marqueur fin via min-width CSS)
      if (minutes <= 0 && fiche.type !== "texte") continue;
      const visible = minutes > 0 ? Math.min(minutes, maxMin - cumul) : 0;
      const pct = minutes > 0 ? (visible / maxMin) * 100 : 0;
      const cumulPct = (cumul / maxMin) * 100;
      segs.push({ key, pct, cumulPct, label, dureeLabel });
      cumul += minutes;
    }
    return segs;
  }, [programme, toutesActivites]);

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

  function clearValidationError(key) {
    setValidationErreurs(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validerPourExport() {
    const e = {};
    if (!programme.objectif_bloom || !programme.objectif_action?.trim()) e.prog_objectif = true;
    for (const seq of programme.sequences) {
      if (!seq.objectif_bloom || !seq.objectif_action?.trim()) e[`seq_${seq.id}`] = true;
      for (const sea of seq.seances) {
        if (!sea.opo_bloom || !sea.opo_verbe?.trim()) e[`sea_${sea.id}`] = true;
      }
    }
    return e;
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

  function addEncart(seqId, seaId) {
    const id = `enc-${Date.now()}`;
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq =>
        seq.id !== seqId ? seq : {
          ...seq,
          seances: seq.seances.map(sea =>
            sea.id !== seaId ? sea : {
              ...sea,
              fiches: [...sea.fiches, { id, type: "texte", titre: "", contenu: "", duree_min: 0 }],
            }
          ),
        }
      ),
    }));
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

  // ── Mise à jour encart ────────────────────────────────────────

  function updateFicheEncart(seqId, seaId, ficheId, field, value) {
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq =>
        seq.id !== seqId ? seq : {
          ...seq,
          seances: seq.seances.map(sea =>
            sea.id !== seaId ? sea : {
              ...sea,
              fiches: sea.fiches.map(f =>
                f.id !== ficheId ? f : { ...f, [field]: value }
              ),
            }
          ),
        }
      ),
    }));
  }

  // ── Déplacement ───────────────────────────────────────────────

  function moveSequence(seqId, dir) {
    setProgramme(prev => {
      const seqs = [...prev.sequences];
      const i = seqs.findIndex(s => s.id === seqId);
      const j = i + dir;
      if (j < 0 || j >= seqs.length) return prev;
      [seqs[i], seqs[j]] = [seqs[j], seqs[i]];
      return { ...prev, sequences: seqs };
    });
  }

  function moveSeance(seqId, seaId, dir) {
    setProgramme(prev => {
      const seqs = [...prev.sequences];
      const si = seqs.findIndex(s => s.id === seqId);
      if (si < 0) return prev;
      const seances = [...seqs[si].seances];
      const ei = seances.findIndex(s => s.id === seaId);
      if (ei < 0) return prev;
      const ni = ei + dir;
      if (ni >= 0 && ni < seances.length) {
        [seances[ei], seances[ni]] = [seances[ni], seances[ei]];
        seqs[si] = { ...seqs[si], seances };
      } else if (ni < 0 && si > 0) {
        const prevSeances = [...seqs[si - 1].seances];
        const [moved] = seances.splice(ei, 1);
        prevSeances.push(moved);
        seqs[si - 1] = { ...seqs[si - 1], seances: prevSeances };
        seqs[si] = { ...seqs[si], seances };
      } else if (ni >= seances.length && si < seqs.length - 1) {
        const nextSeances = [...seqs[si + 1].seances];
        const [moved] = seances.splice(ei, 1);
        nextSeances.unshift(moved);
        seqs[si + 1] = { ...seqs[si + 1], seances: nextSeances };
        seqs[si] = { ...seqs[si], seances };
      }
      return { ...prev, sequences: seqs };
    });
  }

  function moveFiche(seqId, seaId, ficheId, dir) {
    setProgramme(prev => {
      const seqs = [...prev.sequences];
      const si = seqs.findIndex(s => s.id === seqId);
      if (si < 0) return prev;
      const seances = [...seqs[si].seances];
      const ei = seances.findIndex(s => s.id === seaId);
      if (ei < 0) return prev;
      const fiches = [...seances[ei].fiches];
      const fi = fiches.findIndex(f => f.id === ficheId);
      if (fi < 0) return prev;
      const ni = fi + dir;
      if (ni >= 0 && ni < fiches.length) {
        [fiches[fi], fiches[ni]] = [fiches[ni], fiches[fi]];
        seances[ei] = { ...seances[ei], fiches };
      } else if (ni < 0 && ei > 0) {
        const prevFiches = [...seances[ei - 1].fiches];
        const [moved] = fiches.splice(fi, 1);
        prevFiches.push(moved);
        seances[ei - 1] = { ...seances[ei - 1], fiches: prevFiches };
        seances[ei] = { ...seances[ei], fiches };
      } else if (ni >= fiches.length && ei < seances.length - 1) {
        const nextFiches = [...seances[ei + 1].fiches];
        const [moved] = fiches.splice(fi, 1);
        nextFiches.unshift(moved);
        seances[ei + 1] = { ...seances[ei + 1], fiches: nextFiches };
        seances[ei] = { ...seances[ei], fiches };
      }
      seqs[si] = { ...seqs[si], seances };
      return { ...prev, sequences: seqs };
    });
  }

  // ── Réordonnancement drag & drop ─────────────────────────────

  function reorderSequences(fromId, toId, pos) {
    setProgramme(prev => {
      const seqs = [...prev.sequences];
      const fi = seqs.findIndex(s => s.id === fromId);
      if (fi < 0) return prev;
      const [item] = seqs.splice(fi, 1);
      const ti = seqs.findIndex(s => s.id === toId);
      if (ti < 0) return prev;
      seqs.splice(pos === 'before' ? ti : ti + 1, 0, item);
      return { ...prev, sequences: seqs };
    });
  }

  function reorderSeances(seqId, fromId, toId, pos) {
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq => {
        if (seq.id !== seqId) return seq;
        const seas = [...seq.seances];
        const fi = seas.findIndex(s => s.id === fromId);
        if (fi < 0) return seq;
        const [item] = seas.splice(fi, 1);
        const ti = seas.findIndex(s => s.id === toId);
        if (ti < 0) return seq;
        seas.splice(pos === 'before' ? ti : ti + 1, 0, item);
        return { ...seq, seances: seas };
      }),
    }));
  }

  function reorderFiches(seqId, seaId, fromId, toId, pos) {
    setProgramme(prev => ({
      ...prev,
      sequences: prev.sequences.map(seq =>
        seq.id !== seqId ? seq : {
          ...seq,
          seances: seq.seances.map(sea => {
            if (sea.id !== seaId) return sea;
            const fiches = [...sea.fiches];
            const fi = fiches.findIndex(f => f.id === fromId);
            if (fi < 0) return sea;
            const [item] = fiches.splice(fi, 1);
            const ti = fiches.findIndex(f => f.id === toId);
            if (ti < 0) return sea;
            fiches.splice(pos === 'before' ? ti : ti + 1, 0, item);
            return { ...sea, fiches };
          }),
        }
      ),
    }));
  }

  function dndStart(e, info) {
    if (e.target.closest('input,textarea,select,button')) { e.preventDefault(); return; }
    dragRef.current = info;
    setDraggingId(info.id);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  }

  function dndOver(e, id, type) {
    if (dragRef.current?.type !== type) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    if (dragOverId?.id !== id || dragOverId?.pos !== pos) setDragOverId({ id, pos });
  }

  function dndLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOverId(null);
  }

  function dndDrop(e, info) {
    e.preventDefault();
    const from = dragRef.current;
    if (!from || from.type !== info.type) return; // laisser l'événement remonter au bon conteneur
    e.stopPropagation();
    const pos = dragOverId?.pos || 'after';
    if (from.id !== info.id) {
      if (from.type === 'sequence') reorderSequences(from.id, info.id, pos);
      else if (from.type === 'seance') reorderSeances(info.seqId, from.id, info.id, pos);
      else if (from.type === 'fiche') reorderFiches(info.seqId, info.seaId, from.id, info.id, pos);
    }
    dndEnd();
  }

  function dndEnd() {
    dragRef.current = null;
    setDraggingId(null);
    setDragOverId(null);
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

  function handleExport(mode = "standard") {
    const errsForm = validerPourExport();
    if (Object.keys(errsForm).length > 0) {
      setValidationErreurs(errsForm);
      setPrerequisWarning(false);
      return;
    }
    setValidationErreurs({});
    if (!programme.prerequis?.trim()) {
      setPendingPrintMode(mode);
      setPrerequisWarning(true);
      return;
    }
    lancerImpression(mode);
  }

  function declencherImpression(mode) {
    if (typeof onLancerImpression === "function") onLancerImpression(mode);
    else window.print();
  }

  function lancerImpression(mode = pendingPrintMode || "standard") {
    setPrerequisWarning(false);
    setPendingPrintMode(null);
    const { valide, erreurs } = verifierAlignementPedagogique(programme);
    if (valide) {
      declencherImpression(mode);
      return;
    }
    const message =
      "L'alignement pédagogique présente des failles :\n" +
      erreurs.map(e => `- ${e}`).join("\n") +
      "\n\nVoulez-vous imprimer quand même ?";
    if (window.confirm(message)) declencherImpression(mode);
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
              {totalFiches} activité{totalFiches !== 1 ? "s" : ""}
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
            <div className="seq-jauge-track" onMouseLeave={() => setTooltipData(null)}>
              <div className="seq-jauge-custom">
                {jaugeSegments.map((seg, i) => (
                  <div
                    key={i}
                    className={`seq-jauge-seg seq-jauge-seg-${seg.key}`}
                    style={{width: `${seg.pct}%`, minWidth: seg.pct === 0 ? '3px' : undefined}}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipData({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                        seg,
                      });
                    }}
                  />
                ))}
              </div>
              {tooltipData && (
                <div
                  className="seq-jauge-tooltip"
                  style={{ left: tooltipData.x, top: tooltipData.y }}
                >
                  <span className="seq-jauge-tooltip-titre">{tooltipData.seg.label}</span>
                  {tooltipData.seg.dureeLabel && <span className="seq-jauge-tooltip-duree">{tooltipData.seg.dureeLabel}</span>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="panel-body seq-builder-body">
        <div className="seq-programme">
          <div className="seq-programme-card">
            <div className="seq-row seq-programme-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', flexShrink: 0}}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              {renderTitre(programme.id, programme.titre, "seq-programme-titre")}
            </div>
            <div className="seq-programme-props">
              <div className="seq-madlibs">
                <span className="seq-madlibs-prefix">À l'issue de cette formation, l'apprenant sera capable de :</span>
                <div className="seq-madlibs-inputs">
                  <select
                    className={`seq-opo-select${validationErreurs.prog_objectif ? " seq-input-error" : ""}`}
                    value={programme.objectif_bloom || ""}
                    onChange={e => { updateProgrammeField("objectif_bloom", e.target.value); clearValidationError("prog_objectif"); }}
                  >
                    <option value="">— Verbe d'action * —</option>
                    {VERBES_BLOOM_GROUPED.map(g => (
                      <optgroup key={g.niveau} label={g.niveau}>
                        {g.verbes.map(v => <option key={v} value={v}>{v}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <input
                    className={`seq-objectif-input${validationErreurs.prog_objectif ? " seq-input-error" : ""}`}
                    value={programme.objectif_action || ""}
                    placeholder="… *"
                    onChange={e => { updateProgrammeField("objectif_action", e.target.value); clearValidationError("prog_objectif"); }}
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
              <div className="seq-madlibs-simple">
                <span className="seq-madlibs-prefix">Prérequis :</span>
                <textarea
                  className="seq-objectif-input"
                  value={programme.prerequis || ""}
                  placeholder="Connaissances ou compétences requises avant la formation..."
                  onChange={e => { updateProgrammeField("prerequis", e.target.value); if (prerequisWarning && e.target.value.trim()) setPrerequisWarning(false); }}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="seq-tree seq-programme-children">
            {programme.sequences.length === 0 && (
              <div className="seq-empty">
                <p className="seq-empty-text">Commencez par créer une séquence.</p>
              </div>
            )}

            {programme.sequences.map((seq, seqIdx) => {
              const seqCollapsed = collapsed.has(seq.id);

              // Calcul alignement Programme -> Sequence
              const progLevel = getBloomLevel(programme.objectif_bloom);
              const seqLevel = getBloomLevel(seq.objectif_bloom);
              let seqAlignmentClass = "align-noir";
              if (progLevel > 0 && seqLevel > 0) {
                seqAlignmentClass = seqLevel <= progLevel ? "align-vert" : "align-rouge";
              }

              return (
                <div
                  key={seq.id}
                  className={`seq-sequence ${seqAlignmentClass}${draggingId === seq.id ? ' dnd-dragging' : ''}${dragOverId?.id === seq.id ? ` dnd-${dragOverId.pos}` : ''}`}
                  draggable
                  onDragStart={e => dndStart(e, { type: 'sequence', id: seq.id })}
                  onDragOver={e => dndOver(e, seq.id, 'sequence')}
                  onDragLeave={dndLeave}
                  onDrop={e => dndDrop(e, { type: 'sequence', id: seq.id })}
                  onDragEnd={dndEnd}
                >
                  <div className="seq-sequence-card">
                  <div className="seq-row seq-sequence-row">
                    <span className="seq-drag-handle" title="Glisser pour réorganiser">
                      <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><circle cx="3" cy="2" r="1.5"/><circle cx="7" cy="2" r="1.5"/><circle cx="3" cy="7" r="1.5"/><circle cx="7" cy="7" r="1.5"/><circle cx="3" cy="12" r="1.5"/><circle cx="7" cy="12" r="1.5"/></svg>
                    </span>
                    <button className="seq-collapse-btn" onClick={() => toggleCollapse(seq.id)}>
                      {seqCollapsed ? "▶" : "▼"}
                    </button>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', flexShrink: 0}}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    {renderTitre(seq.id, seq.titre, "seq-sequence-titre")}
                    <div className="seq-move-btns">
                      <button className="seq-move-btn" onClick={() => moveSequence(seq.id, -1)} title="Monter" disabled={seqIdx === 0}>↑</button>
                      <button className="seq-move-btn" onClick={() => moveSequence(seq.id, 1)} title="Descendre" disabled={seqIdx === programme.sequences.length - 1}>↓</button>
                    </div>
                    <button className="seq-remove-btn" onClick={() => removeSequence(seq.id)} title="Supprimer la séquence">×</button>
                  </div>

                  {!seqCollapsed && (
                    <div className="seq-sequence-props">
                      <div className="seq-madlibs">
                        <span className="seq-madlibs-prefix">À l'issue de cette séquence, l'apprenant sera capable de :</span>
                        <div className="seq-madlibs-inputs">
                          <select
                            className={`seq-opo-select${validationErreurs[`seq_${seq.id}`] ? " seq-input-error" : ""}`}
                            value={seq.objectif_bloom || ""}
                            onChange={e => { updateSeqField(seq.id, "objectif_bloom", e.target.value); clearValidationError(`seq_${seq.id}`); }}
                          >
                            <option value="">— Verbe d'action * —</option>
                            {VERBES_BLOOM_GROUPED.map(g => (
                              <optgroup key={g.niveau} label={g.niveau}>
                                {g.verbes.map(v => <option key={v} value={v}>{v}</option>)}
                              </optgroup>
                            ))}
                          </select>
                          <input
                            className={`seq-objectif-input${validationErreurs[`seq_${seq.id}`] ? " seq-input-error" : ""}`}
                            value={seq.objectif_action || ""}
                            placeholder="… *"
                            onChange={e => { updateSeqField(seq.id, "objectif_action", e.target.value); clearValidationError(`seq_${seq.id}`); }}
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
                    </div>
                  )}
                </div>

                {!seqCollapsed && seq.seances.length === 0 && (
                  <button className="seq-add-btn seq-add-seance-btn-empty" onClick={() => addSeance(seq.id)}>
                    + Séance
                  </button>
                )}

                {!seqCollapsed && seq.seances.length > 0 && (
                  <>
                  <div className="seq-sequence-children">
                    {seq.seances.map((sea, seaIdx) => {
                      const seaCollapsed = collapsed.has(sea.id);
                      const toutFiches = sea.fiches.map(f => {
                        if (f.type === "texte") return { key: f.id, type: "texte", fiche: f };
                        const activite = toutesActivites.find(a => a.id === f.activite_id);
                        return activite ? { key: f.id, type: "activite", fiche: f, activite } : null;
                      }).filter(Boolean);

                      // Calcul alignement Sequence -> Seance
                      const seqLevel = getBloomLevel(seq.objectif_bloom);
                      const seaLevel = getBloomLevel(sea.opo_bloom);
                      let seaAlignmentClass = "align-noir";
                      if (seqLevel > 0 && seaLevel > 0) {
                        seaAlignmentClass = seaLevel <= seqLevel ? "align-vert" : "align-rouge";
                      }

                      return (
                        <div
                          key={sea.id}
                          className={`seq-seance ${seaAlignmentClass}${draggingId === sea.id ? ' dnd-dragging' : ''}${dragOverId?.id === sea.id ? ` dnd-${dragOverId.pos}` : ''}`}
                          draggable
                          onDragStart={e => dndStart(e, { type: 'seance', id: sea.id, seqId: seq.id })}
                          onDragOver={e => dndOver(e, sea.id, 'seance')}
                          onDragLeave={dndLeave}
                          onDrop={e => dndDrop(e, { type: 'seance', id: sea.id, seqId: seq.id })}
                          onDragEnd={dndEnd}
                        >
                          <div className="seq-seance-card">
                            <div className="seq-row seq-seance-row">
                              <span className="seq-drag-handle" title="Glisser pour réorganiser">
                                <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><circle cx="3" cy="2" r="1.5"/><circle cx="7" cy="2" r="1.5"/><circle cx="3" cy="7" r="1.5"/><circle cx="7" cy="7" r="1.5"/><circle cx="3" cy="12" r="1.5"/><circle cx="7" cy="12" r="1.5"/></svg>
                              </span>
                              <button className="seq-collapse-btn seq-collapse-btn-sm" onClick={() => toggleCollapse(sea.id)}>
                                {seaCollapsed ? "▶" : "▼"}
                              </button>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px', flexShrink: 0}}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                              {renderTitre(sea.id, sea.titre, "seq-seance-titre")}
                              <div className="seq-move-btns">
                                <button className="seq-move-btn" onClick={() => moveSeance(seq.id, sea.id, -1)} title="Monter" disabled={seqIdx === 0 && seaIdx === 0}>↑</button>
                                <button className="seq-move-btn" onClick={() => moveSeance(seq.id, sea.id, 1)} title="Descendre" disabled={seqIdx === programme.sequences.length - 1 && seaIdx === seq.seances.length - 1}>↓</button>
                              </div>
                              <button className="seq-remove-btn" onClick={() => removeSeance(seq.id, sea.id)} title="Supprimer la séance">×</button>
                            </div>

                            {!seaCollapsed && (
                              <div className="seq-seance-props">
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
                                      className={`seq-opo-select${validationErreurs[`sea_${sea.id}`] ? " seq-input-error" : ""}`}
                                      value={sea.opo_bloom || ""}
                                      onChange={e => { updateOpoSeance(seq.id, sea.id, "opo_bloom", e.target.value); clearValidationError(`sea_${sea.id}`); }}
                                    >
                                      <option value="">— Verbe d'action * —</option>
                                      {VERBES_BLOOM_GROUPED.map(g => (
                                        <optgroup key={g.niveau} label={g.niveau}>
                                          {g.verbes.map(v => <option key={v} value={v}>{v}</option>)}
                                        </optgroup>
                                      ))}
                                    </select>
                                    <input
                                      className={`seq-objectif-input${validationErreurs[`sea_${sea.id}`] ? " seq-input-error" : ""}`}
                                      value={sea.opo_verbe || ""}
                                      placeholder="… *"
                                      onChange={e => { updateOpoSeance(seq.id, sea.id, "opo_verbe", e.target.value); clearValidationError(`sea_${sea.id}`); }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {!seaCollapsed && toutFiches.length > 0 && (
                            <div className="seq-fiches">
                              {toutFiches.map((item, ficheIdx) => {
                                  if (item.type === "texte") {
                                    const f = item.fiche;
                                    return (
                                      <div
                                        key={item.key}
                                        className={`seq-fiche seq-fiche-encart${draggingId === f.id ? ' dnd-dragging' : ''}${dragOverId?.id === f.id ? ` dnd-${dragOverId.pos}` : ''}`}
                                        draggable
                                        onDragStart={e => dndStart(e, { type: 'fiche', id: f.id, seqId: seq.id, seaId: sea.id })}
                                        onDragOver={e => dndOver(e, f.id, 'fiche')}
                                        onDragLeave={dndLeave}
                                        onDrop={e => dndDrop(e, { type: 'fiche', id: f.id, seqId: seq.id, seaId: sea.id })}
                                        onDragEnd={dndEnd}
                                      >
                                        <div className="seq-fiche-content">
                                          <input
                                            className="seq-encart-titre"
                                            type="text"
                                            placeholder="Titre de l'encart…"
                                            value={f.titre || ""}
                                            onChange={e => updateFicheEncart(seq.id, sea.id, f.id, "titre", e.target.value)}
                                          />
                                          <textarea
                                            className="seq-encart-contenu"
                                            placeholder="Contenu…"
                                            value={f.contenu || ""}
                                            onChange={e => updateFicheEncart(seq.id, sea.id, f.id, "contenu", e.target.value)}
                                            rows={2}
                                          />
                                          <div className="seq-encart-duree-row">
                                            <svg className="seq-fiche-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            <input
                                              className="seq-encart-duree"
                                              type="number"
                                              min="0"
                                              placeholder="0"
                                              value={f.duree_min || ""}
                                              onChange={e => updateFicheEncart(seq.id, sea.id, f.id, "duree_min", parseInt(e.target.value) || 0)}
                                            />
                                            <span className="seq-duree-cible-unit">min</span>
                                          </div>
                                        </div>
                                        <div className="seq-fiche-actions">
                                          <span className="seq-drag-handle seq-drag-handle-fiche" title="Glisser pour réorganiser">
                                            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><circle cx="3" cy="2" r="1.5"/><circle cx="7" cy="2" r="1.5"/><circle cx="3" cy="7" r="1.5"/><circle cx="7" cy="7" r="1.5"/><circle cx="3" cy="12" r="1.5"/><circle cx="7" cy="12" r="1.5"/></svg>
                                          </span>
                                          <div className="seq-move-btns">
                                            <button className="seq-move-btn" onClick={() => moveFiche(seq.id, sea.id, f.id, -1)} title="Monter" disabled={ficheIdx === 0 && seaIdx === 0}>↑</button>
                                            <button className="seq-move-btn" onClick={() => moveFiche(seq.id, sea.id, f.id, 1)} title="Descendre" disabled={ficheIdx === toutFiches.length - 1 && seaIdx === seq.seances.length - 1}>↓</button>
                                          </div>
                                          <button className="seq-remove-btn" onClick={() => removeFiche(seq.id, sea.id, f.id)} title="Retirer">×</button>
                                        </div>
                                      </div>
                                    );
                                  }
                                  const { fiche, activite } = item;
                                  const modalites = activite.modalite || [];
                                  return (
                                    <div
                                      key={item.key}
                                      className={`seq-fiche ${methodeClass(activite)}${draggingId === fiche.id ? ' dnd-dragging' : ''}${dragOverId?.id === fiche.id ? ` dnd-${dragOverId.pos}` : ''}`}
                                      draggable
                                      onDragStart={e => dndStart(e, { type: 'fiche', id: fiche.id, seqId: seq.id, seaId: sea.id })}
                                      onDragOver={e => dndOver(e, fiche.id, 'fiche')}
                                      onDragLeave={dndLeave}
                                      onDrop={e => dndDrop(e, { type: 'fiche', id: fiche.id, seqId: seq.id, seaId: sea.id })}
                                      onDragEnd={dndEnd}
                                    >
                                      <div className="seq-fiche-content">
                                        <span className="seq-fiche-titre">{activite.titre}</span>
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
                                      <div className="seq-fiche-actions">
                                        <span className="seq-drag-handle seq-drag-handle-fiche" title="Glisser pour réorganiser">
                                          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><circle cx="3" cy="2" r="1.5"/><circle cx="7" cy="2" r="1.5"/><circle cx="3" cy="7" r="1.5"/><circle cx="7" cy="7" r="1.5"/><circle cx="3" cy="12" r="1.5"/><circle cx="7" cy="12" r="1.5"/></svg>
                                        </span>
                                        <div className="seq-move-btns">
                                          <button className="seq-move-btn" onClick={() => moveFiche(seq.id, sea.id, fiche.id, -1)} title="Monter" disabled={ficheIdx === 0 && seaIdx === 0}>↑</button>
                                          <button className="seq-move-btn" onClick={() => moveFiche(seq.id, sea.id, fiche.id, 1)} title="Descendre" disabled={ficheIdx === toutFiches.length - 1 && seaIdx === seq.seances.length - 1}>↓</button>
                                        </div>
                                        <button
                                          className="seq-remove-btn"
                                          onClick={() => removeFiche(seq.id, sea.id, fiche.id)}
                                          title="Retirer"
                                        >×</button>
                                      </div>
                                    </div>
                                  );
                                })
                              }
                            </div>
                          )}
                          {!seaCollapsed && (
                            <div className="seq-seance-add-area">
                              {toutFiches.length === 0 && (
                                <p className="seq-fiche-empty">Aucune activité assignée</p>
                              )}
                              <button className="seq-add-btn seq-add-encart-btn" onClick={() => addEncart(seq.id, sea.id)}>
                                + Encart
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  </div>
                  <button className="seq-add-btn seq-add-seance-after" onClick={() => addSeance(seq.id)}>
                    + Séance
                  </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
        </div>

        <button className="seq-add-btn seq-add-sequence-btn" onClick={addSequence}>
          + Séquence
        </button>
      </div>

      <div className="panel-footer">
        {Object.keys(validationErreurs).length > 0 && (
          <div className="seq-validation-banner">
            ⚠ Champs requis manquants — vérifiez les zones marquées en rouge.
          </div>
        )}
        {prerequisWarning && (
          <div className="seq-prerequis-warning">
            <span>⚠ Le champ Prérequis est vide — le document sera moins complet.</span>
            <button className="seq-prerequis-warning-btn" onClick={() => lancerImpression(pendingPrintMode || "standard")}>
              Imprimer quand même
            </button>
          </div>
        )}

        {/* Dropdown Programme — Export / Import .sqa */}
        <div className="seq-programme-menu-wrapper">
          <button
            className="btn btn-print seq-programme-btn"
            onClick={() => setIsProgrammeMenuOpen(o => !o)}
          >
            Programme ▼
          </button>
          {isProgrammeMenuOpen && (
            <div className="seq-programme-dropdown">
              <button className="seq-programme-dropdown-item" onClick={() => { onExportSQA?.(); setIsProgrammeMenuOpen(false); }}>
                📤 Exporter un programme
              </button>
              <button className="seq-programme-dropdown-item" onClick={() => { fileInputRef.current?.click(); setIsProgrammeMenuOpen(false); }}>
                📥 Importer un programme
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".sqa"
            className="sqa-file-input-hidden"
            onChange={e => { const f = e.target.files[0]; if (f) { onImportSQA?.(f); e.target.value = ""; } }}
          />
        </div>

        {totalFiches === 0 ? (
          <span className="panel-footnote">Créez des séquences, puis assignez des activités</span>
        ) : (
          <div className="seq-print-menu-wrapper">
            <button
              className="btn btn-print seq-print-btn"
              onClick={() => setIsPrintMenuOpen(o => !o)}
            >
              &#128438; Imprimer / PDF ▼
            </button>
            {isPrintMenuOpen && (
              <div className="seq-print-dropdown">
                <button
                  className="seq-print-dropdown-item"
                  onClick={() => { setIsPrintMenuOpen(false); handleExport("standard"); }}
                >
                  📄 Imprimer le programme
                </button>
                <button
                  className="seq-print-dropdown-item seq-print-dropdown-item-qualiopi"
                  onClick={() => { setIsPrintMenuOpen(false); handleExport("qualiopi"); }}
                >
                  ✓ Générer la grille d'audit Qualiopi
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
