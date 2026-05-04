import React from "react";
import "../styles/card.css";

import { sumDureeItems, formatDureeGlobale, parseDureeActivite } from "../utils/duree";
import PrintViewQualiopi from "./PrintViewQualiopi";

function QRCodeImage({ url, size = 64 }) {
  const [src, setSrc] = React.useState(null);
  React.useEffect(() => {
    if (!url?.trim()) { setSrc(null); return; }
    let cancelled = false;
    import("qrcode").then(mod =>
      mod.default.toDataURL(url, { margin: 1, width: size, errorCorrectionLevel: "M" })
    ).then(dataUrl => { if (!cancelled) setSrc(dataUrl); }).catch(() => {});
    return () => { cancelled = true; };
  }, [url, size]);
  if (!src) return null;
  return <img src={src} width={size} height={size} alt="QR Code" style={{ display: "block" }} />;
}

function LiensQR({ activite: a }) {
  const liens = (a.liens_qr || []).filter(l => l.url?.trim());
  if (liens.length === 0 && a.lien_qr?.trim()) liens.push({ url: a.lien_qr, label: "" });
  if (liens.length === 0) return null;
  return (
    <div className="print-fiche-qr-group">
      {liens.map((lien, i) => (
        <div key={i} className="print-fiche-qr">
          <QRCodeImage url={lien.url} size={64} />
          {lien.label && <span className="print-fiche-qr-label">{lien.label}</span>}
          <span className="print-fiche-qr-url">{lien.url}</span>
        </div>
      ))}
    </div>
  );
}

function EncartTexte({ fiche, num }) {
  return (
    <div className="print-fiche print-fiche-texte">
      <div className="print-fiche-header">
        <div className="print-fiche-header-left">
          <span className="print-fiche-num">{num}</span>
          <h2 className="print-fiche-titre">{fiche.titre || "Encart"}</h2>
        </div>
      </div>
      {fiche.duree_min > 0 && (
        <div className="print-fiche-meta-grid">
          <div className="print-fiche-meta-item">
            <div className="print-fiche-meta-label">Temps</div>
            <div className="print-fiche-meta-value">{fiche.duree_min} min</div>
          </div>
        </div>
      )}
      {fiche.contenu?.trim() && (
        <p className="print-fiche-body">{fiche.contenu}</p>
      )}
    </div>
  );
}

function FicheActivite({ activite: a, num }) {
  const isEval = a.methode === "evaluation" || a.type_fiche === "Activite_Evaluation" || a.type_fiche === "Évaluation" || a.type_fiche === "Evaluation";
  return (
    <div className="print-fiche">
      <div className="print-fiche-header">
        <div className="print-fiche-header-left">
          <span className="print-fiche-num">{num}</span>
          <h2 className="print-fiche-titre">{a.titre}</h2>
        </div>
      </div>
      <div className="print-fiche-meta-grid">
        {isEval && (
          <div className="print-fiche-meta-item">
            <div className="print-fiche-meta-label">Type</div>
            <div className="print-fiche-meta-value">Évaluation</div>
          </div>
        )}
        {(a.modalite || []).length > 0 && (
          <div className="print-fiche-meta-item">
            <div className="print-fiche-meta-label">Modalité</div>
            <div className="print-fiche-meta-value">{(a.modalite || []).join(" · ")}</div>
          </div>
        )}
        <div className="print-fiche-meta-item">
          <div className="print-fiche-meta-label">Temps</div>
          <div className="print-fiche-meta-value">{a.duree}</div>
        </div>
        {(a.materiels || []).length > 0 && (
          <div className="print-fiche-meta-item">
            <div className="print-fiche-meta-label">Matériels</div>
            <div className="print-fiche-meta-value">{(a.materiels || []).join(", ")}</div>
          </div>
        )}
      </div>
      <LiensQR activite={a} />
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
      {a.adaptation_psh && (
        <div className="print-fiche-section">
          <div className="print-fiche-section-label">Adaptation Handicap (PSH)</div>
          <p className="print-fiche-body">{a.adaptation_psh}</p>
        </div>
      )}
    </div>
  );
}

export default function PrintView({ programme, activites, printMode = "standard" }) {
  if (!programme || (programme.sequences ?? []).length === 0) return null;

  if (printMode === "qualiopi") {
    return <PrintViewQualiopi programme={programme} activites={activites} />;
  }

  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const allFiches = (programme.sequences ?? []).flatMap(seq =>
    (seq.seances ?? []).flatMap(sea => sea.fiches ?? [])
  );
  const dureeTotal = formatDureeGlobale(sumDureeItems(allFiches, activites));

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

      {programme.prerequis?.trim() && (
        <div className="print-programme-objectif">
          <div className="print-hier-label">Prérequis</div>
          <p className="print-hier-value">{programme.prerequis}</p>
        </div>
      )}

      {programme.sequences.map((seq, seqIdx) => {
        const seqFiches = (seq.seances ?? []).flatMap(sea => sea.fiches ?? []);
        const dureeSeq = formatDureeGlobale(sumDureeItems(seqFiches, activites));

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
              const dureeSea = formatDureeGlobale(sumDureeItems(sea.fiches ?? [], activites));
              const opoPhrase = [sea.opo_bloom, sea.opo_verbe].filter(Boolean).join(" ");

              const ficheItems = (sea.fiches ?? []).map(f => {
                if (f.type === "texte") return { key: f.id, type: "texte", fiche: f };
                const a = activites.find(x => x.id === f.activite_id);
                return a ? { key: f.id, type: "activite", activite: a } : null;
              }).filter(Boolean);

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
                    {ficheItems.length === 0 ? (
                      <p className="print-seance-vide">Aucune activité assignée à cette séance.</p>
                    ) : (
                      ficheItems.map((item, i) =>
                        item.type === "texte"
                          ? <EncartTexte key={item.key} fiche={item.fiche} num={i + 1} />
                          : <FicheActivite key={item.key} activite={item.activite} num={i + 1} />
                      )
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
