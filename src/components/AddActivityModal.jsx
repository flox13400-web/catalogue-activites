import React from "react";
import "../styles/modal.css";

// ── Constantes formulaire ──────────────────────────────────────

const AGES_DISPONIBLES = ["Primaire", "Collège", "Lycée", "Post-bac", "Adultes"];
const DUREES_DISPONIBLES = ["0-15min", "15-30min", "30-45min", "45-60min", ">60min"];
const DUREES_OK = new Set(DUREES_DISPONIBLES);
const TAILLES_GROUPE_DISPONIBLES = ["1", "2-6", "7-12", ">12"];
const MODALITES_DISPONIBLES = ["Présentielle", "Distanciel", "Synchrone", "Asynchrone"];

// ── Utilitaire ID ──────────────────────────────────────────────

export function genererIdActivite(activites) {
  const nums = activites
    .map((a) => {
      const m = a.id.match(/^CUS-(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter(Boolean);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `CUS-${String(next).padStart(3, "0")}`;
}

// ── Parsers d'import ───────────────────────────────────────────

export function parserJSON(texte) {
  const data = JSON.parse(texte);
  const liste = Array.isArray(data) ? data : (Array.isArray(data.activites) ? data.activites : null);
  if (!liste) throw new Error("Format JSON non reconnu. Attendu : un tableau ou { activites: [...] }");

  const CHAMPS_REQUIS = ["titre", "duree"];
  return liste.map((a, i) => {
    for (const c of CHAMPS_REQUIS) {
      if (a[c] === undefined || a[c] === null) throw new Error(`Activité ${i + 1} : champ manquant « ${c} »`);
    }
    const norm = (v) => Array.isArray(v) ? v : (v ? String(v).split(/\s*[,|]\s*/).map(x => x.trim()).filter(Boolean) : []);
    return {
      id: a.id || null,
      titre: String(a.titre).trim(),
      age_public: norm(a.age_public ?? a.public),
      duree: String(a.duree).trim(),
      taille_groupe: norm(a.taille_groupe ?? a.groupe),
      themes: norm(a.themes),
      materiels: norm(a.materiels),
      modalite: norm(a.modalite),
      description: String(a.description || "").trim(),
      apprentissage_cle: String(a.apprentissage_cle || "").trim(),
      problematique: a.problematique ? String(a.problematique).trim() : null,
      remediation: a.remediation ? String(a.remediation).trim() : null,
    };
  });
}

export function parserMarkdown(texte) {
  const sections = texte.split(/\n---+\n/).map((s) => s.trim()).filter(Boolean);
  const activites = [];

  for (const section of sections) {
    const lignes = section.split("\n");

    const ligneTitre = lignes.find((l) => /^##\s/.test(l));
    if (!ligneTitre) continue;

    const mTitre = ligneTitre.match(/^##\s+\d+\.\s+(.+?)(?:\s+`([^`]+)`)?$/);
    if (!mTitre) continue;

    const titre = mTitre[1].trim();
    const id = mTitre[2] || null;

    function extraireChamp(label) {
      const re = new RegExp(`\\*\\*${label}\\s*:\\*\\*\\s*(.+)`);
      const l = lignes.find((x) => re.test(x));
      return l ? l.match(re)[1].trim() : "";
    }

    function extraireSection(label) {
      const idx = lignes.findIndex((l) => new RegExp(`^###\\s+${label}`).test(l));
      if (idx === -1) return "";
      const fin = lignes.findIndex((l, i) => i > idx && /^###/.test(l));
      const bloc = lignes.slice(idx + 1, fin === -1 ? undefined : fin);
      return bloc.map(l => l.replace(/^>\s*/, "").trim()).filter(Boolean).join("\n");
    }

    const splitter = (s) => s ? s.split(/\s*[,|]\s*/).map((x) => x.trim()).filter(Boolean) : [];

    const dureeStr = extraireChamp("Durée");
    const duree = [...DUREES_OK].find(d => dureeStr.includes(d)) || dureeStr || "30-45min";

    if (!titre) continue;

    activites.push({
      id,
      titre,
      age_public: splitter(extraireChamp("Âge du public") || extraireChamp("Public")),
      duree,
      taille_groupe: splitter(extraireChamp("Taille de groupe") || extraireChamp("Groupe")),
      themes: splitter(extraireChamp("Thèmes")),
      materiels: splitter(extraireChamp("Matériels")),
      modalite: splitter(extraireChamp("Modalité")),
      description: extraireSection("Description"),
      apprentissage_cle: extraireSection("Apprentissage clé"),
      problematique: extraireSection("Problématique") || null,
      remediation: extraireSection("Remédiation") || null,
    });
  }

  if (activites.length === 0) throw new Error("Aucune activité reconnue dans ce fichier Markdown.");
  return activites;
}

export function parserCSV(texte) {
  const contenu = texte.replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lignes = contenu.split("\n").filter(l => l.trim());
  if (lignes.length < 2) throw new Error("Le fichier CSV doit contenir une ligne d'en-têtes et au moins une ligne de données.");

  function parseLigne(ligne, sep) {
    const champs = [];
    let courant = "", guillemets = false;
    for (let i = 0; i < ligne.length; i++) {
      const c = ligne[i];
      if (c === '"') {
        if (guillemets && ligne[i + 1] === '"') { courant += '"'; i++; }
        else guillemets = !guillemets;
      } else if (c === sep && !guillemets) {
        champs.push(courant.trim()); courant = "";
      } else {
        courant += c;
      }
    }
    champs.push(courant.trim());
    return champs;
  }

  const sep = (lignes[0].split(";").length >= lignes[0].split(",").length) ? ";" : ",";
  const entetes = parseLigne(lignes[0], sep).map(h => h.toLowerCase().trim());
  const obligatoires = ["titre", "duree"];
  const manquantes = obligatoires.filter(c => !entetes.includes(c));
  if (manquantes.length > 0) throw new Error(`Colonnes manquantes : ${manquantes.join(", ")}. Téléchargez le modèle pour avoir la bonne structure.`);

  const idx = (nom) => entetes.indexOf(nom);
  const get = (champs, nom) => idx(nom) >= 0 ? (champs[idx(nom)] || "").trim() : "";
  const split = (s) => s ? s.split(/\s*\|\s*/).map(x => x.trim()).filter(Boolean) : [];

  const activites = lignes.slice(1).map(ligne => {
    const c = parseLigne(ligne, sep);
    const titre = get(c, "titre");
    if (!titre) return null;
    const dureeStr = get(c, "duree");
    const duree = [...DUREES_OK].find(d => dureeStr.includes(d)) || dureeStr || "30-45min";
    const problematique = get(c, "problematique") || null;
    const remediation = get(c, "remediation") || null;
    return {
      id: get(c, "id") || null,
      titre,
      age_public: split(get(c, "age_public") || get(c, "public")),
      duree,
      taille_groupe: split(get(c, "taille_groupe") || get(c, "groupe")),
      themes: split(get(c, "themes")),
      materiels: split(get(c, "materiels")),
      modalite: split(get(c, "modalite")),
      description: get(c, "description"),
      apprentissage_cle: get(c, "apprentissage_cle"),
      problematique,
      remediation,
    };
  }).filter(Boolean);

  if (activites.length === 0) throw new Error("Aucune activité reconnue. Vérifiez que le fichier n'est pas vide et que les colonnes correspondent au modèle.");
  return activites;
}

function telechargerModeleCSV() {
  const entetes = "titre;age_public;duree;taille_groupe;themes;materiels;modalite;description;apprentissage_cle;problematique;remediation";
  const valeurs = [
    "Mon activité pédagogique",
    "Collège | Lycée",
    "30-45min",
    "7-12",
    "Mon thème",
    "Cartes | Tableau",
    "Scolaire",
    "Présentielle",
    "Résumé en 1-2 phrases visible sur la carte.",
    "Déroulé complet de l'activité. Détaillez les étapes, le matériel, les consignes...",
    "Ce que les participants retiennent à l'issue de cette activité.",
    "",
    "",
  ];
  const exemple = valeurs.map(v => `"${v.replace(/"/g, '""')}"`).join(";");
  const blob = new Blob(["﻿" + entetes + "\n" + exemple], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "modele-activites-sequencia.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ── ChoixImportModal ───────────────────────────────────────────

export function ChoixImportModal({ onClose, onManuel, onImport }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-choix" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-eyebrow">Nouvelle activité</div>
        <h2 className="modal-title">Comment voulez-vous ajouter ?</h2>
        <p className="modal-choix-desc">
          Créez une activité en la saisissant manuellement, ou importez un fichier CSV, JSON ou Markdown pour en charger plusieurs d'un coup.
        </p>
        <div className="choix-import-grid">
          <button className="choix-import-card" onClick={onManuel}>
            <span className="choix-import-icon">✍️</span>
            <span className="choix-import-label">Saisie manuelle</span>
            <span className="choix-import-desc">Remplir le formulaire pour créer une seule activité</span>
          </button>
          <button className="choix-import-card" onClick={onImport}>
            <span className="choix-import-icon">📂</span>
            <span className="choix-import-label">Importer un fichier</span>
            <span className="choix-import-desc">Charger un fichier .csv, .json ou .md avec plusieurs activités</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ImportFichierModal ─────────────────────────────────────────

const EXEMPLE_JSON = `[
  {
    "titre": "Nom de l'activité",
    "age_public": ["Collège", "Lycée"],
    "duree": "30-45min",
    "taille_groupe": ["7-12"],
    "themes": ["Mon thème"],
    "materiels": ["Cartes", "Tableau"],
    "modalite": ["Présentielle"],
    "description": "...",
    "apprentissage_cle": "...",
    "problematique": null,
    "remediation": null
  }
]`;

const EXEMPLE_MD = `## 1. Titre de l'activité \`ID\`

**Âge du public :** Collège, Lycée
**Durée :** 30-45min
**Taille de groupe :** 7-12
**Thèmes :** Mon thème
**Matériels :** Cartes, Tableau
**Modalité :** Présentielle

### Description

Déroulé de l'activité...

### Apprentissage clé

> Ce que les participants retiennent.

---`;

export function ImportFichierModal({ onClose, onImport }) {
  const [etat, setEtat] = React.useState("idle");
  const [erreur, setErreur] = React.useState("");
  const [preview, setPreview] = React.useState([]);
  const [dragging, setDragging] = React.useState(false);
  const [copie, setCopie] = React.useState(null);
  const inputRef = React.useRef(null);

  function copierExemple(id, texte) {
    navigator.clipboard.writeText(texte).then(() => {
      setCopie(id);
      setTimeout(() => setCopie(null), 2000);
    });
  }

  function lireFichier(fichier) {
    if (!fichier) return;
    const ext = fichier.name.split(".").pop().toLowerCase();
    if (!["json", "md", "markdown", "csv"].includes(ext)) {
      setErreur(`Format non supporté : .${ext}. Utilisez .csv, .json ou .md`);
      setEtat("erreur");
      return;
    }
    setEtat("lecture");
    setErreur("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const texte = e.target.result;
        const activites = ext === "json" ? parserJSON(texte) : ext === "csv" ? parserCSV(texte) : parserMarkdown(texte);
        setPreview(activites);
        setEtat("preview");
      } catch (err) {
        setErreur(err.message);
        setEtat("erreur");
      }
    };
    reader.onerror = () => { setErreur("Impossible de lire le fichier."); setEtat("erreur"); };
    reader.readAsText(fichier, "utf-8");
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const fichier = e.dataTransfer.files[0];
    if (fichier) lireFichier(fichier);
  }

  function handleChange(e) {
    lireFichier(e.target.files[0]);
  }

  function handleRecommencer() {
    setEtat("idle");
    setPreview([]);
    setErreur("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-import" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-eyebrow">Importer des activités</div>
        <h2 className="modal-title">Import CSV, JSON ou Markdown</h2>

        {etat === "idle" && (
          <>
            <div
              className={`import-dropzone ${dragging ? "import-dropzone-active" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <span className="import-dropzone-icon">📂</span>
              <span className="import-dropzone-label">Glissez un fichier ici ou cliquez pour parcourir</span>
              <span className="import-dropzone-hint">.csv, .json ou .md acceptés</span>
              <input
                ref={inputRef}
                type="file"
                accept=".json,.md,.markdown,.csv"
                className="import-file-hidden"
                onChange={handleChange}
              />
            </div>
            <div className="import-modele-csv">
              <span className="import-modele-csv-label">Vous n'avez pas encore de fichier ?</span>
              <button className="btn-modele-csv" onClick={telechargerModeleCSV} type="button">
                Télécharger le modèle CSV
              </button>
            </div>
            <div className="import-formats">
              <div className="import-format-block">
                <div className="import-format-block-header">
                  <div className="import-format-title">Format JSON attendu</div>
                  <button
                    className={`btn-copier-exemple${copie === "json" ? " btn-copier-exemple-ok" : ""}`}
                    onClick={() => copierExemple("json", EXEMPLE_JSON)}
                    type="button"
                  >{copie === "json" ? "Copié !" : "Copier"}</button>
                </div>
                <pre className="import-format-code">{EXEMPLE_JSON}</pre>
              </div>
              <div className="import-format-block">
                <div className="import-format-block-header">
                  <div className="import-format-title">Format Markdown (export catalogue)</div>
                  <button
                    className={`btn-copier-exemple${copie === "md" ? " btn-copier-exemple-ok" : ""}`}
                    onClick={() => copierExemple("md", EXEMPLE_MD)}
                    type="button"
                  >{copie === "md" ? "Copié !" : "Copier"}</button>
                </div>
                <pre className="import-format-code">{EXEMPLE_MD}</pre>
              </div>
            </div>
          </>
        )}

        {etat === "lecture" && (
          <div className="import-loading">⏳ Lecture du fichier en cours…</div>
        )}

        {etat === "erreur" && (
          <div className="import-erreur-bloc">
            <div className="import-erreur-titre">❌ Erreur de parsing</div>
            <div className="import-erreur-msg">{erreur}</div>
            <button className="btn import-btn-retry" onClick={handleRecommencer}>
              Réessayer avec un autre fichier
            </button>
          </div>
        )}

        {etat === "preview" && (
          <>
            <div className="import-preview-header">
              <span className="import-preview-count">
                ✅ {preview.length} activité{preview.length > 1 ? "s" : ""} prête{preview.length > 1 ? "s" : ""} à importer
              </span>
              <button className="btn-reset import-changer-fichier" onClick={handleRecommencer}>
                Changer de fichier
              </button>
            </div>
            <div className="import-preview-list">
              {preview.map((a, i) => (
                <div key={i} className="import-preview-item">
                  <span className="import-preview-num">{i + 1}</span>
                  <div className="import-preview-info">
                    <div className="import-preview-titre">{a.titre}</div>
                    <div className="import-preview-meta">
                      {(a.age_public || []).join(", ")} · {a.duree}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => onImport(preview)}>
                ✚ Importer {preview.length} activité{preview.length > 1 ? "s" : ""}
              </button>
              <button className="btn-reset modal-annuler" onClick={onClose}>Annuler</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Extrait un tableau dédoublonné et trié des mots-clés d'une propriété spécifique
 * à partir du catalogue d'activités.
 * 
 * @param {Array<Object>} activites - Le tableau des activités du catalogue.
 * @param {string} cle - La propriété à extraire (ex: "themes", "materiels").
 * @returns {string[]} Un tableau de chaînes de caractères dédoublonnées et triées.
 */
export function extraireTagsUniques(activites, cle) {
  const set = new Set();
  for (const a of activites || []) {
    if (Array.isArray(a[cle])) {
      for (const val of a[cle]) set.add(val);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, "fr"));
}

// ── Sélecteur de mots-clés dynamique (creatable multi-select) ──

function CreatableMultiSelect({ label, valeurs, suggestionsDisponibles, onToggle, onAjouter }) {
  const [saisie, setSaisie] = React.useState("");
  const [focus, setFocus] = React.useState(false);

  const matchSaisie = saisie.trim().toLowerCase();
  
  const suggestionsAffichees = suggestionsDisponibles
    .filter(s => !valeurs.includes(s))
    .filter(s => !matchSaisie || s.toLowerCase().includes(matchSaisie));

  const showAjouter = saisie.trim() !== "" 
    && !suggestionsDisponibles.some(s => s.toLowerCase() === matchSaisie)
    && !valeurs.some(v => v.toLowerCase() === matchSaisie);

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = saisie.trim();
      if (val) {
        if (!valeurs.includes(val)) onAjouter(val);
        setSaisie("");
      }
    }
  }

  function handleClickSuggestion(val) {
    onToggle(val);
    setSaisie("");
  }

  function handleAjouterSaisie() {
    const val = saisie.trim();
    if (val) {
      onAjouter(val);
      setSaisie("");
    }
  }

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>

      {valeurs.length > 0 && (
        <div className="form-themes-selected">
          {valeurs.map((v) => (
            <span key={v} className="form-theme-chip">
              {v}
              <button type="button" onClick={() => onToggle(v)} className="form-theme-chip-remove">×</button>
            </span>
          ))}
        </div>
      )}

      <div className="multi-select-container">
        <input
          className="form-input"
          type="text"
          placeholder={`Ajouter ou sélectionner ${label.toLowerCase()}...`}
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onKeyDown={handleKeyDown}
        />
        
        {focus && (suggestionsAffichees.length > 0 || showAjouter) && (
          <div className="multi-select-dropdown" onMouseDown={(e) => e.preventDefault()}>
            {suggestionsAffichees.map(s => (
              <button 
                key={s} 
                className="multi-select-option" 
                type="button" 
                onClick={() => handleClickSuggestion(s)}
              >
                {s}
              </button>
            ))}
            {showAjouter && (
              <button 
                className="multi-select-option multi-select-option-new" 
                type="button" 
                onClick={handleAjouterSaisie}
              >
                + Ajouter « {saisie.trim()} »
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ActivityFormModal ──────────────────────────────────────────

export function ActivityFormModal({ onClose, onSave, activites, initialData }) {
  const modeEdition = !!initialData;
  const [form, setForm] = React.useState(() => {
    if (initialData) {
      return {
        titre: initialData.titre || "",
        age_public: initialData.age_public || initialData.public || [],
        duree: initialData.duree || "30-45min",
        taille_groupe: initialData.taille_groupe || initialData.groupe || [],
        themes: initialData.themes || [],
        materiels: initialData.materiels || [],
        modalite: initialData.modalite || [],
        methode: initialData.methode || (initialData.type_fiche === "Activite_Evaluation" || initialData.type_fiche === "Évaluation" || initialData.type_fiche === "Evaluation" ? "evaluation" : "active"),
        opo_activite: initialData.opo_activite || "",
        description: initialData.description || "",
        apprentissage_cle: initialData.apprentissage_cle || "",
        eval_type: initialData.eval_type || "Formative",
        eval_modalite: initialData.eval_modalite || "",
        eval_conditions: initialData.eval_conditions || "",
        eval_criteres: initialData.eval_criteres || "",
        problematique: initialData.problematique || "",
        remediation: initialData.remediation || "",
      };
    }
    return {
      titre: "",
      age_public: [],
      duree: "30-45min",
      taille_groupe: [],
      themes: [],
      materiels: [],
      modalite: [],
      methode: "active",
      opo_activite: "",
      description: "",
      apprentissage_cle: "",
      eval_type: "Formative",
      eval_modalite: "",
      eval_conditions: "",
      eval_criteres: "",
      problematique: "",
      remediation: "",
    };
  });

  const [erreurs, setErreurs] = React.useState({});

  const tousThemes = React.useMemo(() => extraireTagsUniques(activites, "themes"), [activites]);
  const tousMaterialels = React.useMemo(() => extraireTagsUniques(activites, "materiels"), [activites]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErreurs((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleMulti(key, value) {
    setForm((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  function toggleKeyword(key, value) {
    setForm((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((t) => t !== value) : [...arr, value],
      };
    });
  }

  function ajouterKeyword(key, valeur, setValeur) {
    const t = valeur.trim();
    if (!t) return;
    if (!form[key].includes(t)) {
      setForm((prev) => ({ ...prev, [key]: [...prev[key], t] }));
    }
    setValeur("");
  }

  function valider() {
    const e = {};
    if (!form.titre.trim()) e.titre = "Le titre est obligatoire.";
    setErreurs(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!valider()) return;
    onSave(form);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-add" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-eyebrow">{modeEdition ? `Modifier · ${initialData.id}` : "Nouvelle activité personnalisée"}</div>
        <h2 className="modal-title">{modeEdition ? "Modifier l'activité" : "Créer une activité"}</h2>

        <div className="form-group">
          <label className="form-label">Titre <span className="form-required">*</span></label>
          <input
            className={`form-input ${erreurs.titre ? "form-input-error" : ""}`}
            type="text"
            placeholder="Titre de l'activité"
            value={form.titre}
            onChange={(e) => setField("titre", e.target.value)}
          />
          {erreurs.titre && <div className="form-error">{erreurs.titre}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Âge du public</label>
          <div className="form-chips">
            {AGES_DISPONIBLES.map((p) => (
              <button
                key={p}
                className={`form-chip ${form.age_public.includes(p) ? "form-chip-active" : ""}`}
                onClick={() => toggleMulti("age_public", p)}
                type="button"
              >{p}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Durée <span className="form-required">*</span></label>
          <div className="form-chips">
            {DUREES_DISPONIBLES.map((d) => (
              <button
                key={d}
                className={`form-chip ${form.duree === d ? "form-chip-active" : ""}`}
                onClick={() => setField("duree", d)}
                type="button"
              >{d}</button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Taille de groupe</label>
            <div className="form-chips">
              {TAILLES_GROUPE_DISPONIBLES.map((g) => (
                <button
                  key={g}
                  className={`form-chip ${form.taille_groupe.includes(g) ? "form-chip-active" : ""}`}
                  onClick={() => toggleMulti("taille_groupe", g)}
                  type="button"
                >{g}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Modalité</label>
            <div className="form-chips">
              {MODALITES_DISPONIBLES.map((m) => (
                <button
                  key={m}
                  className={`form-chip ${form.modalite.includes(m) ? "form-chip-active" : ""}`}
                  onClick={() => toggleMulti("modalite", m)}
                  type="button"
                >{m}</button>
              ))}
            </div>
          </div>
        </div>

        <CreatableMultiSelect
          label="Thèmes"
          valeurs={form.themes}
          suggestionsDisponibles={tousThemes}
          onToggle={(t) => toggleKeyword("themes", t)}
          onAjouter={(val) => {
            if (!form.themes.includes(val)) {
              setForm(prev => ({ ...prev, themes: [...prev.themes, val] }));
            }
          }}
        />

        <CreatableMultiSelect
          label="Matériels nécessaires"
          valeurs={form.materiels}
          suggestionsDisponibles={tousMaterialels}
          onToggle={(t) => toggleKeyword("materiels", t)}
          onAjouter={(val) => {
            if (!form.materiels.includes(val)) {
              setForm(prev => ({ ...prev, materiels: [...prev.materiels, val] }));
            }
          }}
        />

        <div className="form-group">
          <label className="form-label">Méthode</label>
          <div className="form-toggle">
            <button type="button"
              className={`form-toggle-btn${form.methode === "active" ? " form-toggle-btn-active" : ""}`}
              onClick={() => setField("methode", "active")}
            >Active</button>
            <button type="button"
              className={`form-toggle-btn${form.methode === "expositive" ? " form-toggle-btn-active" : ""}`}
              onClick={() => setField("methode", "expositive")}
            >Expositive</button>
            <button type="button"
              className={`form-toggle-btn${form.methode === "evaluation" ? " form-toggle-btn-active" : ""}`}
              onClick={() => setField("methode", "evaluation")}
            >Évaluation</button>
          </div>
        </div>

        <div className="form-madlibs">
          <span className="form-madlibs-label">À l'issue de cette activité, l'apprenant sera capable de :</span>
          <div className="form-madlibs-row">
            <input className="form-input" type="text"
              placeholder="décrire l'action attendue..."
              value={form.opo_activite}
              onChange={(e) => setField("opo_activite", e.target.value)} />
          </div>
          {form.methode !== "evaluation" && (
            <textarea className="form-textarea" placeholder="Ce que les participants retiennent"
              rows={2} value={form.apprentissage_cle}
              onChange={(e) => setField("apprentissage_cle", e.target.value)} />
          )}
        </div>

        {form.methode !== "evaluation" && (
          <div className="form-group">
            <label className="form-label">Description complète</label>
            <textarea className="form-textarea" placeholder="Déroulé détaillé de l'activité"
              rows={4} value={form.description}
              onChange={(e) => setField("description", e.target.value)} />
          </div>
        )}

        {form.methode === "evaluation" && (
          <div className="form-eval-section">
            <div className="form-eval-section-title">Paramètres de l'évaluation</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={form.eval_type}
                  onChange={(e) => setField("eval_type", e.target.value)}>
                  <option value="Formative">Formative</option>
                  <option value="Sommative">Sommative</option>
                  <option value="Diagnostique">Diagnostique</option>
                  <option value="Certificative">Certificative</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Modalité</label>
                <select className="form-input" value={form.eval_modalite}
                  onChange={(e) => setField("eval_modalite", e.target.value)}>
                  <option value="">— Choisir —</option>
                  <option value="QCM">QCM</option>
                  <option value="Mise en situation">Mise en situation</option>
                  <option value="Livrable">Livrable</option>
                  <option value="Soutenance">Soutenance</option>
                  <option value="Observation">Observation</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Conditions <span className="form-hint">(temps, matériel…)</span></label>
              <input className="form-input" type="text"
                placeholder="ex : 30min, papier-crayon uniquement"
                value={form.eval_conditions}
                onChange={(e) => setField("eval_conditions", e.target.value)} />
            </div>
            <div className="form-group form-group-last">
              <label className="form-label">Critères de réussite</label>
              <textarea className="form-textarea" placeholder="Qu'est-ce qui démontre la maîtrise ?"
                rows={3} value={form.eval_criteres}
                onChange={(e) => setField("eval_criteres", e.target.value)} />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Problématique possible</label>
          <textarea className="form-textarea"
            placeholder="Difficultés ou obstacles fréquents rencontrés lors de cette activité"
            rows={2} value={form.problematique}
            onChange={(e) => setField("problematique", e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Remédiation</label>
          <textarea className="form-textarea"
            placeholder="Pistes pour surmonter les difficultés identifiées"
            rows={2} value={form.remediation}
            onChange={(e) => setField("remediation", e.target.value)} />
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={handleSave}>{modeEdition ? "✔ Enregistrer les modifications" : "✚ Enregistrer l'activité"}</button>
          <button className="btn-reset modal-annuler" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}
