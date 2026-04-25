import React from "react";
import "../styles/modal.css";

// ── Constantes formulaire ──────────────────────────────────────

const PUBLICS_DISPONIBLES = ["7-10", "11-15", "16-20", "Post-bac", "Adultes"];
const DUREES_DISPONIBLES = ["<30min", "30-60min", "1-2h", "2-4h", "Projet"];
const GROUPES_DISPONIBLES = ["Petit", "Moyen", "Grand"];
const PREPARATIONS_DISPONIBLES = ["Légère", "Moyenne", "Importante"];
const CONTEXTES_DISPONIBLES = ["Scolaire", "Études sup.", "Entreprise"];

// ── Utilitaire ID ──────────────────────────────────────────────

export function genererIdCustom(activitesCustom) {
  const nums = activitesCustom
    .map((a) => {
      const m = a.id.match(/^CUS-(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter(Boolean);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `CUS-${String(next).padStart(3, "0")}`;
}

// ── Parsers d'import ───────────────────────────────────────────

function parserJSON(texte) {
  const data = JSON.parse(texte);
  const liste = Array.isArray(data) ? data : (Array.isArray(data.activites) ? data.activites : null);
  if (!liste) throw new Error("Format JSON non reconnu. Attendu : un tableau ou { activites: [...] }");

  const CHAMPS_REQUIS = ["titre", "public", "duree", "groupe", "preparation", "themes", "contexte", "description_courte", "description", "apprentissage_cle"];
  return liste.map((a, i) => {
    for (const c of CHAMPS_REQUIS) {
      if (a[c] === undefined || a[c] === null) throw new Error(`Activité ${i + 1} : champ manquant « ${c} »`);
    }
    const normaliserTableau = (v) => Array.isArray(v) ? v : (v ? [v] : []);
    return {
      id: a.id || null,
      titre: String(a.titre).trim(),
      public: normaliserTableau(a.public),
      duree: String(a.duree).trim(),
      duree_detail: a.duree_detail || null,
      groupe: normaliserTableau(a.groupe),
      preparation: String(a.preparation).trim(),
      themes: normaliserTableau(a.themes),
      contexte: normaliserTableau(a.contexte),
      description_courte: String(a.description_courte).trim(),
      description: String(a.description).trim(),
      apprentissage_cle: String(a.apprentissage_cle).trim(),
    };
  });
}

function parserMarkdown(texte) {
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

    const publicStr = extraireChamp("Public");
    const dureeStr = extraireChamp("Durée");
    const groupeStr = extraireChamp("Groupe");
    const preparation = extraireChamp("Préparation");
    const themesStr = extraireChamp("Thèmes");
    const contexteStr = extraireChamp("Contexte");

    const idxDesc = lignes.findIndex((l) => /^###\s+Description/.test(l));
    const idxApp = lignes.findIndex((l) => /^###\s+Apprentissage/.test(l));
    let description = "";
    if (idxDesc !== -1 && idxApp !== -1) {
      description = lignes.slice(idxDesc + 1, idxApp).join("\n").trim();
    }

    let apprentissage_cle = "";
    if (idxApp !== -1) {
      apprentissage_cle = lignes.slice(idxApp + 1)
        .map((l) => l.replace(/^>\s*/, "").trim())
        .filter(Boolean)
        .join(" ");
    }

    const splitter = (s) => s ? s.split(/\s*[,|]\s*/).map((x) => x.trim()).filter(Boolean) : [];

    const DUREES_OK = ["<30min", "30-60min", "1-2h", "2-4h", "Projet"];
    const duree = DUREES_OK.includes(dureeStr) ? dureeStr : (DUREES_OK.find((d) => dureeStr.includes(d)) || "<30min");
    const duree_detail = dureeStr !== duree ? dureeStr : null;

    if (!titre) continue;

    activites.push({
      id,
      titre,
      public: splitter(publicStr),
      duree,
      duree_detail,
      groupe: splitter(groupeStr),
      preparation,
      themes: splitter(themesStr),
      contexte: splitter(contexteStr),
      description_courte: description.split(".")[0]?.trim() || description.slice(0, 100),
      description,
      apprentissage_cle,
    });
  }

  if (activites.length === 0) throw new Error("Aucune activité reconnue dans ce fichier Markdown.");
  return activites;
}

// ── ChoixImportModal ───────────────────────────────────────────

export function ChoixImportModal({ onClose, onManuel, onImport, onChargerCatalogueBase }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-choix" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-eyebrow">Nouvelle activité</div>
        <h2 className="modal-title">Comment voulez-vous ajouter ?</h2>
        <p className="modal-choix-desc">
          Créez une activité en la saisissant manuellement, importez un fichier, ou chargez le catalogue de base.
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
            <span className="choix-import-desc">Charger un fichier .json ou .md avec plusieurs activités</span>
          </button>
          <button className="choix-import-card choix-import-card-base" onClick={onChargerCatalogueBase}>
            <span className="choix-import-icon">📚</span>
            <span className="choix-import-label">Catalogue de base</span>
            <span className="choix-import-desc">Charger les 105 activités pédagogiques intégrées</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ImportFichierModal ─────────────────────────────────────────

export function ImportFichierModal({ onClose, onImport }) {
  const [etat, setEtat] = React.useState("idle");
  const [erreur, setErreur] = React.useState("");
  const [preview, setPreview] = React.useState([]);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef(null);

  function lireFichier(fichier) {
    if (!fichier) return;
    const ext = fichier.name.split(".").pop().toLowerCase();
    if (!["json", "md", "markdown"].includes(ext)) {
      setErreur(`Format non supporté : .${ext}. Utilisez .json ou .md`);
      setEtat("erreur");
      return;
    }
    setEtat("lecture");
    setErreur("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const texte = e.target.result;
        const activites = ext === "json" ? parserJSON(texte) : parserMarkdown(texte);
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
        <h2 className="modal-title">Import JSON ou Markdown</h2>

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
              <span className="import-dropzone-hint">.json ou .md acceptés</span>
              <input
                ref={inputRef}
                type="file"
                accept=".json,.md,.markdown"
                className="import-file-hidden"
                onChange={handleChange}
              />
            </div>
            <div className="import-formats">
              <div className="import-format-block">
                <div className="import-format-title">Format JSON attendu</div>
                <pre className="import-format-code">{`[
  {
    "titre": "Nom de l'activité",
    "public": ["11-15", "16-20"],
    "duree": "30-60min",
    "groupe": ["Moyen"],
    "preparation": "Légère",
    "themes": ["IA déconnecté"],
    "contexte": ["Scolaire"],
    "description_courte": "...",
    "description": "...",
    "apprentissage_cle": "..."
  }
]`}</pre>
              </div>
              <div className="import-format-block">
                <div className="import-format-title">Format Markdown (export catalogue)</div>
                <pre className="import-format-code">{`## 1. Titre de l'activité \`ID\`

**Public :** 11-15, 16-20
**Durée :** 30-60min
**Groupe :** Moyen
**Préparation :** Légère
**Thèmes :** IA déconnecté
**Contexte :** Scolaire

### Description

Déroulé de l'activité...

### Apprentissage clé

> Ce que les participants retiennent.

---`}</pre>
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
                      {a.public.join(", ")} · {a.duree}
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

// ── ActivityFormModal ──────────────────────────────────────────

export function ActivityFormModal({ onClose, onSave, tousThemes, initialData }) {
  const modeEdition = !!initialData;
  const [form, setForm] = React.useState(() => {
    if (initialData) {
      return {
        titre: initialData.titre || "",
        public: initialData.public || [],
        duree: initialData.duree || "<30min",
        duree_detail: initialData.duree_detail || "",
        groupe: initialData.groupe || ["Moyen"],
        preparation: initialData.preparation || "Légère",
        themes: initialData.themes || [],
        contexte: initialData.contexte || [],
        description_courte: initialData.description_courte || "",
        description: initialData.description || "",
        apprentissage_cle: initialData.apprentissage_cle || "",
      };
    }
    return {
      titre: "",
      public: [],
      duree: "<30min",
      duree_detail: "",
      groupe: ["Moyen"],
      preparation: "Légère",
      themes: [],
      contexte: [],
      description_courte: "",
      description: "",
      apprentissage_cle: "",
    };
  });
  const [nouveauTheme, setNouveauTheme] = React.useState("");
  const [erreurs, setErreurs] = React.useState({});

  const themesTriés = [...tousThemes].sort((a, b) => {
    if (a === "IA déconnecté") return -1;
    if (b === "IA déconnecté") return 1;
    return a.localeCompare(b, "fr");
  });

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
    setErreurs((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleTheme(theme) {
    setForm((prev) => {
      const arr = prev.themes;
      return {
        ...prev,
        themes: arr.includes(theme) ? arr.filter((t) => t !== theme) : [...arr, theme],
      };
    });
    setErreurs((prev) => ({ ...prev, themes: undefined }));
  }

  function ajouterNouveauTheme() {
    const t = nouveauTheme.trim();
    if (!t) return;
    if (!form.themes.includes(t)) {
      setForm((prev) => ({ ...prev, themes: [...prev.themes, t] }));
    }
    setNouveauTheme("");
    setErreurs((prev) => ({ ...prev, themes: undefined }));
  }

  function valider() {
    const e = {};
    if (!form.titre.trim()) e.titre = "Le titre est obligatoire.";
    if (form.public.length === 0) e.public = "Sélectionnez au moins un public.";
    if (form.themes.length === 0) e.themes = "Sélectionnez ou créez au moins un thème.";
    if (form.contexte.length === 0) e.contexte = "Sélectionnez au moins un contexte.";
    if (!form.description_courte.trim()) e.description_courte = "La description courte est obligatoire.";
    if (!form.description.trim()) e.description = "La description est obligatoire.";
    if (!form.apprentissage_cle.trim()) e.apprentissage_cle = "L'apprentissage clé est obligatoire.";
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
          <label className="form-label">Public <span className="form-required">*</span></label>
          <div className="form-chips">
            {PUBLICS_DISPONIBLES.map((p) => (
              <button
                key={p}
                className={`form-chip ${form.public.includes(p) ? "form-chip-active" : ""}`}
                onClick={() => toggleMulti("public", p)}
                type="button"
              >{p}</button>
            ))}
          </div>
          {erreurs.public && <div className="form-error">{erreurs.public}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Durée</label>
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
          <div className="form-group">
            <label className="form-label">Précision durée <span className="form-hint">(optionnel)</span></label>
            <input
              className="form-input"
              type="text"
              placeholder="ex : 30min (enfants) / 1h (adultes)"
              value={form.duree_detail}
              onChange={(e) => setField("duree_detail", e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Taille du groupe</label>
            <div className="form-chips">
              {GROUPES_DISPONIBLES.map((g) => (
                <button
                  key={g}
                  className={`form-chip ${form.groupe.includes(g) ? "form-chip-active" : ""}`}
                  onClick={() => toggleMulti("groupe", g)}
                  type="button"
                >{g}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Préparation</label>
            <div className="form-chips">
              {PREPARATIONS_DISPONIBLES.map((p) => (
                <button
                  key={p}
                  className={`form-chip ${form.preparation === p ? "form-chip-active" : ""}`}
                  onClick={() => setField("preparation", p)}
                  type="button"
                >{p}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Thèmes <span className="form-required">*</span></label>

          {themesTriés.length > 0 && (
            <div className="form-chips form-chips-mb">
              {themesTriés.map((t) => (
                <button
                  key={t}
                  className={`form-chip ${form.themes.includes(t) ? "form-chip-active" : ""}`}
                  onClick={() => toggleTheme(t)}
                  type="button"
                >{t}</button>
              ))}
            </div>
          )}

          {form.themes.length > 0 && (
            <div className="form-themes-selected">
              {form.themes.map((t) => (
                <span key={t} className="form-theme-chip">
                  {t}
                  <button onClick={() => toggleTheme(t)} className="form-theme-chip-remove">×</button>
                </span>
              ))}
            </div>
          )}

          <div className="form-new-theme">
            <input
              className="form-input"
              type="text"
              placeholder="Créer un nouveau thème…"
              value={nouveauTheme}
              onChange={(e) => setNouveauTheme(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); ajouterNouveauTheme(); } }}
            />
            <button
              className="btn-add-theme"
              onClick={ajouterNouveauTheme}
              type="button"
              disabled={!nouveauTheme.trim()}
            >Ajouter</button>
          </div>
          {erreurs.themes && <div className="form-error">{erreurs.themes}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Contexte <span className="form-required">*</span></label>
          <div className="form-chips">
            {CONTEXTES_DISPONIBLES.map((c) => (
              <button
                key={c}
                className={`form-chip ${form.contexte.includes(c) ? "form-chip-active" : ""}`}
                onClick={() => toggleMulti("contexte", c)}
                type="button"
              >{c}</button>
            ))}
          </div>
          {erreurs.contexte && <div className="form-error">{erreurs.contexte}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Description courte <span className="form-required">*</span></label>
          <input
            className={`form-input ${erreurs.description_courte ? "form-input-error" : ""}`}
            type="text"
            placeholder="1-2 phrases pour la carte"
            value={form.description_courte}
            onChange={(e) => setField("description_courte", e.target.value)}
          />
          {erreurs.description_courte && <div className="form-error">{erreurs.description_courte}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Description complète <span className="form-required">*</span></label>
          <textarea
            className={`form-textarea ${erreurs.description ? "form-input-error" : ""}`}
            placeholder="Déroulé détaillé de l'activité"
            rows={4}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
          {erreurs.description && <div className="form-error">{erreurs.description}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Apprentissage clé <span className="form-required">*</span></label>
          <textarea
            className={`form-textarea ${erreurs.apprentissage_cle ? "form-input-error" : ""}`}
            placeholder="Ce que les participants retiennent"
            rows={2}
            value={form.apprentissage_cle}
            onChange={(e) => setField("apprentissage_cle", e.target.value)}
          />
          {erreurs.apprentissage_cle && <div className="form-error">{erreurs.apprentissage_cle}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={handleSave}>{modeEdition ? "✔ Enregistrer les modifications" : "✚ Enregistrer l'activité"}</button>
          <button className="btn-reset modal-annuler" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}
