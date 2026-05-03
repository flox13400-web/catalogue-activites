import React, { useState, useRef, useEffect, useCallback } from "react";
import "../styles/carnet.css";

const CARNET_KEYS = {
  mode: "carnet_mode",
  libre: "carnet_libre_html",
  programme: "carnet_programme",
};

const PROGRAMME_VIDE = {
  objectif: "",
  etapes: [{ duree: "", description: "", note: "", showNote: false }],
};

const COULEURS_TEXTE = [
  "#1A2B4C", "#c0392b", "#D46A54", "#e67e22",
  "#2e7d32", "#4A90C4", "#6b3fa0", "#7f8c8d",
];

const COULEURS_SURLIGNEUR = [
  { val: "",        label: "Aucun"  },
  { val: "#FFFF99", label: "Jaune"  },
  { val: "#B3FFB3", label: "Vert"   },
  { val: "#FFB3C6", label: "Rose"   },
  { val: "#B3D9FF", label: "Bleu"   },
  { val: "#FFD9B3", label: "Orange" },
  { val: "#E8D5F5", label: "Violet" },
];

function ColorPopover({ colors, type, onPick }) {
  return (
    <div className="tb-popover">
      {colors.map((c, i) => {
        const bg = type === "text" ? c : c.val;
        const isEmpty = type !== "text" && !c.val;
        return (
          <button
            key={i}
            className="tb-swatch"
            style={{ background: bg || "#fff", border: "1px solid #ddd" }}
            title={type === "text" ? c : c.label}
            onMouseDown={e => { e.preventDefault(); onPick(bg); }}
          >
            {isEmpty && (
              <span style={{ color: "#c0392b", fontSize: "13px", fontWeight: "bold", lineHeight: 1 }}>×</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Toolbar({ execCmd }) {
  const [popover, setPopover] = useState(null);

  useEffect(() => {
    if (!popover) return;
    const close = () => setPopover(null);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [popover]);

  const cmd = (c, v = null) => { execCmd(c, v); setPopover(null); };

  return (
    <div className="carnet-toolbar">
      <button className="tb-btn tb-h" onMouseDown={e => { e.preventDefault(); cmd("formatBlock", "h1"); }} title="Titre 1">T1</button>
      <button className="tb-btn tb-h" onMouseDown={e => { e.preventDefault(); cmd("formatBlock", "h2"); }} title="Titre 2">T2</button>
      <button className="tb-btn tb-h" onMouseDown={e => { e.preventDefault(); cmd("formatBlock", "h3"); }} title="Titre 3">T3</button>
      <span className="tb-sep" />
      <button className="tb-btn tb-bold"      onMouseDown={e => { e.preventDefault(); cmd("bold"); }}      title="Gras (Ctrl+B)">G</button>
      <button className="tb-btn tb-italic"    onMouseDown={e => { e.preventDefault(); cmd("italic"); }}    title="Italique (Ctrl+I)">I</button>
      <button className="tb-btn tb-underline" onMouseDown={e => { e.preventDefault(); cmd("underline"); }} title="Souligné (Ctrl+U)">S</button>
      <span className="tb-sep" />
      <button
        className="tb-btn"
        onMouseDown={e => { e.preventDefault(); cmd("insertUnorderedList"); }}
        title="Liste à puces"
      >
        <svg viewBox="0 0 20 16" width="17" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="2.5" cy="3"  r="1.8" fill="currentColor" stroke="none" />
          <line x1="7" y1="3"  x2="19" y2="3" />
          <circle cx="2.5" cy="8"  r="1.8" fill="currentColor" stroke="none" />
          <line x1="7" y1="8"  x2="19" y2="8" />
          <circle cx="2.5" cy="13" r="1.8" fill="currentColor" stroke="none" />
          <line x1="7" y1="13" x2="19" y2="13" />
        </svg>
      </button>
      <span className="tb-sep" />

      {/* Couleur du texte */}
      <div className="tb-color-wrap" onMouseDown={e => e.stopPropagation()}>
        <button
          className="tb-btn"
          onMouseDown={e => { e.preventDefault(); setPopover(p => p === "text" ? null : "text"); }}
          title="Couleur du texte"
        >
          <span className="tb-color-a">A</span>
        </button>
        {popover === "text" && (
          <ColorPopover
            colors={COULEURS_TEXTE}
            type="text"
            onPick={c => { execCmd("foreColor", c); setPopover(null); }}
          />
        )}
      </div>

      {/* Surlignage */}
      <div className="tb-color-wrap" onMouseDown={e => e.stopPropagation()}>
        <button
          className="tb-btn"
          onMouseDown={e => { e.preventDefault(); setPopover(p => p === "hl" ? null : "hl"); }}
          title="Surligner"
        >
          <svg viewBox="0 0 18 16" width="17" height="15" fill="none">
            <rect x="1" y="10" width="16" height="5" rx="1" fill="#FFFF99" stroke="#bbb" strokeWidth="0.8" />
            <path d="M5.5 10 L9 1.5 L12.5 10 Z" fill="currentColor" />
          </svg>
        </button>
        {popover === "hl" && (
          <ColorPopover
            colors={COULEURS_SURLIGNEUR}
            type="hl"
            onPick={c => { execCmd("backColor", c || "#ffffff"); setPopover(null); }}
          />
        )}
      </div>

      <span className="tb-sep" />
      <button
        className="tb-btn tb-remove-fmt"
        onMouseDown={e => { e.preventDefault(); cmd("removeFormat"); }}
        title="Effacer la mise en forme"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="3" y1="3" x2="13" y2="13" />
          <line x1="13" y1="3" x2="3" y2="13" />
        </svg>
      </button>
    </div>
  );
}

function ProgrammeEditor({ data, onChange }) {
  const update = patch => onChange({ ...data, ...patch });

  const updateEtape = (idx, patch) =>
    update({ etapes: data.etapes.map((e, i) => i === idx ? { ...e, ...patch } : e) });

  const addEtape = () =>
    update({ etapes: [...data.etapes, { duree: "", description: "", note: "", showNote: false }] });

  const removeEtape = idx => {
    const etapes = data.etapes.filter((_, i) => i !== idx);
    update({ etapes: etapes.length ? etapes : [{ duree: "", description: "", note: "", showNote: false }] });
  };

  return (
    <div className="carnet-programme">
      <div className="prog-objectif-row">
        <span className="prog-field-label">Objectif</span>
        <input
          className="prog-objectif-input"
          value={data.objectif}
          onChange={e => update({ objectif: e.target.value })}
          placeholder="Objectif général de la formation..."
        />
      </div>

      <div className="prog-etapes">
        {data.etapes.map((etape, idx) => (
          <div key={idx} className="prog-etape-block">
            <div className="prog-etape-line">
              <span className="prog-num">{idx + 1}.</span>
              <div className="prog-champs">
                <span className="prog-field-label">Durée</span>
                <input
                  className="prog-input prog-input-duree"
                  value={etape.duree}
                  onChange={e => updateEtape(idx, { duree: e.target.value })}
                  placeholder="ex : 30 min"
                />
                <span className="prog-field-label">Description</span>
                <input
                  className="prog-input prog-input-desc"
                  value={etape.description}
                  onChange={e => updateEtape(idx, { description: e.target.value })}
                  placeholder="Décrivez cette étape..."
                />
              </div>
              <div className="prog-actions">
                <button
                  className={`prog-note-btn${etape.showNote ? " prog-note-btn--on" : ""}`}
                  onClick={() => updateEtape(idx, { showNote: !etape.showNote })}
                  title={etape.showNote ? "Masquer la note" : "Ajouter une note libre"}
                >
                  📝
                </button>
                {data.etapes.length > 1 && (
                  <button className="prog-del-btn" onClick={() => removeEtape(idx)} title="Supprimer cette étape">×</button>
                )}
              </div>
            </div>
            {etape.showNote && (
              <textarea
                className="prog-note-textarea"
                value={etape.note}
                onChange={e => updateEtape(idx, { note: e.target.value })}
                placeholder="Note libre entre les étapes..."
                rows={3}
              />
            )}
          </div>
        ))}
      </div>

      <button className="prog-add-btn" onClick={addEtape}>+ Ajouter une étape</button>
    </div>
  );
}

export function CarnetNotes({ onClose }) {
  const [mode, setMode] = useState(() => localStorage.getItem(CARNET_KEYS.mode) || "libre");
  const [programme, setProgramme] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(CARNET_KEYS.programme));
      if (s?.etapes) return s;
    } catch {}
    return PROGRAMME_VIDE;
  });

  const editorRef = useRef(null);

  const editorCallbackRef = useCallback(node => {
    editorRef.current = node;
    if (node) {
      const saved = localStorage.getItem(CARNET_KEYS.libre);
      if (saved) node.innerHTML = saved;
    }
  }, []);

  useEffect(() => { localStorage.setItem(CARNET_KEYS.mode, mode); }, [mode]);
  useEffect(() => { localStorage.setItem(CARNET_KEYS.programme, JSON.stringify(programme)); }, [programme]);

  const execCmd = useCallback((cmd, val = null) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  }, []);

  const saveLibre = () => {
    if (editorRef.current) localStorage.setItem(CARNET_KEYS.libre, editorRef.current.innerHTML);
  };

  return (
    <div className="carnet-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="carnet-modal">
        <div className="carnet-header">
          <div className="carnet-header-left">
            <span className="carnet-icon">📓</span>
            <span className="carnet-title">Carnet de notes</span>
          </div>
          <div className="carnet-tabs">
            <button
              className={`carnet-tab${mode === "libre" ? " carnet-tab--active" : ""}`}
              onClick={() => setMode("libre")}
            >
              Texte libre
            </button>
            <button
              className={`carnet-tab${mode === "programme" ? " carnet-tab--active" : ""}`}
              onClick={() => setMode("programme")}
            >
              Programme pédagogique
            </button>
          </div>
          <button className="carnet-close" onClick={onClose} title="Fermer">×</button>
        </div>

        {mode === "libre" && <Toolbar execCmd={execCmd} />}

        <div className="carnet-body">
          {mode === "libre" ? (
            <div
              ref={editorCallbackRef}
              contentEditable
              suppressContentEditableWarning
              className="carnet-editor"
              onInput={saveLibre}
            />
          ) : (
            <ProgrammeEditor data={programme} onChange={setProgramme} />
          )}
        </div>
      </div>
    </div>
  );
}
