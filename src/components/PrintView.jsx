import React from "react";
import "../styles/card.css";

const DUREE_PLAGES = {
  "0-15min":  { min: 0,  max: 15  },
  "15-30min": { min: 15, max: 30  },
  "30-45min": { min: 30, max: 45  },
  "45-60min": { min: 45, max: 60  },
  ">60min":   null,
};

function parseDureeStr(str) {
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

function fmtMin(m) {
  if (m === 0) return "0min";
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h${String(min).padStart(2, "0")}`;
}

function dureeActivite(a) {
  const plage = DUREE_PLAGES[a.duree];
  if (plage === null) return { min: 0, max: 0, open: true };
  if (plage) return { min: plage.min, max: plage.max, open: false };
  const mn = parseDureeStr(a.duree_detail || a.duree);
  if (mn !== null) return { min: mn, max: mn, open: false };
  return { min: 0, max: 0, open: false };
}

function sumDuree(liste) {
  let min = 0, max = 0, open = false;
  for (const a of liste) {
    const d = dureeActivite(a);
    min += d.min; max += d.max;
    if (d.open) open = true;
  }
  return { min, max, open };
}

function formatDuree({ min, max, open }) {
  if (min === 0 && max === 0 && !open) return null;
  const range = min === max ? fmtMin(min) : `${fmtMin(min)} – ${fmtMin(max)}`;
  return open ? `${range} + variable` : range;
}

function FicheActivite({ activite, num }) {
  const a = activite;
  const isEval = a.type_fiche === "Évaluation" || a.type_fiche === "Evaluation";
  return (
    <div className="print-fiche">
      <div className="print-fiche-header">
        <div className="print-fiche-header-left">
          <span className="print-fiche-num">{num}</span>
          <h2 className="print-fiche-titre">{a.titre}</h2>
        </div>
        <div className="print-fiche-header-right">
          {isEval && <span className="print-fiche-badge-eval">Évaluation</span>}
          {(a.modalite || []).length > 0 && (
            <span className="print-fiche-modalite">{(a.modalite || []).join(" · ")}</span>
          )}
          <span className="print-fiche-duree">{a.duree_detail || a.duree}</span>
        </div>
      </div>
      {(a.materiels || []).length > 0 && (
        <div className="print-fiche-meta-grid">
          <div className="print-fiche-meta-item">
            <div className="print-fiche-meta-label">Matériels</div>
            <div className="print-fiche-meta-value">{(a.materiels || []).join(", ")}</div>
          </div>
        </div>
      )}
      {isEval ? (
        <>
          {a.eval_type && (
            <div className="print-fiche-section">
              <div className="print-fiche-section-label">Type d'évaluation</div>
              <p className="print-fiche-body">{a.eval_type}</p>
            </div>
          )}
          {a.eval_modalite && (
            <div className="print-fiche-section">
              <div className="print-fiche-section-label">Modalité</div>
              <p className="print-fiche-body">{a.eval_modalite}</p>
            </div>
          )}
          {a.eval_conditions && (
            <div className="print-fiche-section">
              <div className="print-fiche-section-label">Conditions de réalisation</div>
              <p className="print-fiche-body">{a.eval_conditions}</p>
            </div>
          )}
          {a.eval_criteres && (
            <div className="print-fiche-eval-criteres">
              <div className="print-fiche-section-label">Critères de réussite</div>
              <p className="print-fiche-body">{a.eval_criteres}</p>
            </div>
          )}
        </>
      ) : (
        <>
          {a.description && (
            <div className="print-fiche-section">
              <div className="print-fiche-section-label">Description</div>
              <p className="print-fiche-body">{a.description}</p>
            </div>
          )}
          {a.apprentissage_cle && (
            <div className="print-fiche-apprentissage">
              <div className="print-fiche-section-label">Apprentissage clé</div>
              <p className="print-fiche-apprentissage-text">« {a.apprentissage_cle} »</p>
            </div>
          )}
          {a.problematique && (
            <div className="print-fiche-section">
              <div className="print-fiche-section-label">Problématique possible</div>
              <p className="print-fiche-body">{a.problematique}</p>
            </div>
          )}
          {a.remediation && (
            <div className="print-fiche-section">
              <div className="print-fiche-section-label">Remédiation</div>
              <p className="print-fiche-body">{a.remediation}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PrintView({ programme, activites }) {
  if (!programme || (programme.sequences ?? []).length === 0) return null;

  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const toutesAct = [];
  for (const seq of programme.sequences) {
    for (const sea of seq.seances ?? []) {
      for (const fiche of sea.fiches ?? []) {
        const a = activites.find(x => x.id === fiche.activite_id);
        if (a) toutesAct.push(a);
      }
    }
  }
  const dureeTotal = formatDuree(sumDuree(toutesAct));

  return (
    <div className="print-view">
      <div className="print-doc-header">
        <div className="print-doc-eyebrow">SEQUENCIA</div>
        <h1 className="print-doc-title">{programme.titre || "Mon programme"}</h1>
        <div className="print-doc-meta">
          <span>Exporté le {date}</span>
          {dureeTotal && (
            <>
              <span className="print-doc-meta-sep">·</span>
              <span>{dureeTotal}</span>
            </>
          )}
        </div>
      </div>

      <div className="print-programme-objectif">
        <div className="print-hier-label">Objectif opérationnel du programme</div>
        {(programme.objectif_bloom || programme.objectif_action) ? (
          <p className="print-hier-value">
            À l'issue de cette formation, l'apprenant sera capable de :{" "}
            <strong>{[programme.objectif_bloom, programme.objectif_action].filter(Boolean).join(" ")}</strong>
          </p>
        ) : (
          <span className="print-blank-line" />
        )}
        {programme.objectif_final?.trim() && (
          <div className="print-criteres-bloc">
            <div className="print-hier-label">Critères d'acquisition</div>
            <p className="print-hier-value">La compétence sera acquise si : {programme.objectif_final}</p>
          </div>
        )}
      </div>

      {programme.sequences.map((seq, seqIdx) => {
        const seqAct = [];
        for (const sea of seq.seances ?? []) {
          for (const fiche of sea.fiches ?? []) {
            const a = activites.find(x => x.id === fiche.activite_id);
            if (a) seqAct.push(a);
          }
        }
        const dureeSeq = formatDuree(sumDuree(seqAct));

        return (
          <div key={seq.id} className="print-sequence-section">
            <div className="print-sequence-header">
              <span className="print-sequence-eyebrow">Séquence {seqIdx + 1}</span>
              <h2 className="print-sequence-titre">{seq.titre}</h2>
              {dureeSeq && <span className="print-hier-duree">{dureeSeq}</span>}
            </div>

            <div className="print-sequence-objectif">
              <div className="print-hier-label">Objectif opérationnel</div>
              {(seq.objectif_bloom || seq.objectif_action) ? (
                <p className="print-hier-value">
                  À l'issue de cette séquence, l'apprenant sera capable de :{" "}
                  <strong>{[seq.objectif_bloom, seq.objectif_action].filter(Boolean).join(" ")}</strong>
                </p>
              ) : (
                <span className="print-blank-line" />
              )}
              {seq.objectif_competence?.trim() && (
                <div className="print-criteres-bloc">
                  <div className="print-hier-label">Critères d'acquisition</div>
                  <p className="print-hier-value">La compétence sera acquise si : {seq.objectif_competence}</p>
                </div>
              )}
            </div>

            {(seq.seances ?? []).map((sea, seaIdx) => {
              const seaAct = (sea.fiches ?? [])
                .map(f => activites.find(a => a.id === f.activite_id))
                .filter(Boolean);
              const dureeSea = formatDuree(sumDuree(seaAct));

              const opoPhrase = [sea.opo_bloom, sea.opo_verbe].filter(Boolean).join(" ");

              return (
                <div key={sea.id} className="print-seance-section">
                  <div className="print-seance-header">
                    <span className="print-seance-num">{seqIdx + 1}.{seaIdx + 1}</span>
                    <h3 className="print-seance-titre">{sea.titre}</h3>
                    {dureeSea && <span className="print-hier-duree">{dureeSea}</span>}
                  </div>

                  <div className="print-seance-opo">
                    <span className="print-seance-opo-type">{sea.opo_type || "Savoir"}</span>
                    {opoPhrase ? (
                      <span className="print-seance-opo-verbe">
                        À l'issue de cette séance, l'apprenant sera capable de : <strong>{opoPhrase}</strong>
                      </span>
                    ) : (
                      <span className="print-seance-opo-verbe print-seance-opo-vide">— À définir —</span>
                    )}
                  </div>

                  <div className="print-seance-fiches">
                    {seaAct.length === 0 ? (
                      <p className="print-seance-vide">Aucune activité assignée à cette séance.</p>
                    ) : (
                      seaAct.map((a, i) => (
                        <FicheActivite key={a.id} activite={a} num={i + 1} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="print-doc-footer">
        {programme.titre || "Mon programme"}{dureeTotal ? ` · ${dureeTotal}` : ""}
      </div>
    </div>
  );
}
